'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/lib/api';
import { useCartDrawer } from '@/providers/CartProvider';
import { formatPrice } from '@/lib/utils';
import { Button } from './ui/Button';
import type { CartItem } from '@/types';

export function CartDrawer() {
  const { isOpen, closeCart } = useCartDrawer();
  const queryClient = useQueryClient();

  const { data } = useQuery({ queryKey: ['cart'], queryFn: cartApi.get });
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

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={closeCart} />
      )}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="text-lg font-semibold">Your Cart ({items.length})</h2>
          <button onClick={closeCart} className="rounded-md p-1 hover:bg-gray-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {items.length === 0 ? (
            <p className="py-12 text-center text-gray-500">Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                  {item.variant?.product?.images?.[0] && (
                    <Image
                      src={item.variant.product.images[0]}
                      alt={item.variant.product.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.variant?.product?.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.variant?.size} / {item.variant?.color}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateMutation.mutate({ id: item.id, quantity: item.quantity - 1 })}
                        className="flex h-6 w-6 items-center justify-center rounded border text-sm hover:bg-gray-50"
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="w-4 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateMutation.mutate({ id: item.id, quantity: item.quantity + 1 })}
                        className="flex h-6 w-6 items-center justify-center rounded border text-sm hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeMutation.mutate(item.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="text-sm font-semibold">
                  {formatPrice(Number(item.variant?.product?.price ?? 0) * item.quantity)}
                </p>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t px-4 py-4 space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <Link href="/checkout" onClick={closeCart}>
              <Button className="w-full" size="lg">
                Checkout
              </Button>
            </Link>
            <Link href="/cart" onClick={closeCart} className="block text-center text-sm text-brand-600 hover:underline">
              View full cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
