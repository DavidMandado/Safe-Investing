import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const accountSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  currency: z.string().length(3),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const accounts = await prisma.investmentAccount.findMany({
    where: { userId: session.user.id },
  });
  return NextResponse.json(accounts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const body = await req.json();
  const parsed = accountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const account = await prisma.investmentAccount.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
    },
  });
  return NextResponse.json(account, { status: 201 });
}