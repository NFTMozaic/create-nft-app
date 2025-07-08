'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { PolkadotProvider } from '../contexts/PolkadotContext';
import { WalletProvider } from '../contexts/WalletContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <PolkadotProvider>
          {children}
        </PolkadotProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
} 