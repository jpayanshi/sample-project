import { prisma } from '../config/prisma';
import { redis } from '../config/redis';

const REDIS_CART_TTL = 60 * 60 * 24 * 7; // 7 days

type RedisCartItem = { variantId: string; quantity: number };

// --- Guest cart (Redis) ---

export async function getGuestCart(sessionId: string): Promise<RedisCartItem[]> {
  const raw = await redis.get(`cart:${sessionId}`);
  return raw ? (JSON.parse(raw) as RedisCartItem[]) : [];
}

export async function setGuestCart(sessionId: string, items: RedisCartItem[]): Promise<void> {
  await redis.setex(`cart:${sessionId}`, REDIS_CART_TTL, JSON.stringify(items));
}

export async function deleteGuestCart(sessionId: string): Promise<void> {
  await redis.del(`cart:${sessionId}`);
}

// --- Merge guest cart into DB cart on login ---

export async function mergeGuestCartIntoUserCart(userId: string, sessionId: string): Promise<void> {
  const guestItems = await getGuestCart(sessionId);
  if (!guestItems.length) return;

  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  for (const { variantId, quantity } of guestItems) {
    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, variantId, quantity },
    });
  }

  await deleteGuestCart(sessionId);
}

// --- DB cart helpers (logged-in users) ---

export async function getOrCreateUserCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: { product: { select: { name: true, images: true, slug: true } } },
          },
        },
      },
    },
  });
}
