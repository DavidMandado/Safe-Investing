"use client";
import { useEffect, useState } from 'react';

interface Account {
  id: string;
  name: string;
  type: string;
  currency: string;
}

export default function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  useEffect(() => {
    async function load() {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        setAccounts(await res.json());
      }
    }
    load();
  }, []);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Tus cuentas</h2>
      <ul className="space-y-2">
        {accounts.map((acc) => (
          <li key={acc.id} className="p-3 border rounded-md dark:border-slate-700">
            <div className="font-medium">{acc.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {acc.type} · {acc.currency}
            </div>
          </li>
        ))}
        {accounts.length === 0 && <li>No hay cuentas registradas.</li>}
      </ul>
    </div>
  );
}