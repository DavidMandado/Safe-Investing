"use client";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  type: z.string().min(1, 'Tipo requerido'),
  symbol: z.string().min(1, 'Símbolo requerido'),
  isin: z.string().optional(),
  name: z.string().min(1, 'Nombre requerido'),
  currency: z.string().length(3, 'Código de moneda de 3 letras'),
  ter: z.string().optional(),
  provider: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AssetForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { currency: 'EUR' } });
  const onSubmit = async (data: FormData) => {
    const parsed = { ...data, ter: data.ter ? parseFloat(data.ter) : undefined };
    const res = await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    });
    if (res.ok) {
      reset();
      window.location.reload();
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <h2 className="text-xl font-semibold">Nuevo activo</h2>
      <div>
        <label className="block text-sm font-medium">Tipo</label>
        <input
          {...register('type')}
          placeholder="ETF, índice, efectivo..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Símbolo</label>
        <input
          {...register('symbol')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        {errors.symbol && <p className="text-red-500 text-sm">{errors.symbol.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">ISIN</label>
        <input
          {...register('isin')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        {errors.isin && <p className="text-red-500 text-sm">{errors.isin.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Moneda</label>
        <input
          {...register('currency')}
          defaultValue="EUR"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        {errors.currency && <p className="text-red-500 text-sm">{errors.currency.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">TER (%)</label>
        <input
          {...register('ter')}
          placeholder="0.20"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        {errors.ter && <p className="text-red-500 text-sm">{errors.ter.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Proveedor</label>
        <input
          {...register('provider')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
      >
        Crear activo
      </button>
    </form>
  );
}