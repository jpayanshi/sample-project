import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { getGuestCart, setGuestCart, getOrCreateUserCart } from '../services/cart.service';
import type { AddCartItemInput, UpdateCartItemInput } from '../schemas/cart.schema';
import { randomUUID } from 'crypto';

function getSessionId(req: Request, res: Response): string {
  let sessionId = req.cookies?.sessionId as string | undefined;
  if (!sessionId) {
    sessionId = randomUUID();
    res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  }
  return sessionId;
}

async function enrichGuestItems(rawItems: { variantId: string; quantity: number }[]) {
  return Promise.all(
    rawItems.map(async (raw) => {
      const variant = await prisma.variant.findUnique({
        where: { id: raw.variantId },
        include: { product: { select: { name: true, images: true, slug: true, price: true } } },
      });
      return {
        // use variantId as the item id so update/remove routes can match it
        id: raw.variantId,
        cartId: 'guest',
        variantId: raw.variantId,
        quantity: raw.quantity,
        variant,
      };
    }),
  );
}

export async function getCart(req: Request, res: Response) {
  if (req.user) {
    const cart = await getOrCreateUserCart(req.user.userId);
    res.json({ cart });
    return;
  }
  const sessionId = getSessionId(req, res);
  const rawItems = await getGuestCart(sessionId);
  const items = await enrichGuestItems(rawItems);
  res.json({ cart: { items } });
}

export async function addItem(req: Request, res: Response) {
  const { variantId, quantity } = req.body as AddCartItemInput;

  const variant = await prisma.variant.findUnique({ where: { id: variantId } });
  if (!variant) {
    res.status(404).json({ error: 'Variant not found' });
    return;
  }

  if (req.user) {
    const cart = await prisma.cart.upsert({
      where: { userId: req.user.userId },
      update: {},
      create: { userId: req.user.userId },
    });
    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, variantId, quantity },
    });
    const updated = await getOrCreateUserCart(req.user.userId);
    res.json({ cart: updated });
    return;
  }

  const sessionId = getSessionId(req, res);
  const items = await getGuestCart(sessionId);
  const existing = items.find((i) => i.variantId === variantId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ variantId, quantity });
  }
  await setGuestCart(sessionId, items);
  const enriched = await enrichGuestItems(items);
  res.json({ cart: { items: enriched } });
}

export async function updateItem(req: Request, res: Response) {
  const { quantity } = req.body as UpdateCartItemInput;
  const itemId = req.params.id;

  if (req.user) {
    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    }
    const cart = await getOrCreateUserCart(req.user.userId);
    res.json({ cart });
    return;
  }

  const sessionId = getSessionId(req, res);
  const items = await getGuestCart(sessionId);
  const updated = items
    .map((i) => (i.variantId === itemId ? { ...i, quantity } : i))
    .filter((i) => i.quantity > 0);
  await setGuestCart(sessionId, updated);
  res.json({ cart: { items: updated } });
}

export async function removeItem(req: Request, res: Response) {
  if (req.user) {
    await prisma.cartItem.delete({ where: { id: req.params.id } });
    const cart = await getOrCreateUserCart(req.user.userId);
    res.json({ cart });
    return;
  }
  const sessionId = getSessionId(req, res);
  const items = await getGuestCart(sessionId);
  await setGuestCart(sessionId, items.filter((i) => i.variantId !== req.params.id));
  res.json({ message: 'Item removed' });
}
