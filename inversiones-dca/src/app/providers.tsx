"use client";
import { ReactNode, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from 'next-intl';

interface ProvidersProps {
  children: ReactNode;
  locale: string;
  messages?: Record<string, any>;
}

/**
 * Agrupa proveedores globales como SessionProvider (NextAuth), QueryClientProvider (React Query)
 * e IntlProvider para internacionalización.
 */
export default function Providers({ children, locale, messages }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale={locale} messages={messages}>
          {children}
        </IntlProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}