import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payload, modelRoute } = body;

    if (!payload || !modelRoute) {
      return NextResponse.json({ error: 'Missing payload or modelRoute' }, { status: 400 });
    }

    const apiKey = process.env.RUNNINGHUB_API_KEY || '';

    const url = `https://www.runninghub.cn/openapi/v2/price-preview/${modelRoute}`;

    const rhResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const rhData = await rhResponse.json();

    if (!rhResponse.ok || (rhData.code !== 0 && rhData.code !== 200)) {
      console.error('Price preview API error from RunningHub:', rhData);
      return NextResponse.json(
        { error: 'Failed to fetch price preview', details: rhData },
        { status: rhResponse.status || 500 }
      );
    }

    // Extract estimatedPrice. Could be at rhData.data.estimatedPrice or similar.
    // Ensure we handle both cases where data might be nested.
    const estimatedPrice = rhData.data?.estimatedPrice ?? rhData.estimatedPrice;

    return NextResponse.json({
      success: true,
      estimatedPrice,
    });
  } catch (error) {
    console.error('Price preview API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
