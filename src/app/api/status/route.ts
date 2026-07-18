import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { taskId } = await req.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
    }

    const payload = { taskId, apiKey: 'aa0c44bf36314b1ebdc7937ddede6fae' };

    const rhResponse = await fetch('https://www.runninghub.cn/task/openapi/outputs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const rhData = await rhResponse.json();

    return NextResponse.json(rhData);

  } catch (error) {
    console.error('Status API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
