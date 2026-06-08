import { Request, Response } from 'express';
import { constructWebhookEvent, createPaymentIntent } from '../services/stripe.service';
import { sendOrderConfirmationEmail } from '../services/email.service';
import { prisma } from '../config/prisma';
import Stripe from 'stripe';

export async function createIntent(req: Request, res: Response) {
  const { amount, currency = 'usd' } = req.body as { amount: number; currency?: string };
  const intent = await createPaymentIntent(amount, currency);
  res.json({ clientSecret: intent.client_secret });
}

export async function handleWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;
  try {
    // req.body must be the raw Buffer — see app.ts for the rawBody middleware
    event = constructWebhookEvent(req.body as Buffer, sig);
  } catch (err) {
    res.status(400).json({ error: `Webhook error: ${(err as Error).message}` });
    return;
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;
    const orderId = intent.metadata?.orderId;
    if (orderId) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
        include: {
          user: true,
          items: { include: { variant: { include: { product: true } } } },
        },
      });

      // TODO: send email — fire-and-forget is fine here
      sendOrderConfirmationEmail({
        to: order.user.email,
        customerName: order.user.name,
        orderId: order.id,
        total: Number(order.total),
        items: order.items.map((i) => ({
          name: i.variant.product.name,
          size: i.variant.size,
          color: i.variant.color,
          quantity: i.quantity,
          price: Number(i.priceAtPurchase),
        })),
      }).catch(console.error);
    }
  }

  res.json({ received: true });
}
