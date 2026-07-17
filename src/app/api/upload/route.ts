import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const apiKey = process.env.RUNNINGHUB_API_KEY || ''

    // According to standard curl/requests for this, formData with 'file', 'apiKey' and 'fileType' is needed
    // The previous Python snippet showed:
    // data = { 'apiKey': apiConfig.get('apiKey'), 'fileType': 'image' }
    // files = { 'file': ('image.png', buffer, 'image/png') }

    const rhFormData = new FormData();
    rhFormData.append('file', file);
    rhFormData.append('apiKey', apiKey);

    // optional: check if file is video
    const fileType = (file as File).type.startsWith('video/') ? 'video' : 'image';
    rhFormData.append('fileType', fileType);

    const rhResponse = await fetch('https://www.runninghub.cn/task/openapi/upload', {
      method: 'POST',
      body: rhFormData,
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const rhData = await rhResponse.json();

    if (rhData.code !== 0) {
      console.error('Upload API Error:', rhData);
      return NextResponse.json({ error: rhData.msg || 'Upload failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: rhData.data.fileUrl || rhData.data.url || rhData.data // Assuming data contains url based on common structure, need to verify or handle gracefully if not documented
    });

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
