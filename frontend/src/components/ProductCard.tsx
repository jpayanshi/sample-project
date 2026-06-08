import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={product.images[0] || '/images/placeholder.jpg'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{product.category}</p>
        <h3 className="font-medium text-gray-900 group-hover:text-brand-600 transition-colors">
          {product.name}
        </h3>
        <p className="font-semibold text-gray-900">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
