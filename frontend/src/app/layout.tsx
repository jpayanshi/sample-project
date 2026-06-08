import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { CartProvider } from '@/providers/CartProvider';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Why label?',
  description: "Can't even the most luxurious label match quality. Just want to sell clothes with original threads not with plastic.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <CartDrawer />
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
