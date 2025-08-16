import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Banda de rebalanceo por defecto (ej. ±5%)
const BAND = 0.05;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  // Obtén plan actual para distribución objetivo
  const now = new Date();
  const currentPlan = await prisma.planMonth.findFirst({
    where: { userId, year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 },
    include: { allocations: true },
  });
  if (!currentPlan) {
    return new NextResponse('No plan found', { status: 400 });
  }
  const targetMap: Record<string, number> = {};
  currentPlan.allocations.forEach((alloc) => {
    targetMap[alloc.assetId] = alloc.percent;
  });
  // Obtén holdings
  const holdings = await prisma.holding.findMany({
    where: { account: { userId } },
    include: { asset: true },
  });
  const totalValue = holdings.reduce((sum, h) => sum + h.quantity * h.avgCost, 0);
  const suggestions: { assetId: string; symbol: string; current: number; target: number; action: string }[] = [];
  holdings.forEach((h) => {
    const currentPct = h.quantity * h.avgCost / totalValue;
    const targetPct = targetMap[h.assetId] ?? 0;
    const diff = currentPct - targetPct;
    if (Math.abs(diff) > BAND) {
      suggestions.push({
        assetId: h.assetId,
        symbol: h.asset.symbol,
        current: currentPct,
        target: targetPct,
        action: diff > 0 ? 'Vender' : 'Comprar',
      });
    }
  });
  return NextResponse.json(suggestions);
}