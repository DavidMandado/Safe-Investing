import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import HoldingsTable from '@/components/HoldingsTable';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/api/auth/signin');
  }
  const userId = session.user.id;
  // Obtener holdings y plan del mes en curso
  const holdings = await prisma.holding.findMany({
    where: { account: { userId: userId } },
    include: {
      asset: true,
      account: true
    }
  });
  const currentDate = new Date();
  const plan = await prisma.planMonth.findFirst({
    where: {
      userId: userId,
      year: currentDate.getUTCFullYear(),
      month: currentDate.getUTCMonth() + 1
    },
    include: { allocations: { include: { asset: true } } }
  });

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <section>
        <h2 className="text-xl font-semibold mb-2">Tus posiciones</h2>
        <HoldingsTable holdings={holdings} />
      </section>
      {plan && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Plan del mes actual</h2>
          <div className="p-4 rounded-md border dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
            <p>
              Aportación planificada: <strong>{plan.amountPlanned.toFixed(2)} €</strong> -{' '}
              Estado: <strong>{plan.status}</strong>
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              {plan.allocations.map((alloc) => (
                <li key={alloc.id}>
                  {alloc.percent * 100}% en {alloc.asset.name} ({alloc.asset.symbol})
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}