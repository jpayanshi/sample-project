'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { authApi, cartApi } from '@/lib/api';
import { useCartDrawer } from '@/providers/CartProvider';
import { Button } from './ui/Button';

export function Navbar() {
  const { openCart } = useCartDrawer();

  const { data: authData } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
    retry: false,
  });

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.get,
  });

  const user = authData?.user;
  const itemCount = cartData?.cart?.items?.reduce(
    (sum: number, i: { quantity: number }) => sum + i.quantity,
    0
  ) ?? 0;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
          Why label?
        </Link>

        <nav className="hidden gap-8 sm:flex">
          <Link href="/shop" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Shop
          </Link>
          {user?.role === 'ADMIN' && (
            <>
              <Link href="/admin/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Products
              </Link>
              <Link href="/admin/orders" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Orders
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/account" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              {user.name}
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button variant="secondary" size="sm">Sign in</Button>
            </Link>
          )}

          <button
            onClick={openCart}
            className="relative flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
            aria-label="Open cart"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
