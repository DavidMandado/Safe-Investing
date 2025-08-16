import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';

export default async function TransaccionesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/api/auth/signin');
  }
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Transacciones</h1>
      <TransactionForm />
      <TransactionList />
    </div>
  );
}