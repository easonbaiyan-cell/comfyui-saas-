import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(
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

    const userId = decoded.userId as string;
    const resolvedParams = await params;
    const workflowId = resolvedParams.id;
    const body = await request.json();
    const inputs = body.inputs || {};

    // 2. Fetch Workflow & Pricing
    const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const cost = workflow.platformCost;

    // 3. Billing Logic: Freeze Credits using pessimistic/atomic approach
    let task;
    try {
      task = await prisma.$transaction(async (tx) => {
        // Atomic decrement with condition (User must have enough balance)
        const updatedUser = await tx.user.updateMany({
          where: { 
            id: userId, 
            balance: { gte: cost } // Pessimistic lock equivalent for credits
          },
          data: { balance: { decrement: cost } }
        });

        if (updatedUser.count === 0) {
          throw new Error('Insufficient balance');
        }

        // Create the task record
        const newTask = await tx.task.create({
          data: {
            userId,
            workflowId,
            status: 'PENDING',
            inputs: inputs,
            creditCost: cost
          }
        });

        // Log the freeze operation
        await tx.creditLedger.create({
          data: {
            userId,
            taskId: newTask.id,
            amount: cost,
            type: 'FREEZE',
            description: `Frozen credits for workflow execution (ID: ${workflow.id})`
          }
        });

        return newTask;
      });
    } catch (txError: any) {
      if (txError.message === 'Insufficient balance') {
        return NextResponse.json({ error: 'Insufficient balance to run this workflow' }, { status: 402 });
      }
      throw txError;
    }

    // 4. Call External RunningHub API
    const apiKey = process.env.RUNNINGHUB_API_KEY || 'mock-key';
    let runningHubTaskId = `rh-mock-${Date.now()}`;
    let apiCallFailed = false;

    try {
      // In a real environment, you'd replace the URL with the actual RunningHub endpoint
      // e.g., https://www.runninghub.cn/task/openapi/create
      const response = await fetch('https://mock-runninghub-endpoint/openapi/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          workflowId: workflow.runningHubId,
          inputs: inputs
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.taskId) {
          runningHubTaskId = data.taskId;
        }
      } else {
        // If API responds with an error, mark as failed
        console.warn('RunningHub API responded with an error, using mock ID for fallback simulation');
        // apiCallFailed = true; // Uncomment when strictly enforcing real API
      }
    } catch (apiError) {
      console.warn('RunningHub API request failed, likely due to mock URL. Using mock task ID.');
      // apiCallFailed = true; // Uncomment when strictly enforcing real API
    }

    // 5. Handle Immediate API Failure
    if (apiCallFailed) {
      // Refund the frozen credits
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { balance: { increment: cost } }
        });
        await tx.task.update({
          where: { id: task.id },
          data: { status: 'FAILED', errorMessage: 'Failed to contact RunningHub API' }
        });
        await tx.creditLedger.create({
          data: {
            userId,
            taskId: task.id,
            amount: cost,
            type: 'REFUND',
            description: `Refunded due to API initialization failure`
          }
        });
      });
      return NextResponse.json({ error: 'External API failure, credits refunded' }, { status: 502 });
    }

    // 6. Update Task with External ID
    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: { runningHubTaskId, status: 'RUNNING' }
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('Execute API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
