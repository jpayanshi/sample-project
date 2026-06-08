'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { CartItem } from '@/types';

export default function CartPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['cart'], queryFn: cartApi.get });
  const items: CartItem[] = data?.cart?.items ?? [];

  const removeMutation = useMutation({
    mutationFn: cartApi.removeItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      cartApi.updateItem(id, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.variant?.product?.price ?? 0) * item.quantity,
    0
  );

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-10 animate-pulse space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-24 rounded-lg bg-gray-200" />)}
    </div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="mb-6 text-gray-500">Your cart is empty.</p>
          <Link href="/shop"><Button>Continue Shopping</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-xl border p-4">
                <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {item.variant?.product?.images?.[0] && (
                    <Image src={item.variant.product.images[0]} alt={item.variant.product.name} fill className="object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.variant?.product?.name}</p>
                      <p className="text-sm text-gray-500">{item.variant?.size} / {item.variant?.color}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(Number(item.variant?.product?.price ?? 0) * item.quantity)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateMutation.mutate({ id: item.id, quantity: item.quantity - 1 })}
                        disabled={item.quantity <= 1}
                        className="flex h-7 w-7 items-center justify-center rounded border hover:bg-gray-50 disabled:opacity-40"
                      >−</button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateMutation.mutate({ id: item.id, quantity: item.quantity + 1 })}
                        className="flex h-7 w-7 items-center justify-center rounded border hover:bg-gray-50"
                      >+</button>
                    </div>
                    <button
                      onClick={() => removeMutation.mutate(item.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border p-6 space-y-4 h-fit">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span>Shipping</span><span className="text-gray-500">Calculated at checkout</span></div>
            <div className="border-t pt-4 flex justify-between font-semibold"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
            <Link href="/checkout"><Button size="lg" className="w-full">Proceed to Checkout</Button></Link>
          </div>
        </div>
      )}
    </div>
  );
}
