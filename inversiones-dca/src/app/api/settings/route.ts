import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const settingsSchema = z.object({
  expectedReturn: z.number(),
  volatility: z.number(),
  inflation: z.number(),
  feeDrag: z.number(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const assumptions = await prisma.projectionAssumption.findFirst({ where: { userId: session.user.id } });
  if (!assumptions) {
    return NextResponse.json({ expectedReturn: 0.06, volatility: 0.12, inflation: 0.02, feeDrag: 0.002 });
  }
  return NextResponse.json(assumptions);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const data = parsed.data;
  const existing = await prisma.projectionAssumption.findFirst({ where: { userId: session.user.id } });
  if (existing) {
    await prisma.projectionAssumption.update({
      where: { id: existing.id },
      data: data,
    });
  } else {
    await prisma.projectionAssumption.create({
      data: { ...data, userId: session.user.id },
    });
  }
  return NextResponse.json({ status: 'ok' });
}