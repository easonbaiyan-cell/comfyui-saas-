import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // In Next 15+ App router, params is async
) {
  try {
    // 1. Authenticate User
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = await verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const taskId = resolvedParams.id;
    const userId = decoded.userId as string;

    // 2. Fetch Task
    let task = await prisma.task.findUnique({ where: { id: taskId } });
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    if (task.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If task is already terminal, just return it
    if (task.status === 'SUCCESS' || task.status === 'FAILED') {
      return NextResponse.json({ success: true, task });
    }

    // 3. Poll RunningHub API for real-time status
    const apiKey = process.env.RUNNINGHUB_API_KEY || 'mock-key';
    let rhStatus = 'RUNNING'; // Default mock status
    let rhProgress = 50;
    let rhOutputs = null;
    let rhError = null;

    if (task.runningHubTaskId && !task.runningHubTaskId.startsWith('rh-mock-')) {
      try {
        const response = await fetch(`https://mock-runninghub-endpoint/openapi/task/${task.runningHubTaskId}`, {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Assuming data mapping from RunningHub API
          rhStatus = data.status; // e.g., 'SUCCESS', 'FAILED', 'RUNNING'
          rhProgress = data.progress || 0;
          rhOutputs = data.outputs || null;
          rhError = data.error || null;
        }
      } catch (apiError) {
        console.warn('Failed to poll RunningHub API, retaining current status.');
        rhStatus = task.status;
      }
    } else {
      // Simulation: Mock completion logic for development
      const timeElapsed = Date.now() - new Date(task.createdAt).getTime();
      if (timeElapsed > 15000) { // Simulate success after 15 seconds
        rhStatus = 'SUCCESS';
        rhProgress = 100;
        rhOutputs = {
          images: [{ url: 'https://via.placeholder.com/512' }]
        };
      } else if (timeElapsed > 5000) {
        rhProgress = Math.floor(timeElapsed / 15000 * 100);
      }
    }

    // 4. Update Database based on polled status
    if (rhStatus === 'SUCCESS') {
      task = await prisma.$transaction(async (tx) => {
        // Log permanent deduction
        await tx.creditLedger.create({
          data: {
            userId,
            taskId: task!.id,
            amount: task!.creditCost,
            type: 'DEDUCT',
            description: `Permanently deducted credits for completed task`
          }
        });

        return await tx.task.update({
          where: { id: task!.id },
          data: {
            status: 'SUCCESS',
            progress: 100,
            outputs: rhOutputs ? JSON.parse(JSON.stringify(rhOutputs)) : null
          }
        });
      });
    } else if (rhStatus === 'FAILED') {
      task = await prisma.$transaction(async (tx) => {
        // Refund credits
        await tx.user.update({
          where: { id: userId },
          data: { balance: { increment: task!.creditCost } }
        });

        await tx.creditLedger.create({
          data: {
            userId,
            taskId: task!.id,
            amount: task!.creditCost,
            type: 'REFUND',
            description: `Refunded credits due to task failure`
          }
        });

        return await tx.task.update({
          where: { id: task!.id },
          data: {
            status: 'FAILED',
            progress: 100,
            errorMessage: rhError || 'Unknown RunningHub execution error'
          }
        });
      });
    } else if (rhProgress !== task.progress) {
      // Just update progress
      task = await prisma.task.update({
        where: { id: task.id },
        data: { progress: rhProgress }
      });
    }

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Status Polling Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
