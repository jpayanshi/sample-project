'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import type { PaginatedProducts } from '@/types';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'White', 'Navy', 'Grey', 'Beige'];
const CATEGORIES = ['T-Shirts', 'Hoodies', 'Trousers', 'Jackets', 'Accessories'];

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const params = {
    page: searchParams.get('page') ?? '1',
    category: searchParams.get('category') ?? undefined,
    size: searchParams.get('size') ?? undefined,
    color: searchParams.get('color') ?? undefined,
    minPrice: searchParams.get('minPrice') ?? undefined,
    maxPrice: searchParams.get('maxPrice') ?? undefined,
  };

  const { data, isLoading } = useQuery<PaginatedProducts>({
    queryKey: ['products', params],
    queryFn: () => productsApi.list(params),
  });

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    router.push(`/shop?${next.toString()}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-56 shrink-0 space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">Category</h3>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setParam('category', params.category === cat.toLowerCase() ? null : cat.toLowerCase())}
                  className={`block w-full rounded px-2 py-1 text-left text-sm ${
                    params.category === cat.toLowerCase()
                      ? 'bg-brand-100 font-medium text-brand-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">Size</h3>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setParam('size', params.size === s ? null : s)}
                  className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
                    params.size === s
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-brand-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">Color</h3>
            <div className="space-y-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setParam('color', params.color === c ? null : c)}
                  className={`block w-full rounded px-2 py-1 text-left text-sm ${
                    params.color === c
                      ? 'bg-brand-100 font-medium text-brand-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {data ? `${data.total} products` : ''}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] rounded-lg bg-gray-200" />
                  <div className="mt-3 h-3 w-2/3 rounded bg-gray-200" />
                  <div className="mt-1 h-3 w-1/2 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : data?.products.length === 0 ? (
            <p className="py-20 text-center text-gray-500">No products found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-4">
              {data?.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setParam('page', String(p))}
                  className={`h-9 w-9 rounded-md border text-sm font-medium transition-colors ${
                    p === Number(params.page)
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-brand-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
