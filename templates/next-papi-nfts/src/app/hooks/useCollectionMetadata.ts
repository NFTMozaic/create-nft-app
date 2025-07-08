'use client';

import { useQuery } from '@tanstack/react-query';
import { usePolkadot } from '../contexts/PolkadotContext';

type CollectionMetadata = {
  deposit: bigint;
  data: string;
} | null;

export function useCollectionMetadata(collectionId: number | undefined) {
  const { api, isConnected } = usePolkadot();

  return useQuery<CollectionMetadata>({
    queryKey: ['collection-metadata', collectionId],
    queryFn: async () => {
      const metadata = await api.query.Nfts.CollectionMetadataOf.getValue(collectionId!);
      if (!metadata) return null;
      
      return {
        deposit: metadata.deposit,
        data: metadata.data.asText(),
      };
    },
    enabled: isConnected && !!api && collectionId !== undefined,
    staleTime: 5 * 60 * 1000,
  });
}