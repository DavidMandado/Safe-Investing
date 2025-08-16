import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AssetForm from '@/components/AssetForm';
import AssetList from '@/components/AssetList';

export default async function ActivosPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/api/auth/signin');
  }
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Activos</h1>
      <AssetForm />
      <AssetList />
    </div>
  );
}