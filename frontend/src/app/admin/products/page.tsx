'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import type { Product } from '@/types';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ products: Product[] }>({
    queryKey: ['admin-products'],
    queryFn: () => productsApi.list({ limit: 100 }),
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const products = data?.products ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        {/* TODO: Open a create product modal or navigate to /admin/products/new */}
        <Button>+ Add Product</Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-lg bg-gray-200" />)}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Image', 'Name', 'Category', 'Price', 'Variants', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {p.images[0] ? (
                      <div className="relative h-12 w-10 overflow-hidden rounded-md bg-gray-100">
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-12 w-10 rounded-md bg-gray-200" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{p.category}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-gray-500">{p.variants.length}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {/* TODO: Navigate to edit page or open edit modal */}
                      <Button variant="secondary" size="sm">Edit</Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm(`Delete "${p.name}"?`)) deleteMutation.mutate(p.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
