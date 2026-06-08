import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { createPaymentIntent } from '../services/stripe.service';
import type { CreateOrderInput } from '../schemas/order.schema';
import { Decimal } from '@prisma/client/runtime/library';

export async function createOrder(req: Request, res: Response) {
  const { addressId } = req.body as CreateOrderInput;
  const userId = req.user!.userId;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  if (!cart || cart.items.length === 0) {
    res.status(400).json({ error: 'Cart is empty' });
    return;
  }

  // Prisma transaction prevents overselling
  const order = await prisma.$transaction(async (tx) => {
    for (const item of cart.items) {
      const variant = await tx.variant.findUnique({ where: { id: item.variantId } });
      if (!variant || variant.stock < item.quantity) {
        throw Object.assign(new Error(`Insufficient stock for SKU ${item.variant.sku}`), {
          statusCode: 409,
        });
      }
      await tx.variant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const total = cart.items.reduce(
      (sum, item) => sum.add(new Decimal(item.variant.product.price).mul(item.quantity)),
      new Decimal(0)
    );

    const newOrder = await tx.order.create({
      data: {
        userId,
        addressId,
        total,
        items: {
          create: cart.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            priceAtPurchase: item.variant.product.price,
          })),
        },
      },
      include: { items: true },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  const paymentIntent = await createPaymentIntent(
    Math.round(Number(order.total) * 100),
    'usd',
    { orderId: order.id }
  );

  await prisma.order.update({
    where: { id: order.id },
    data: { stripePaymentIntentId: paymentIntent.id },
  });

  res.status(201).json({ order, clientSecret: paymentIntent.client_secret });
}

export async function listMyOrders(req: Request, res: Response) {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.userId },
    include: { items: { include: { variant: { include: { product: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ orders });
}

export async function getOrder(req: Request, res: Response) {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
    include: { items: { include: { variant: { include: { product: true } } } }, address: true },
  });
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json({ order });
}
