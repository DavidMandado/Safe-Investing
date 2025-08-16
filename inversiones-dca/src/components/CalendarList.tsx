"use client";
import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface EventItem {
  id: string;
  type: string;
  title: string;
  date: string;
  status?: string;
}

export default function CalendarList() {
  const [events, setEvents] = useState<EventItem[]>([]);
  useEffect(() => {
    async function load() {
      const res = await fetch('/api/calendar');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    }
    load();
  }, []);
  return (
    <ul className="space-y-3">
      {events.map((ev) => (
        <li key={ev.id} className="p-3 rounded-md border dark:border-slate-700">
          <div className="font-semibold">{ev.title}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {format(parseISO(ev.date), 'PPPP', { locale: es })}
            {ev.status && <span className="ml-2">({ev.status})</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}