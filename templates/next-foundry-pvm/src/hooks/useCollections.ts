import { useQuery } from '@tanstack/react-query';
import { blockscoutAPI } from '@/lib/blockscout';

export function useCollections() {
  return useQuery({
    queryKey: ['erc721-tokens'],
    queryFn: () => blockscoutAPI.getERC721Collections(),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}
