import prisma from '@/lib/prisma';
import { monteCarlo, deterministicProjection } from '@/lib/projections';
import { addMonths } from 'date-fns';

/**
 * Función cron simulada. En un despliegue real, esta función debería ser invocada por
 * un servicio de cron programado (Vercel Cron o Upstash QStash). Se encarga de
 * recalcular proyecciones y enviar notificaciones de recordatorio de aportación.
 */
export async function runCron() {
  console.log('Cron job started');
  const users = await prisma.user.findMany();
  for (const user of users) {
    const assumptions = await prisma.projectionAssumption.findFirst({ where: { userId: user.id } });
    if (!assumptions) continue;
    const plans = await prisma.planMonth.findMany({ where: { userId: user.id } });
    const projections = deterministicProjection(assumptions, plans, 30);
    const mc = monteCarlo(assumptions, plans, 100, 30);
    console.log(`User ${user.email} projected value in 30y: base=${projections[projections.length - 1].toFixed(2)}, p50=${mc.p50.toFixed(2)}`);
    // Recordatorio de aportación si el plan actual está pendiente y la fecha > día 20
    const now = new Date();
    const plan = plans.find((p) => p.year === now.getUTCFullYear() && p.month === now.getUTCMonth() + 1);
    if (plan && plan.status === 'PLANNED' && now.getUTCDate() >= 20) {
      // Envía notificación (mock)
      console.log(`Enviar recordatorio a ${user.email} para la aportación de ${plan.amountPlanned} €`);
    }
  }
  console.log('Cron job finished');
}

// Si se ejecuta directamente con `ts-node src/jobs/cron.ts`, correr el cron
if (require.main === module) {
  runCron().then(() => process.exit(0));
}