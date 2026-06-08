'use client';

import { createContext, useContext, useState } from 'react';

interface CartContextValue {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <CartContext.Provider value={{ isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false) }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartDrawer() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartDrawer must be inside CartProvider');
  return ctx;
}
