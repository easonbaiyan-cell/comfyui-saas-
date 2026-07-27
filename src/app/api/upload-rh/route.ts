import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const rhFormData = new FormData();
    rhFormData.append('file', file);

    const apiKey = process.env.RUNNINGHUB_API_KEY || 'aa0c44bf36314b1ebdc7937ddede6fae';

    const rhResponse = await fetch('https://www.runninghub.cn/openapi/v2/media/upload/binary', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: rhFormData
    });

    const rhData = await rhResponse.json();

    if (!rhResponse.ok || rhData.code !== 0) {
      console.error('RunningHub Upload API Error:', rhData);
      return NextResponse.json(
        { error: rhData.msg || rhData.message || 'RunningHub Upload API Error', details: rhData },
        { status: 400 }
      );
    }

    return NextResponse.json(rhData);
  } catch (error: unknown) {
    console.error('Upload RH API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error', details: String(error) },
      { status: 500 }
    );
  }
}
