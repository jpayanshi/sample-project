export type Role = 'CUSTOMER' | 'ADMIN';
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Variant {
  id: string;
  productId: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  createdAt: string;
  variants: Variant[];
}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  variant: Variant & { product: Pick<Product, 'name' | 'images' | 'slug' | 'price'> };
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface Address {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
  variant: Variant & { product: Pick<Product, 'name' | 'images' | 'slug'> };
}

export interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: OrderItem[];
  address?: Address;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
