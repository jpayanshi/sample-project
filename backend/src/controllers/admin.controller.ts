import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import type { UpdateOrderStatusInput } from '../schemas/order.schema';

export async function listAllOrders(_req: Request, res: Response) {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { variant: { include: { product: true } } } },
      address: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ orders });
}

export async function updateOrderStatus(req: Request, res: Response) {
  const { status } = req.body as UpdateOrderStatusInput;
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json({ order });
}
