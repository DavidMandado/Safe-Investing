"use client";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(1, 'Introduzca un nombre'),
  type: z.string().min(1, 'Introduzca un tipo'),
  currency: z.string().length(3, 'Debe ser un código de 3 letras'),
});

type FormData = z.infer<typeof schema>;

export default function AccountForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      reset();
      // Recarga la lista
      window.location.reload();
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <h2 className="text-xl font-semibold">Nueva cuenta</h2>
      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Tipo</label>
        <input
          {...register('type')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
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
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
      >
        Crear cuenta
      </button>
    </form>
  );
}