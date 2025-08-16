import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Esquema de creación de plan
const createPlanSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  amountPlanned: z.number().positive(),
  allocations: z
    .array(
      z.object({
        assetId: z.string(),
        percent: z.number().min(0).max(1),
      })
    )
    .nonempty()
    .refine((arr) => Math.abs(arr.reduce((sum, cur) => sum + cur.percent, 0) - 1) < 0.01, {
      message: 'La suma de porcentajes debe ser 1',
    }),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  const plans = await prisma.planMonth.findMany({
    where: { userId },
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
    include: { allocations: true },
  });
  return NextResponse.json(plans);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  const body = await req.json();
  const parsed = createPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { year, month, amountPlanned, allocations } = parsed.data;
  // Crea plan y asignaciones
  const plan = await prisma.planMonth.create({
    data: {
      userId,
      year,
      month,
      amountPlanned,
      status: 'PLANNED',
      allocations: {
        create: allocations.map((alloc) => ({ assetId: alloc.assetId, percent: alloc.percent })),
      },
    },
    include: { allocations: true },
  });
  return NextResponse.json(plan, { status: 201 });
}