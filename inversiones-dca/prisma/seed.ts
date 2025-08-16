/* eslint-disable no-console */
/**
 * Script de semillas para poblar la base de datos con datos de demo.
 *
 * Para ejecutarlo:
 *
 *   npx ts-node prisma/seed.ts
 */
import { PrismaClient, PlanStatus, TransactionType, NotificationType, NotificationChannel } from '@prisma/client';
import { addMonths } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Limpia las tablas (sólo en desarrollo)
  await prisma.verificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.projectionAssumption.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.planAllocation.deleteMany();
  await prisma.planMonth.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.holding.deleteMany();
  await prisma.investmentAccount.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.user.deleteMany();

  // Crea un usuario demo
  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Demo User',
      locale: 'es',
      currency: 'EUR'
    }
  });

  // Crea una cuenta de inversión principal
  const account = await prisma.investmentAccount.create({
    data: {
      name: 'Cuenta Bróker Demo',
      type: 'broker',
      currency: 'EUR',
      user: { connect: { id: user.id } }
    }
  });

  // Lista de ETFs ficticios (UCITS) para demo
  const assetDefinitions = [
    { symbol: 'ETF1', isin: 'IE00ETF00001', name: 'Renta Variable Global', ter: 0.15, provider: 'Proveedor A' },
    { symbol: 'ETF2', isin: 'IE00ETF00002', name: 'Renta Fija Global', ter: 0.12, provider: 'Proveedor B' },
    { symbol: 'ETF3', isin: 'IE00ETF00003', name: 'Renta Variable USA', ter: 0.10, provider: 'Proveedor C' },
    { symbol: 'ETF4', isin: 'IE00ETF00004', name: 'Renta Variable Europa', ter: 0.20, provider: 'Proveedor A' },
    { symbol: 'ETF5', isin: 'IE00ETF00005', name: 'Renta Variable Emergente', ter: 0.25, provider: 'Proveedor D' },
    { symbol: 'ETF6', isin: 'IE00ETF00006', name: 'Bonos Corporativos', ter: 0.18, provider: 'Proveedor E' },
    { symbol: 'ETF7', isin: 'IE00ETF00007', name: 'Bonos Gubernamentales', ter: 0.14, provider: 'Proveedor F' },
    { symbol: 'ETF8', isin: 'IE00ETF00008', name: 'Oro', ter: 0.30, provider: 'Proveedor G' },
    { symbol: 'ETF9', isin: 'IE00ETF00009', name: 'REITs', ter: 0.22, provider: 'Proveedor H' },
    { symbol: 'ETF10', isin: 'IE00ETF00010', name: 'Inversión Socialmente Responsable', ter: 0.17, provider: 'Proveedor I' }
  ];

  const assets = await Promise.all(
    assetDefinitions.map((a) =>
      prisma.asset.create({
        data: {
          type: 'ETF',
          symbol: a.symbol,
          isin: a.isin,
          name: a.name,
          currency: 'EUR',
          ter: a.ter,
          provider: a.provider
        }
      })
    )
  );

  // Plan de aportaciones para los últimos 24 meses y 6 meses futuros
  const monthsBack = 24;
  const monthsForward = 6;
  const now = new Date();
  const plans = [] as any[];
  for (let i = -monthsBack; i < monthsForward; i++) {
    const date = addMonths(now, i);
    const planMonth = await prisma.planMonth.create({
      data: {
        userId: user.id,
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        amountPlanned: 300,
        status: i < 0 ? PlanStatus.DONE : PlanStatus.PLANNED,
        notes: i < 0 ? 'Aportación realizada' : 'Aportación planificada'
      }
    });
    plans.push(planMonth);
    // Crea asignaciones (60% ETF1 y 40% ETF2)
    await prisma.planAllocation.createMany({
      data: [
        { planMonthId: planMonth.id, assetId: assets[0].id, percent: 0.6 },
        { planMonthId: planMonth.id, assetId: assets[1].id, percent: 0.4 }
      ]
    });

    // Si el plan pertenece a meses pasados, crea transacciones y holdings
    if (i < 0) {
      const amount = 300;
      // Calculamos precio aproximado y cantidad
      const price1 = 100 + Math.random() * 10;
      const price2 = 80 + Math.random() * 8;
      const qty1 = (amount * 0.6) / price1;
      const qty2 = (amount * 0.4) / price2;

      await prisma.transaction.createMany({
        data: [
          {
            accountId: account.id,
            assetId: assets[0].id,
            type: TransactionType.BUY,
            date: date,
            quantity: qty1,
            price: price1,
            fee: 1,
            total: qty1 * price1 + 1
          },
          {
            accountId: account.id,
            assetId: assets[1].id,
            type: TransactionType.BUY,
            date: date,
            quantity: qty2,
            price: price2,
            fee: 1,
            total: qty2 * price2 + 1
          }
        ]
      });
    }
  }

  // Actualiza holdings acumuladas
  // Agrupa transacciones por activo y suma cantidades y coste medio
  const transactions = await prisma.transaction.findMany({ where: { accountId: account.id } });
  const holdingsMap: Record<string, { qty: number; totalCost: number }> = {};
  transactions.forEach((tx) => {
    if (!tx.assetId || !tx.quantity || !tx.price) return;
    const entry = holdingsMap[tx.assetId] || { qty: 0, totalCost: 0 };
    if (tx.type === TransactionType.BUY) {
      entry.qty += tx.quantity;
      entry.totalCost += tx.quantity * (tx.price ?? 0) + (tx.fee ?? 0);
    } else if (tx.type === TransactionType.SELL) {
      entry.qty -= tx.quantity;
      entry.totalCost -= tx.quantity * (tx.price ?? 0) - (tx.fee ?? 0);
    }
    holdingsMap[tx.assetId] = entry;
  });
  for (const assetId in holdingsMap) {
    const { qty, totalCost } = holdingsMap[assetId];
    if (qty <= 0) continue;
    await prisma.holding.upsert({
      where: {
        accountId_assetId: {
          accountId: account.id,
          assetId: assetId
        }
      },
      create: {
        accountId: account.id,
        assetId: assetId,
        quantity: qty,
        avgCost: totalCost / qty
      },
      update: {
        quantity: qty,
        avgCost: totalCost / qty
      }
    });
  }

  // Supuestos de proyección por defecto
  await prisma.projectionAssumption.create({
    data: {
      userId: user.id,
      expectedReturn: 0.06,
      volatility: 0.12,
      inflation: 0.02,
      feeDrag: 0.002
    }
  });

  // Objetivo de ejemplo
  await prisma.goal.create({
    data: {
      userId: user.id,
      name: 'Fondo de jubilación',
      targetAmount: 300000,
      targetDate: addMonths(now, 240) // 20 años
    }
  });

  // Notificaciones de demo
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        type: NotificationType.REMINDER,
        channel: NotificationChannel.EMAIL,
        schedule: addMonths(now, 0),
        enabled: true
      },
      {
        userId: user.id,
        type: NotificationType.REBALANCE,
        channel: NotificationChannel.IN_APP,
        schedule: addMonths(now, 3),
        enabled: true
      }
    ]
  });

  console.log('Seeding completed');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });