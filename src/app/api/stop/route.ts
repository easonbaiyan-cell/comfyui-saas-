import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { taskId } = await req.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
    }

    // In a real application, we would call the third-party API to cancel the task.
    // For now, we simulate a successful cancellation.
    console.log(`Cancelling task ${taskId}`);

    // You might want to call something like:
    // const rhResponse = await fetch('https://www.runninghub.cn/task/openapi/cancel', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ taskId, apiKey: 'aa0c44bf36314b1ebdc7937ddede6fae' })
    // });

    return NextResponse.json({ success: true, message: 'Task cancelled' });

  } catch (error) {
    console.error('Stop API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
