import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { TransactionType, PlanStatus } from '@prisma/client';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  const planId = params.id;
  // Obtiene el plan con asignaciones
  const plan = await prisma.planMonth.findFirst({
    where: { id: planId, userId },
    include: { allocations: true },
  });
  if (!plan) {
    return new NextResponse('Not found', { status: 404 });
  }
  if (plan.status !== 'PLANNED') {
    return new NextResponse('Plan already processed', { status: 400 });
  }
  // Busca una cuenta de inversión por defecto del usuario
  const account = await prisma.investmentAccount.findFirst({
    where: { userId },
  });
  if (!account) {
    return new NextResponse('No investment account found', { status: 400 });
  }
  const amount = plan.amountPlanned;
  const date = new Date();
  // Crea transacciones y actualiza holdings
  for (const alloc of plan.allocations) {
    const subtotal = amount * alloc.percent;
    const price = 1; // precio ficticio para simplificar; en producción se usaría el precio de mercado
    const quantity = subtotal / price;
    const fee = 0;
    // Crea transacción
    await prisma.transaction.create({
      data: {
        accountId: account.id,
        assetId: alloc.assetId,
        type: TransactionType.BUY,
        date: date,
        quantity,
        price,
        fee,
        total: subtotal + fee,
      },
    });
    // Actualiza holding
    const existing = await prisma.holding.findUnique({
      where: {
        accountId_assetId: {
          accountId: account.id,
          assetId: alloc.assetId,
        },
      },
    });
    if (existing) {
      const newQty = existing.quantity + quantity;
      const newTotalCost = existing.avgCost * existing.quantity + subtotal;
      await prisma.holding.update({
        where: { id: existing.id },
        data: {
          quantity: newQty,
          avgCost: newTotalCost / newQty,
        },
      });
    } else {
      await prisma.holding.create({
        data: {
          accountId: account.id,
          assetId: alloc.assetId,
          quantity: quantity,
          avgCost: subtotal / quantity,
        },
      });
    }
  }
  // Actualiza el estado del plan
  await prisma.planMonth.update({
    where: { id: plan.id },
    data: {
      status: PlanStatus.DONE,
    },
  });
  return NextResponse.json({ status: 'ok' });
}