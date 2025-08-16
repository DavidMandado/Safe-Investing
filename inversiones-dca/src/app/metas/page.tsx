import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import GoalForm from '@/components/GoalForm';
import GoalList from '@/components/GoalList';

export default async function MetasPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/api/auth/signin');
  }
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Metas</h1>
      <GoalForm />
      <GoalList />
    </div>
  );
}