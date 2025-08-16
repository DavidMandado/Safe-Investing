import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const assetSchema = z.object({
  type: z.string().min(1),
  symbol: z.string().min(1),
  isin: z.string().min(1).optional(),
  name: z.string().min(1),
  currency: z.string().length(3),
  ter: z.number().optional(),
  provider: z.string().optional(),
});

export async function GET() {
  const assets = await prisma.asset.findMany();
  return NextResponse.json(assets);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  // Sólo usuarios autenticados pueden crear activos
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const body = await req.json();
  const parsed = assetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const asset = await prisma.asset.create({ data: parsed.data });
  return NextResponse.json(asset, { status: 201 });
}