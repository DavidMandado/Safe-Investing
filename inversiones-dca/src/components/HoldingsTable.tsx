"use client";
import { Holding } from '@prisma/client';

interface HoldingsTableProps {
  holdings: (Holding & { asset: { name: string; symbol: string }; account: { name: string } })[];
}

/**
 * Muestra una tabla de holdings del usuario con nombre de activo, cantidad y coste medio.
 */
export default function HoldingsTable({ holdings }: HoldingsTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border dark:border-slate-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gray-50 dark:bg-slate-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuenta</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Coste medio (€)</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
          {holdings.map((h) => (
            <tr key={h.id}>
              <td className="px-4 py-3 whitespace-nowrap">{h.asset.name} ({h.asset.symbol})</td>
              <td className="px-4 py-3 whitespace-nowrap">{h.account.name}</td>
              <td className="px-4 py-3 whitespace-nowrap text-right">{h.quantity.toFixed(4)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-right">{h.avgCost.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}