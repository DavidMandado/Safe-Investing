"use client";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  targetAmount: z.string().min(1, 'Importe requerido'),
  targetDate: z.string().min(1, 'Fecha requerida'),
});

type FormData = z.infer<typeof schema>;

export default function GoalForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        targetAmount: parseFloat(data.targetAmount),
        targetDate: data.targetDate,
      }),
    });
    if (res.ok) {
      reset();
      window.location.reload();
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <h2 className="text-xl font-semibold">Nueva meta</h2>
      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Importe objetivo (€)</label>
        <input
          type="number"
          step="any"
          {...register('targetAmount')}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        {errors.targetAmount && <p className="text-red-500 text-sm">{errors.targetAmount.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Fecha objetivo</label>
        <input
          type="date"
          {...register('targetDate')}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        {errors.targetDate && <p className="text-red-500 text-sm">{errors.targetDate.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
      >
        Crear meta
      </button>
    </form>
  );
}