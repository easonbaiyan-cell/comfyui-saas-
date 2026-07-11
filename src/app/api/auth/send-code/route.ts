import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'Valid China mainland phone number is required' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Rate Limiting: 1 SMS per phone per 60 seconds
    const phoneLimitKey = `ratelimit:sms:phone:${phone}`;
    const phoneSent = await redis.get(phoneLimitKey);
    if (phoneSent) {
      return NextResponse.json({ error: 'Please wait 60 seconds before requesting another code' }, { status: 429 });
    }

    // Rate Limiting: Max 5 SMS per IP per day
    const ipLimitKey = `ratelimit:sms:ip:${ip}`;
    const ipCount = await redis.get(ipLimitKey);
    if (ipCount && parseInt(ipCount, 10) >= 5) {
      return NextResponse.json({ error: 'Too many requests from this IP today' }, { status: 429 });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code with 5-minute expiration
    await redis.setex(`sms:${phone}`, 300, code);

    // Set rate limits
    await redis.setex(phoneLimitKey, 60, '1');
    await redis.incr(ipLimitKey);
    if (!ipCount) {
      await redis.expire(ipLimitKey, 86400); // 24 hours
    }

    // TODO: Call Aliyun/Tencent SMS API here
    console.log(`[Simulation] SMS sent to ${phone}: ${code}`);

    return NextResponse.json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
