import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const goalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  targetDate: z.string().transform((d) => new Date(d)),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const goals = await prisma.goal.findMany({ where: { userId: session.user.id } });
  return NextResponse.json(goals);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const body = await req.json();
  const parsed = goalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const goal = await prisma.goal.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
    },
  });
  return NextResponse.json(goal, { status: 201 });
}