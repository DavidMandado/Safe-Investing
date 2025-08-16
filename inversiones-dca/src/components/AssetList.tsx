"use client";
import { useEffect, useState } from 'react';

interface Asset {
  id: string;
  type: string;
  symbol: string;
  name: string;
  currency: string;
  ter: number | null;
  provider: string | null;
}

export default function AssetList() {
  const [assets, setAssets] = useState<Asset[]>([]);
  useEffect(() => {
    async function load() {
      const res = await fetch('/api/assets');
      if (res.ok) setAssets(await res.json());
    }
    load();
  }, []);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Lista de activos</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Símbolo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Moneda</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">TER</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Proveedor</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
            {assets.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 whitespace-nowrap">{a.symbol}</td>
                <td className="px-4 py-3 whitespace-nowrap">{a.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">{a.type}</td>
                <td className="px-4 py-3 whitespace-nowrap">{a.currency}</td>
                <td className="px-4 py-3 whitespace-nowrap">{a.ter ? `${a.ter}%` : '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{a.provider ?? '-'}</td>
              </tr>
            ))}
            {assets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-3 text-center">
                  No hay activos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}