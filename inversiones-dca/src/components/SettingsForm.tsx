"use client";
import { useEffect, useState } from 'react';

interface Settings {
  expectedReturn: number;
  volatility: number;
  inflation: number;
  feeDrag: number;
}

export default function SettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    async function load() {
      const res = await fetch('/api/settings');
      if (res.ok) setSettings(await res.json());
    }
    load();
  }, []);
  const handleChange = (field: keyof Settings, value: string) => {
    if (!settings) return;
    const num = parseFloat(value);
    setSettings({ ...settings, [field]: isNaN(num) ? 0 : num });
  };
  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (res.ok) {
      alert('Ajustes guardados');
    }
  };
  if (!settings) return <p>Cargando ajustes...</p>;
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Supuestos de proyección</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Retorno esperado anual</label>
          <input
            type="number"
            step="any"
            value={settings.expectedReturn}
            onChange={(e) => handleChange('expectedReturn', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Volatilidad anual</label>
          <input
            type="number"
            step="any"
            value={settings.volatility}
            onChange={(e) => handleChange('volatility', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Inflación anual</label>
          <input
            type="number"
            step="any"
            value={settings.inflation}
            onChange={(e) => handleChange('inflation', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Comisiones (% anual)</label>
          <input
            type="number"
            step="any"
            value={settings.feeDrag}
            onChange={(e) => handleChange('feeDrag', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
      >
        Guardar ajustes
      </button>
    </div>
  );
}