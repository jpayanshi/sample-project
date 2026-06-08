'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, addressApi, ordersApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import type { Address, Order } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  PAID:      'bg-blue-100 text-blue-800',
  SHIPPED:   'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

type Tab = 'settings' | 'orders';

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('settings');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrFields, setAddrFields] = useState({ line1: '', line2: '', city: '', postcode: '', country: '' });
  const [profileFields, setProfileFields] = useState<{ name: string; phone: string } | null>(null);

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

  const { data: addressData, isLoading: addressLoading } = useQuery<{ addresses: Address[] }>({
    queryKey: ['my-addresses'],
    queryFn: addressApi.list,
    enabled: !!authData?.user,
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Hard reload so all React Query cache and component state is wiped at once.
      // Soft navigation leaves the Navbar mounted, triggering a background me-refetch
      // that races with cookie clearing and can briefly show the old user name.
      window.location.href = '/';
    },
  });

  const profileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data);
      setProfileFields(null);
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: addressApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
      setShowAddressForm(false);
      setAddrFields({ line1: '', line2: '', city: '', postcode: '', country: '' });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: addressApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-addresses'] }),
  });

  if (authLoading) return <div className="py-20 text-center">Loading…</div>;
  if (!authData?.user) { router.push('/auth/login'); return null; }

  const user = authData.user;
  const orders = ordersData?.orders ?? [];
  const addresses = addressData?.addresses ?? [];
  const editing = profileFields ?? { name: user.name, phone: user.phone ?? '' };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <Button variant="secondary" loading={logoutMutation.isPending} onClick={() => logoutMutation.mutate()}>
          Sign out
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-1 border-b border-gray-200">
        {(['settings', 'orders'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── SETTINGS TAB ── */}
      {tab === 'settings' && (
        <div className="space-y-10">
          {/* Profile */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Profile</h2>
            <div className="space-y-4">
              <Input
                label="Full Name"
                value={editing.name}
                onChange={(e) => setProfileFields({ ...editing, name: e.target.value })}
              />
              <Input
                label="Email"
                value={user.email}
                disabled
                className="bg-gray-50 text-gray-500"
              />
              <Input
                label="Phone"
                value={editing.phone}
                placeholder="+1 555 000 0000"
                onChange={(e) => setProfileFields({ ...editing, phone: e.target.value })}
              />
              {profileFields !== null && (
                <div className="flex gap-3">
                  <Button
                    loading={profileMutation.isPending}
                    onClick={() => profileMutation.mutate({ name: editing.name, phone: editing.phone })}
                  >
                    Save changes
                  </Button>
                  <Button variant="secondary" onClick={() => setProfileFields(null)}>
                    Cancel
                  </Button>
                </div>
              )}
              {profileMutation.isError && (
                <p className="text-sm text-red-600">{(profileMutation.error as Error).message}</p>
              )}
            </div>
          </section>

          {/* Addresses */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Saved Addresses</h2>
              <button
                onClick={() => setShowAddressForm((v) => !v)}
                className="text-sm font-medium text-brand-600 hover:underline"
              >
                {showAddressForm ? 'Cancel' : '+ Add address'}
              </button>
            </div>

            {showAddressForm && (
              <div className="mb-6 space-y-3 rounded-xl border p-4">
                <Input label="Address Line 1" value={addrFields.line1} onChange={(e) => setAddrFields({ ...addrFields, line1: e.target.value })} placeholder="123 Main St" />
                <Input label="Address Line 2 (optional)" value={addrFields.line2} onChange={(e) => setAddrFields({ ...addrFields, line2: e.target.value })} placeholder="Apt 4B" />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="City" value={addrFields.city} onChange={(e) => setAddrFields({ ...addrFields, city: e.target.value })} />
                  <Input label="Postcode" value={addrFields.postcode} onChange={(e) => setAddrFields({ ...addrFields, postcode: e.target.value })} />
                </div>
                <Input label="Country" value={addrFields.country} onChange={(e) => setAddrFields({ ...addrFields, country: e.target.value })} placeholder="US" />
                <Button
                  loading={addAddressMutation.isPending}
                  onClick={() => addAddressMutation.mutate(addrFields)}
                  disabled={!addrFields.line1 || !addrFields.city || !addrFields.postcode || !addrFields.country}
                >
                  Save address
                </Button>
                {addAddressMutation.isError && (
                  <p className="text-sm text-red-600">{(addAddressMutation.error as Error).message}</p>
                )}
              </div>
            )}

            {addressLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-200" />)}
              </div>
            ) : addresses.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">No saved addresses yet.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div key={addr.id} className="flex items-start justify-between rounded-xl border p-4">
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                      <p>{addr.city}, {addr.postcode}</p>
                      <p>{addr.country}</p>
                    </div>
                    <button
                      onClick={() => deleteAddressMutation.mutate(addr.id)}
                      className="ml-4 text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {tab === 'orders' && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Order History</h2>

          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />)}
            </div>
          ) : orders.length === 0 ? (
            <p className="py-16 text-center text-gray-500">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-xl border overflow-hidden">
                  {/* Order header */}
                  <button
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(-8)}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                      <span className="font-semibold text-sm">{formatPrice(Number(order.total))}</span>
                      <span className="text-gray-400 text-xs">{expandedOrder === order.id ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {/* Expanded items */}
                  {expandedOrder === order.id && (
                    <div className="border-t divide-y">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 px-4 py-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.variant?.product?.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.variant?.size} · {item.variant?.color} · Qty {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-medium">{formatPrice(Number(item.priceAtPurchase) * item.quantity)}</p>
                        </div>
                      ))}
                      {order.address && (
                        <div className="px-4 py-3 text-xs text-gray-500">
                          <span className="font-medium text-gray-700">Shipped to: </span>
                          {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}, {order.address.city}, {order.address.postcode}, {order.address.country}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
