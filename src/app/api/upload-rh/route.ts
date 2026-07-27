import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Use arrayBuffer to bypass Next.js formData parser limit (413 Payload Too Large)
    const arrayBuffer = await req.arrayBuffer();
    const contentType = req.headers.get('content-type') || 'multipart/form-data';

    const apiKey = process.env.RUNNINGHUB_API_KEY || 'aa0c44bf36314b1ebdc7937ddede6fae';

    const rhResponse = await fetch('https://www.runninghub.cn/openapi/v2/media/upload/binary', {
      method: 'POST',

      body: arrayBuffer,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': contentType
      }
    });

    const rhText = await rhResponse.text();
    let rhData;
    try {
      rhData = JSON.parse(rhText);
    } catch (e) {
      if (!rhResponse.ok) {
        console.error('RunningHub Upload API Non-JSON Error Response:', rhText);
        return NextResponse.json(
          { error: 'RunningHub 服务器拒绝了该文件，可能是文件过大或格式错误' },
          { status: rhResponse.status }
        );
      } else {
        console.error('RunningHub Upload API returned invalid JSON:', rhText);
        return NextResponse.json(
          { error: 'RunningHub 服务器响应格式错误' },
          { status: 500 }
        );
      }
    }

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
