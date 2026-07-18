import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const rhFormData = new FormData();
    rhFormData.append('file', file);

    // Use the API key from environment variables
    const apiKey = process.env.RUNNINGHUB_API_KEY || '';

    const response = await fetch('https://www.runninghub.cn/openapi/v2/media/upload/binary', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: rhFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('RunningHub upload error:', errorText);
      // Return raw error with status 500
      return NextResponse.json({ error: errorText }, { status: 500 });
    }

    const data = await response.json();
    // Return exact payload
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
