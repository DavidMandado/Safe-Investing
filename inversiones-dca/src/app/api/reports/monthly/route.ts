import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get('month');
  if (!monthParam) {
    return new NextResponse('Missing month parameter', { status: 400 });
  }
  const [yearStr, monthStr] = monthParam.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(month)) {
    return new NextResponse('Invalid date', { status: 400 });
  }
  const userId = session.user.id;
  // Filtrar transacciones por mes
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const transactions = await prisma.transaction.findMany({
    where: {
      account: { userId },
      date: { gte: start, lt: end },
    },
  });
  // Agrupa métricas
  let contributions = 0;
  let fees = 0;
  transactions.forEach((tx) => {
    if (tx.type === 'BUY' || tx.type === 'CONTRIBUTION') {
      contributions += tx.total;
    }
    if (tx.fee) fees += tx.fee;
  });
  const report = {
    year,
    month,
    contributions,
    fees,
    transactionCount: transactions.length,
  };
  return NextResponse.json(report);
}