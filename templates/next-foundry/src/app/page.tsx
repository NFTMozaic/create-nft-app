'use client';

import { useCollections } from '@/hooks/useCollections';
import { useUserNFTs } from '@/hooks/useUserNFTs';
import { ERC721Collection } from '@/components/ERC721Collection';
import { TokenGrid } from '@/components/TokenGrid';
import { NoNFTs } from '@/components/NoNFTs';
import { MintNFTButton } from '@/components/MintNFTButton';
import { Loader } from '@/components/Loader';
import { useAccount } from 'wagmi';

export default function Home() {
  const { data: collections, isLoading, error } = useCollections();
  const { address } = useAccount();
  const {
    data: userNFTs,
    isLoading: userNFTsLoading,
    error: userNFTsError,
  } = useUserNFTs(address);

  if (isLoading) {
    return (
      <div className="container">
        <Loader message="Loading collections..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">Error loading NFTs: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container">
      {address && (
        <div className="user-nfts">
          <div className="user-nfts-header">
            <h2 className="page-title">Your NFTs</h2>
          </div>

          <MintNFTButton />

          {userNFTsLoading ? (
            <Loader message="Loading your NFTs..." />
          ) : userNFTsError ? (
            <div className="error">
              Error loading your NFTs: {userNFTsError.message}
            </div>
          ) : userNFTs && userNFTs.length > 0 ? (
            <TokenGrid
              tokens={userNFTs}
              gridClassName="user-nfts-grid"
              emptyMessage="No NFTs found"
            />
          ) : (
            <NoNFTs />
          )}
        </div>
      )}

      <div className="header">
        <h1 className="page-title">All Polkadot NFT Collections</h1>
      </div>

      {collections && collections.length > 0 ? (
        <div className="grid-responsive">
          {collections.map(collection => (
            <ERC721Collection
              key={collection.address}
              collection={collection}
            />
          ))}
        </div>
      ) : (
        <div className="empty">No NFT collections found</div>
      )}
    </div>
  );
}
