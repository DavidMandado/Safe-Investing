"use client";
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  accountId: string;
  assetId: string | null;
  type: string;
  date: string;
  quantity: number | null;
  price: number | null;
  fee: number | null;
  total: number;
}

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  useEffect(() => {
    async function load() {
      const res = await fetch('/api/transactions');
      if (res.ok) setTransactions(await res.json());
    }
    load();
  }, []);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Histórico de transacciones</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Cantidad</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Total (€)</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="px-4 py-3 whitespace-nowrap">
                  {format(new Date(tx.date), 'yyyy-MM-dd')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{tx.type}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {tx.quantity ? tx.quantity.toFixed(4) : '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{tx.total.toFixed(2)}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-center">
                  No hay transacciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}