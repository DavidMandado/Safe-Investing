"use client";
import { PlanMonth, PlanStatus } from '@prisma/client';
import { useState } from 'react';

interface PlanWithAlloc extends PlanMonth {
  allocations: {
    id: string;
    asset: { name: string; symbol: string };
    percent: number;
  }[];
}

interface PlanTableProps {
  plans: PlanWithAlloc[];
}

/**
 * Muestra un listado de planes mensuales permitiendo marcar un plan como hecho.
 */
export default function PlanTable({ plans: initialPlans }: PlanTableProps) {
  const [plans, setPlans] = useState(initialPlans);

  const handleMarkDone = async (planId: string) => {
    try {
      await fetch(`/api/plans/${planId}/mark-done`, { method: 'POST' });
      // Actualiza el estado local
      setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, status: PlanStatus.DONE } : p)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="overflow-x-auto rounded-md border dark:border-slate-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gray-50 dark:bg-slate-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Año</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Mes</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Importe (€)</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Asignación</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
          {plans.map((plan) => (
            <tr key={plan.id}>
              <td className="px-4 py-3 whitespace-nowrap">{plan.year}</td>
              <td className="px-4 py-3 whitespace-nowrap">{plan.month}</td>
              <td className="px-4 py-3 whitespace-nowrap">{plan.amountPlanned.toFixed(2)}</td>
              <td className="px-4 py-3 whitespace-nowrap">{plan.status}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {plan.allocations.map((alloc) => (
                  <span key={alloc.id} className="mr-2">
                    {(alloc.percent * 100).toFixed(0)}% {alloc.asset.symbol}
                  </span>
                ))}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right">
                {plan.status === PlanStatus.PLANNED && (
                  <button
                    onClick={() => handleMarkDone(plan.id)}
                    className="px-3 py-1 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Marcar hecho
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}