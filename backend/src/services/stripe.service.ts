import Stripe from 'stripe';
import { env } from '../config/env';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

/**
 * TODO: Called when user initiates checkout.
 * Returns a PaymentIntent client_secret to pass to Stripe Elements on the frontend.
 */
export async function createPaymentIntent(
  amountInCents: number,
  currency = 'usd',
  metadata: Stripe.MetadataParam = {}
): Promise<Stripe.PaymentIntent> {
  // TODO: Add customer ID for logged-in users, receipt_email, etc.
  return stripe.paymentIntents.create({
    amount: amountInCents,
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
}

/**
 * TODO: Called in /api/payments/webhook.
 * Verify the Stripe signature before processing any event.
 */
export function constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
}
