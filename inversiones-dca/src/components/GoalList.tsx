"use client";
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
}

export default function GoalList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  useEffect(() => {
    async function load() {
      const res = await fetch('/api/goals');
      if (res.ok) setGoals(await res.json());
    }
    load();
  }, []);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Metas</h2>
      <ul className="space-y-2">
        {goals.map((g) => (
          <li key={g.id} className="p-3 border rounded-md dark:border-slate-700">
            <div className="font-medium">{g.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Objetivo: {g.targetAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} antes de {format(new Date(g.targetDate), 'yyyy-MM-dd')}
            </div>
          </li>
        ))}
        {goals.length === 0 && <li>No hay metas definidas.</li>}
      </ul>
    </div>
  );
}