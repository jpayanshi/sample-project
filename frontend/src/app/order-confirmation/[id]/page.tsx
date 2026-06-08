'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { Order } from '@/types';

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery<{ order: Order }>({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id),
  });

  const order = data?.order;

  if (isLoading) return <div className="py-20 text-center">Loading...</div>;
  if (!order) return <div className="py-20 text-center">Order not found.</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h1 className="mb-2 text-3xl font-bold">Order Confirmed!</h1>
      <p className="mb-1 text-gray-500">Order #{order.id}</p>
      <p className="mb-8 text-gray-500">
        A confirmation email has been sent to you.
      </p>

      <div className="mb-8 rounded-xl border p-6 text-left space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.variant?.product?.name} ({item.variant?.size}/{item.variant?.color}) × {item.quantity}
            </span>
            <span className="font-medium">{formatPrice(Number(item.priceAtPurchase) * item.quantity)}</span>
          </div>
        ))}
        <div className="border-t pt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(Number(order.total))}</span>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Link href="/account"><Button variant="secondary">View Orders</Button></Link>
        <Link href="/shop"><Button>Continue Shopping</Button></Link>
      </div>
    </div>
  );
}
