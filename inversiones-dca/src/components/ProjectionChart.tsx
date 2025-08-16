"use client";
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ProjectionResponse {
  base: number[];
  conservative: number[];
  optimistic: number[];
  monteCarlo: { p10: number; p50: number; p90: number };
}

export default function ProjectionChart() {
  const [data, setData] = useState<any[]>([]);
  const [mc, setMc] = useState<{ p10: number; p50: number; p90: number } | null>(null);
  useEffect(() => {
    async function load() {
      const res = await fetch('/api/projections');
      if (res.ok) {
        const proj: ProjectionResponse = await res.json();
        // Construye datos para Recharts
        const rows = proj.base.map((val, i) => ({ month: i + 1, base: val, conservative: proj.conservative[i], optimistic: proj.optimistic[i] }));
        setData(rows);
        setMc(proj.monteCarlo);
      }
    }
    load();
  }, []);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Proyección determinista</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="month" tick={false} label={{ value: 'Meses', position: 'insideBottomRight', offset: -5 }} />
          <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} label={{ value: '€', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value: number) => value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} />
          <Legend />
          <Line type="monotone" dataKey="conservative" stroke="#d97706" dot={false} name="Conservador" />
          <Line type="monotone" dataKey="base" stroke="#2563eb" dot={false} name="Base" />
          <Line type="monotone" dataKey="optimistic" stroke="#16a34a" dot={false} name="Optimista" />
        </LineChart>
      </ResponsiveContainer>
      {mc && (
        <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
          <p>
            <strong>Monte Carlo (1.000 corridas):</strong> percentiles P10: {mc.p10.toFixed(0)} €, P50:{' '}
            {mc.p50.toFixed(0)} €, P90: {mc.p90.toFixed(0)} €
          </p>
        </div>
      )}
    </div>
  );
}