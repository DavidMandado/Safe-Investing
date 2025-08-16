import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AccountList from '@/components/AccountList';
import AccountForm from '@/components/AccountForm';

export default async function CuentasPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/api/auth/signin');
  }
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Cuentas</h1>
      <AccountForm />
      <AccountList />
    </div>
  );
}