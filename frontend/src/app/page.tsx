import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative flex h-[85vh] items-center justify-center overflow-hidden bg-gray-900">
        <div className="relative z-10 text-center text-white">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand-300">
            New Collection 2024
          </p>
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-7xl">
            Wear Your Story
          </h1>
          <p className="mb-10 text-lg text-gray-300 sm:text-xl">
            Premium quality clothing crafted for modern living.
          </p>
          <Link href="/shop">
            <Button size="lg" className="px-10">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="mb-10 text-center text-2xl font-bold">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {['T-Shirts', 'Hoodies', 'Jackets', 'Accessories'].map((cat) => (
            <Link
              key={cat}
              href={`/shop?category=${cat.toLowerCase()}`}
              className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/50 to-transparent">
                <span className="text-lg font-semibold text-white">{cat}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-50 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-brand-900">Join the Community</h2>
          <p className="mb-8 text-brand-700">
            Sign up for early access, exclusive drops, and member-only discounts.
          </p>
          <Link href="/auth/register">
            <Button size="lg">Create an Account</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
