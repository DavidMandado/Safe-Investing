import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { TransactionType } from '@prisma/client';
import { z } from 'zod';

const transactionSchema = z.object({
  accountId: z.string(),
  assetId: z.string().optional(),
  type: z.nativeEnum(TransactionType),
  date: z.string().transform((d) => new Date(d)),
  quantity: z.number().nullable(),
  price: z.number().nullable(),
  fee: z.number().nullable(),
  total: z.number(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const transactions = await prisma.transaction.findMany({
    where: { account: { userId: session.user.id } },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const body = await req.json();
  const parsed = transactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const data = parsed.data;
  const tx = await prisma.transaction.create({
    data: {
      accountId: data.accountId,
      assetId: data.assetId,
      type: data.type,
      date: data.date,
      quantity: data.quantity ?? undefined,
      price: data.price ?? undefined,
      fee: data.fee ?? undefined,
      total: data.total,
    },
  });
  // Actualización simplificada de holdings si corresponde
  if (data.assetId && data.quantity && data.price != null) {
    const existing = await prisma.holding.findUnique({
      where: {
        accountId_assetId: {
          accountId: data.accountId,
          assetId: data.assetId,
        },
      },
    });
    if (data.type === TransactionType.BUY) {
      const qty = data.quantity;
      const cost = data.quantity * data.price;
      if (existing) {
        const newQty = existing.quantity + qty;
        const newAvgCost = (existing.avgCost * existing.quantity + cost) / newQty;
        await prisma.holding.update({
          where: { id: existing.id },
          data: { quantity: newQty, avgCost: newAvgCost },
        });
      } else {
        await prisma.holding.create({
          data: {
            accountId: data.accountId,
            assetId: data.assetId,
            quantity: qty,
            avgCost: cost / qty,
          },
        });
      }
    }
    if (data.type === TransactionType.SELL && existing) {
      const qty = data.quantity;
      const newQty = existing.quantity - qty;
      await prisma.holding.update({
        where: { id: existing.id },
        data: { quantity: newQty < 0 ? 0 : newQty },
      });
    }
  }
  return NextResponse.json(tx, { status: 201 });
}