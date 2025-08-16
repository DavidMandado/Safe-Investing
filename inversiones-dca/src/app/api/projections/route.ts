import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { deterministicProjection, monteCarlo } from '@/lib/projections';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  const assumptions = await prisma.projectionAssumption.findFirst({ where: { userId } });
  if (!assumptions) {
    return new NextResponse('Missing assumptions', { status: 400 });
  }
  const plans = await prisma.planMonth.findMany({ where: { userId } });
  // Calcula proyecciones deterministas para escenarios
  const base = deterministicProjection(assumptions, plans, 30);
  const conservative = deterministicProjection(
    { ...assumptions, expectedReturn: assumptions.expectedReturn - 0.02 },
    plans,
    30
  );
  const optimistic = deterministicProjection(
    { ...assumptions, expectedReturn: assumptions.expectedReturn + 0.02 },
    plans,
    30
  );
  const mc = monteCarlo(assumptions, plans, 1000, 30);
  return NextResponse.json({ base, conservative, optimistic, monteCarlo: mc });
}