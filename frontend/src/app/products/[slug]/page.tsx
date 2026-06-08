'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi, cartApi } from '@/lib/api';
import { useCartDrawer } from '@/providers/CartProvider';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { Product, Variant } from '@/types';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { openCart } = useCartDrawer();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ product: Product }>({
    queryKey: ['product', slug],
    queryFn: () => productsApi.get(slug),
  });

  const product = data?.product;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const sizes = [...new Set(product?.variants.map((v) => v.size))];
  const colors = [...new Set(product?.variants.map((v) => v.color))];
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const availableVariant = product?.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  ) ?? null;

  const addToCartMutation = useMutation({
    mutationFn: () => cartApi.addItem(availableVariant!.id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      openCart();
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="animate-pulse space-y-3">
            <div className="aspect-[3/4] rounded-xl bg-gray-200" />
          </div>
          <div className="animate-pulse space-y-4 pt-4">
            <div className="h-6 w-2/3 rounded bg-gray-200" />
            <div className="h-8 w-1/3 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <p className="py-20 text-center">Product not found.</p>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Images */}
        <div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
            <Image
              src={product.images[selectedImage] || '/images/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-16 w-12 overflow-hidden rounded-md border-2 ${
                    selectedImage === i ? 'border-brand-600' : 'border-transparent'
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">{product.category}</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-3 text-2xl font-semibold text-gray-900">{formatPrice(product.price)}</p>
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Size selector */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Size</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-brand-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color selector */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Color</h3>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedColor === color
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-brand-400'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {availableVariant && (
            <p className="text-sm text-gray-500">
              {availableVariant.stock > 0
                ? `${availableVariant.stock} in stock`
                : 'Out of stock'}
            </p>
          )}

          <Button
            size="lg"
            className="w-full"
            disabled={!availableVariant || availableVariant.stock === 0}
            loading={addToCartMutation.isPending}
            onClick={() => addToCartMutation.mutate()}
          >
            {!selectedSize || !selectedColor
              ? 'Select size & color'
              : availableVariant?.stock === 0
              ? 'Out of stock'
              : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
