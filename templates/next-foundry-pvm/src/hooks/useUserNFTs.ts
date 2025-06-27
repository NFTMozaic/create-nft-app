import { useQuery } from '@tanstack/react-query';
import { blockscoutAPI } from '@/lib/blockscout';

export function useUserNFTs(userAddress?: string) {
  return useQuery({
    queryKey: ['user-nfts', userAddress],
    queryFn: () => blockscoutAPI.getUserNFTs(userAddress!),
    enabled: !!userAddress,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}
