import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import type { CreateProductInput, UpdateProductInput, ProductQuery } from '../schemas/product.schema';

export async function listProducts(req: Request, res: Response) {
  const { page, limit, category, size, color, minPrice, maxPrice } = req.query as unknown as ProductQuery;

  const where = {
    ...(category && { category: { equals: category, mode: 'insensitive' as const } }),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? { price: { ...(minPrice !== undefined && { gte: minPrice }), ...(maxPrice !== undefined && { lte: maxPrice }) } }
      : {}),
    ...(size || color
      ? {
          variants: {
            some: {
              ...(size && { size }),
              ...(color && { color }),
            },
          },
        }
      : {}),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  res.json({ products, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function getProduct(req: Request, res: Response) {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { variants: true },
  });
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ product });
}

export async function createProduct(req: Request, res: Response) {
  const { variants, ...productData } = req.body as CreateProductInput;
  const product = await prisma.product.create({
    data: {
      ...productData,
      price: productData.price,
      variants: { create: variants },
    },
    include: { variants: true },
  });
  res.status(201).json({ product });
}

export async function updateProduct(req: Request, res: Response) {
  const { variants, ...productData } = req.body as UpdateProductInput;

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { ...productData },
    include: { variants: true },
  });
  res.json({ product });
}

export async function deleteProduct(req: Request, res: Response) {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).send();
}
