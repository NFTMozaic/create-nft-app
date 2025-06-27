import { useQuery } from '@tanstack/react-query';
import { blockscoutAPI } from '@/lib/blockscout';

export function useCollectionTokens(contractAddress: string) {
  return useQuery({
    queryKey: ['collection-tokens', contractAddress],
    queryFn: () => blockscoutAPI.getCollectionTokens(contractAddress),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: !!contractAddress,
  });
}
