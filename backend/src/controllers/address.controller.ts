import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export async function listAddresses(req: Request, res: Response) {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.userId },
    orderBy: { id: 'asc' },
  });
  res.json({ addresses });
}

export async function createAddress(req: Request, res: Response) {
  const { line1, line2, city, postcode, country } = req.body as {
    line1: string; line2?: string; city: string; postcode: string; country: string;
  };
  const address = await prisma.address.create({
    data: { userId: req.user!.userId, line1, line2: line2 ?? null, city, postcode, country },
  });
  res.status(201).json({ address });
}

export async function deleteAddress(req: Request, res: Response) {
  const { id } = req.params;
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== req.user!.userId) {
    res.status(404).json({ error: 'Address not found' });
    return;
  }
  await prisma.address.delete({ where: { id } });
  res.json({ message: 'Deleted' });
}
