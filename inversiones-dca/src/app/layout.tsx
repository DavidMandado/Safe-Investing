import './globals.css';
import { ReactNode } from 'react';
import Providers from './providers';

export const metadata = {
  title: 'Inversiones DCA',
  description: 'Planificador de inversiones a largo plazo (DCA) con ETFs',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = 'es';
  return (
    <html lang={locale} className="h-full">
      <body className="min-h-full bg-white text-gray-800 dark:bg-slate-900 dark:text-gray-100">
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}