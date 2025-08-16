import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  // Recoge planes mensuales y metas como eventos
  const plans = await prisma.planMonth.findMany({ where: { userId } });
  const goals = await prisma.goal.findMany({ where: { userId } });
  const events = [] as any[];
  plans.forEach((plan) => {
    const date = new Date(Date.UTC(plan.year, plan.month - 1, 1));
    events.push({
      id: plan.id,
      type: 'plan',
      title: `Aportación ${plan.amountPlanned} €`,
      date: date.toISOString(),
      status: plan.status,
    });
  });
  goals.forEach((goal) => {
    events.push({
      id: goal.id,
      type: 'goal',
      title: `Meta: ${goal.name}`,
      date: goal.targetDate.toISOString(),
    });
  });
  return NextResponse.json(events);
}