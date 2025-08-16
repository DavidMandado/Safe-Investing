"use client";
import { useState } from 'react';

interface Report {
  year: number;
  month: number;
  contributions: number;
  fees: number;
  transactionCount: number;
}

export default function MonthlyReport() {
  const [month, setMonth] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!month) {
      setError('Seleccione un mes');
      return;
    }
    const res = await fetch(`/api/reports/monthly?month=${month}`);
    if (res.ok) {
      setReport(await res.json());
    } else {
      setError('Error al obtener el informe');
    }
  };
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Informe mensual</h2>
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-4">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-md border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
          Ver informe
        </button>
      </form>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {report && (
        <div className="p-4 border rounded-md dark:border-slate-700">
          <p>
            <strong>{report.year}-{String(report.month).padStart(2, '0')}</strong>
          </p>
          <p>Aportaciones: {report.contributions.toFixed(2)} €</p>
          <p>Comisiones: {report.fees.toFixed(2)} €</p>
          <p>Transacciones: {report.transactionCount}</p>
        </div>
      )}
    </div>
  );
}