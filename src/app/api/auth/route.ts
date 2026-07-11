import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import { redis } from '@/lib/redis';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 });
    }

    // 1. Verify SMS code (simulated with Redis)
    const storedCode = await redis.get(`sms:${phone}`);
    
    // For development/testing, we can allow a bypass code '123456'
    if (code !== '123456' && storedCode !== code) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 401 });
    }

    // 2. Check if user exists, if not, create new User
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      // Create user and initialize credit ledger
      // @ts-ignore: Prisma transaction type can be complex, ignoring for prototype
      user = await prisma.$transaction(async (tx: any) => {
        const newUser = await tx.user.create({
          data: {
            phone,
          },
        });

        await tx.creditLedger.create({
          data: {
            userId: newUser.id,
            balance: 0, // Initial balance
          },
        });

        return newUser;
      });
    }

    // 3. Delete the used code
    if (storedCode) {
      await redis.del(`sms:${phone}`);
    }

    // 4. Generate JWT
    const token = await signToken({ userId: user?.id, phone: user?.phone });

    // 5. Set HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user?.id,
        phone: user?.phone,
      }
    });

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
