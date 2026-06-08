import { Resend } from 'resend';
import { env } from '../config/env';

const resend = new Resend(env.RESEND_API_KEY);

interface OrderConfirmationData {
  to: string;
  customerName: string;
  orderId: string;
  total: number;
  items: { name: string; size: string; color: string; quantity: number; price: number }[];
}

/**
 * TODO: Called inside the Stripe webhook handler after order status is set to PAID.
 * Sends a transactional order confirmation email via Resend.
 */
export async function sendOrderConfirmationEmail(data: OrderConfirmationData): Promise<void> {
  // TODO: Replace the html below with a proper React Email template
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: data.to,
    subject: `Order Confirmed — #${data.orderId}`,
    html: `
      <h1>Thanks for your order, ${data.customerName}!</h1>
      <p>Order ID: ${data.orderId}</p>
      <p>Total: $${data.total.toFixed(2)}</p>
      <ul>
        ${data.items
          .map((i) => `<li>${i.quantity}x ${i.name} (${i.size} / ${i.color}) — $${i.price.toFixed(2)}</li>`)
          .join('')}
      </ul>
    `,
  });
}
