import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // 1. Verify Signature (Placeholder for WeChat/Alipay SDK logic)
    // const signature = request.headers.get('wechatpay-signature');
    // if (!verify(signature)) throw new Error('Invalid signature');

    const body = await request.json();
    
    // Simulate webhook payload mapping
    const transactionId = body.transaction_id || `sim-${Date.now()}`;
    const orderId = body.out_trade_no; // The ID of the Order record in our DB
    const status = body.trade_state || 'SUCCESS'; // 'SUCCESS' for WeChat Pay

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    if (status === 'SUCCESS') {
      // 2. Process Order Fulfillment safely via transaction
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ where: { id: orderId } });
        if (!order) throw new Error('Order not found');
        if (order.status === 'PAID') return; // Idempotency check

        // Mark order as paid
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'PAID', transactionId }
        });

        // Top up user balance
        await tx.user.update({
          where: { id: order.userId },
          data: { balance: { increment: order.credits } }
        });

        // Record credit ledger
        await tx.creditLedger.create({
          data: {
            userId: order.userId,
            orderId: order.id,
            amount: order.credits,
            type: 'RECHARGE',
            description: `Payment top-up via ${order.paymentMethod}`
          }
        });
      });
    }

    // 3. Acknowledge Receipt to Gateway
    return NextResponse.json({ code: 'SUCCESS', message: 'OK' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
