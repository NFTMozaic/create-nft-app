'use client';

import { use } from 'react';
import { useCollectionTokens } from '@/hooks/useCollectionTokens';
import { TokenGrid } from '@/components/TokenGrid';
import { Loader } from '@/components/Loader';

interface CollectionPageProps {
  params: Promise<{
    address: string;
  }>;
}

export default function CollectionPage({ params }: CollectionPageProps) {
  const { address } = use(params);
  const { data: tokens, isLoading, error } = useCollectionTokens(address);

  if (isLoading) {
    return (
      <div className="container">
        <Loader message="Loading tokens..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">Error loading tokens: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1 className="page-title" style={{ margin: 0 }}>
          Collection Tokens
        </h1>
        <p
          style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {address.slice(0, 8)}...{address.slice(-6)}
        </p>
      </div>

      <TokenGrid
        tokens={tokens || []}
        gridClassName="grid-auto"
        emptyMessage="No tokens found in this collection"
      />
    </div>
  );
}
