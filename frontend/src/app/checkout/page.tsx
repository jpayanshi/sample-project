'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi, cartApi, ordersApi } from '@/lib/api';
import { checkoutSchema, type CheckoutFormValues } from '@/schemas';
import { formatPrice } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import type { CartItem } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();

  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
    retry: false,
  });

  const { data: cartData } = useQuery({ queryKey: ['cart'], queryFn: cartApi.get });
  const items: CartItem[] = cartData?.cart?.items ?? [];

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.variant?.product?.price ?? 0) * item.quantity,
    0
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({ resolver: zodResolver(checkoutSchema) });

  const orderMutation = useMutation({
    mutationFn: (addressId: string) => ordersApi.create(addressId),
    onSuccess: (data) => {
      router.push(`/order-confirmation/${data.order.id}`);
    },
  });

  // Auth guard — redirect unauthenticated users to login
  if (authLoading) return <div className="py-20 text-center">Loading…</div>;
  if (!authData?.user) {
    router.push('/auth/login');
    return null;
  }

  const onSubmit = (_data: CheckoutFormValues) => {
    alert('TODO: Wire up Stripe Elements. See comments in this file.');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Address form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h2 className="text-xl font-semibold">Shipping Address</h2>

          <Input
            id="line1"
            label="Address Line 1"
            {...register('line1')}
            error={errors.line1?.message}
            placeholder="123 Main St"
          />
          <Input
            id="line2"
            label="Address Line 2 (optional)"
            {...register('line2')}
            placeholder="Apt 4B"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input id="city" label="City" {...register('city')} error={errors.city?.message} />
            <Input id="postcode" label="Postcode" {...register('postcode')} error={errors.postcode?.message} />
          </div>
          <Input
            id="country"
            label="Country"
            {...register('country')}
            error={errors.country?.message}
            placeholder="US"
          />

          {/* TODO: Replace with Stripe Elements <PaymentElement /> */}
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            <p className="font-medium">Payment Element goes here</p>
            <p className="mt-1">Wire up Stripe Elements with the clientSecret from the order creation response.</p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={orderMutation.isPending}
          >
            Place Order — {formatPrice(subtotal)}
          </Button>
        </form>

        {/* Order summary */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.variant?.product?.name} ({item.variant?.size}/{item.variant?.color}) × {item.quantity}
              </span>
              <span>{formatPrice(Number(item.variant?.product?.price ?? 0) * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
