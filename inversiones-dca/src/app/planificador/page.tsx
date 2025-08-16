import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import PlanTable from '@/components/PlanTable';

export default async function PlanificadorPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/api/auth/signin');
  }
  const userId = session.user.id;
  // Obtiene todos los planes ordenados por fecha
  const plans = await prisma.planMonth.findMany({
    where: { userId },
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
    include: { allocations: { include: { asset: true } } }
  });
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Planificador mensual</h1>
      <PlanTable plans={plans} />
    </div>
  );
}