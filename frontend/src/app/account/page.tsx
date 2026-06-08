'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, ordersApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import type { Order } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
    retry: false,
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ orders: Order[] }>({
    queryKey: ['my-orders'],
    queryFn: ordersApi.list,
    enabled: !!authData?.user,
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      router.push('/');
    },
  });

  if (authLoading) return <div className="py-20 text-center">Loading...</div>;

  if (!authData?.user) {
    router.push('/auth/login');
    return null;
  }

  const user = authData.user;
  const orders = ordersData?.orders ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
        <Button
          variant="secondary"
          loading={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          Sign out
        </Button>
      </div>

      <h2 className="mb-4 text-xl font-semibold">Order History</h2>

      {ordersLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />)}
        </div>
      ) : orders.length === 0 ? (
        <p className="py-10 text-center text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(-8)}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                  <span className="font-semibold">{formatPrice(Number(order.total))}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
