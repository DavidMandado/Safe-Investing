"use client";
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TransactionType } from '@prisma/client';

const schema = z.object({
  accountId: z.string().min(1),
  assetId: z.string().optional(),
  type: z.nativeEnum(TransactionType),
  date: z.string(),
  quantity: z.string().optional(),
  price: z.string().optional(),
  fee: z.string().optional(),
  total: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

interface Account {
  id: string;
  name: string;
}

interface Asset {
  id: string;
  symbol: string;
}

export default function TransactionForm() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { date: new Date().toISOString().slice(0, 10) } });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  useEffect(() => {
    async function load() {
      const aRes = await fetch('/api/accounts');
      if (aRes.ok) setAccounts(await aRes.json());
      const bRes = await fetch('/api/assets');
      if (bRes.ok) setAssets(await bRes.json());
    }
    load();
  }, []);
  const onSubmit = async (data: FormData) => {
    const payload = {
      accountId: data.accountId,
      assetId: data.assetId || null,
      type: data.type,
      date: data.date,
      quantity: data.quantity ? parseFloat(data.quantity) : null,
      price: data.price ? parseFloat(data.price) : null,
      fee: data.fee ? parseFloat(data.fee) : null,
      total: parseFloat(data.total),
    };
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      reset();
      window.location.reload();
    }
  };
  const type = watch('type');
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <h2 className="text-xl font-semibold">Nueva transacción</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Cuenta</label>
          <select
            {...register('accountId')}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Seleccione cuenta</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          {errors.accountId && <p className="text-red-500 text-sm">{errors.accountId.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Tipo</label>
          <select
            {...register('type')}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {Object.values(TransactionType).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
        </div>
      </div>
      {type !== TransactionType.FEE && (
        <div>
          <label className="block text-sm font-medium">Activo (opcional)</label>
          <select
            {...register('assetId')}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">(sin activo)</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.symbol}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium">Fecha</label>
        <input
          type="date"
          {...register('date')}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
      </div>
      {type !== TransactionType.FEE && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Cantidad</label>
            <input
              type="number"
              step="any"
              {...register('quantity')}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Precio</label>
            <input
              type="number"
              step="any"
              {...register('price')}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Fee</label>
            <input
              type="number"
              step="any"
              {...register('fee')}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {errors.fee && <p className="text-red-500 text-sm">{errors.fee.message}</p>}
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium">Total (€)</label>
        <input
          type="number"
          step="any"
          {...register('total')}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        {errors.total && <p className="text-red-500 text-sm">{errors.total.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
      >
        Registrar transacción
      </button>
    </form>
  );
}