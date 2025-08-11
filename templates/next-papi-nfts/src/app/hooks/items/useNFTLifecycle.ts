'use client';

import { useState, useCallback } from 'react';
import { usePolkadot } from '../../contexts/PolkadotContext';
import { useWallet } from '../../contexts/WalletContext';
import { SS58String } from 'polkadot-api';

export interface NFTDetails {
  owner: string;
  approvals: SS58String[];
  deposit: {
    account: string;
    amount: bigint;
  };
}

export interface CollectionItemStats {
  totalItems: number;
  items: Array<{
    itemId: number;
    owner: string;
  }>;
}

export const useNFTLifecycle = () => {
  const { api, isConnected } = usePolkadot();
  const { selectedAccount } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Burn/destroy an NFT
  const burn = useCallback(async (
    collectionId: number,
    itemId: number
  ) => {
    if (!api || !selectedAccount || !isConnected) {
      throw new Error('Polkadot API or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const burnTx = await api.tx.Nfts.burn({
        collection: collectionId,
        item: itemId,
      }).signAndSubmit(selectedAccount.polkadotSigner);

      return {
        transactionHash: burnTx.txHash,
        blockHash: burnTx.block.hash,
        events: burnTx.events,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to burn NFT';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api, selectedAccount, isConnected]);

  // Get NFT details
  const getNFTDetails = useCallback(async (
    collectionId: number,
    itemId: number
  ): Promise<NFTDetails | null> => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    try {
      const item = await api.query.Nfts.Item.getValue(collectionId, itemId);
      
      if (!item) {
        return null;
      }

      return {
        owner: item.owner,
        approvals: item.approvals ? item.approvals.map(a => a[0]) : [],
        deposit: item.deposit,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get NFT details';
      throw new Error(errorMessage);
    }
  }, [api]);

  // Check if NFT exists
  const nftExists = useCallback(async (
    collectionId: number,
    itemId: number
  ): Promise<boolean> => {
    try {
      const details = await getNFTDetails(collectionId, itemId);
      return details !== null;
    } catch (err) {
      console.warn('Failed to check NFT existence:', err);
      return false;
    }
  }, [getNFTDetails]);

  // Get all items in a collection
  const getCollectionItems = useCallback(async (
    collectionId: number
  ): Promise<CollectionItemStats> => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    try {
      const itemEntries = await api.query.Nfts.Item.getEntries(collectionId);
      
      const items = itemEntries.map(entry => ({
        itemId: entry.keyArgs[1] as number,
        owner: entry.value.owner,
      }));

      return {
        totalItems: items.length,
        items: items.sort((a, b) => a.itemId - b.itemId),
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get collection items';
      throw new Error(errorMessage);
    }
  }, [api]);

  // Get next available item ID for a collection
  const getNextItemId = useCallback(async (
    collectionId: number
  ): Promise<number> => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    try {
      const items = await getCollectionItems(collectionId);
      
      if (items.totalItems === 0) {
        return 1; // Start with item ID 1
      }

      // Find the next available ID
      const existingIds = items.items.map(item => item.itemId).sort((a, b) => a - b);
      
      // Check for gaps in the sequence
      for (let i = 1; i <= existingIds[existingIds.length - 1]; i++) {
        if (!existingIds.includes(i)) {
          return i;
        }
      }
      
      // If no gaps, return next sequential ID
      return existingIds[existingIds.length - 1] + 1;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get next item ID';
      throw new Error(errorMessage);
    }
  }, [api, getCollectionItems]);

  // Batch burn multiple NFTs
  const batchBurn = useCallback(async (
    burnData: Array<{ collectionId: number; itemId: number }>
  ) => {
    if (!api || !selectedAccount || !isConnected) {
      throw new Error('Polkadot API or wallet not connected');
    }

    if (burnData.length === 0) {
      throw new Error('No items to burn provided');
    }

    setIsLoading(true);
    setError(null);

    try {
      const calls = burnData.map(({ collectionId, itemId }) =>
        api.tx.Nfts.burn({
          collection: collectionId,
          item: itemId,
        }).decodedCall
      );

      const batchTx = await api.tx.Utility.batch_all({
        calls: calls,
      }).signAndSubmit(selectedAccount.polkadotSigner);

      return {
        transactionHash: batchTx.txHash,
        blockHash: batchTx.block.hash,
        events: batchTx.events,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to batch burn NFTs';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api, selectedAccount, isConnected]);

  // Get items owned by a specific account in a collection
  const getAccountItemsInCollection = useCallback(async (
    collectionId: number,
    accountAddress?: string
  ) => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    const address = accountAddress || selectedAccount?.address;
    if (!address) {
      throw new Error('No account address provided');
    }

    try {
      const accountEntries = await api.query.Nfts.Account.getEntries(
        address,
        collectionId
      );

      const items = accountEntries.map(entry => ({
        collectionId: entry.keyArgs[1] as number,
        itemId: entry.keyArgs[2] as number,
        owner: address,
      }));

      return items;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get account items in collection';
      throw new Error(errorMessage);
    }
  }, [api, selectedAccount]);

  // Get all NFTs owned by an account across all collections
  const getAllOwnedNFTs = useCallback(async (
    accountAddress?: string
  ) => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    const address = accountAddress || selectedAccount?.address;
    if (!address) {
      throw new Error('No account address provided');
    }

    try {
      const accountEntries = await api.query.Nfts.Account.getEntries(address);

      const nfts = accountEntries.map(entry => ({
        collectionId: entry.keyArgs[1] as number,
        itemId: entry.keyArgs[2] as number,
        owner: address,
      }));

      // Group by collection for easier handling
      const nftsByCollection = nfts.reduce((acc, nft) => {
        const collectionId = nft.collectionId;
        if (!acc[collectionId]) {
          acc[collectionId] = [];
        }
        acc[collectionId].push(nft);
        return acc;
      }, {} as Record<number, typeof nfts>);

      return {
        totalNFTs: nfts.length,
        nfts,
        nftsByCollection,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get all owned NFTs';
      throw new Error(errorMessage);
    }
  }, [api, selectedAccount]);

  // Search for NFTs by owner
  const searchNFTsByOwner = useCallback(async (
    ownerAddress: string,
    collectionId?: number
  ) => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    try {
      let accountEntries;
      
      if (collectionId !== undefined) {
        // Search within specific collection
        accountEntries = await api.query.Nfts.Account.getEntries(
          ownerAddress,
          collectionId
        );
      } else {
        // Search across all collections
        accountEntries = await api.query.Nfts.Account.getEntries(ownerAddress);
      }

      const results = accountEntries.map(entry => ({
        collectionId: entry.keyArgs[1] as number,
        itemId: entry.keyArgs[2] as number,
        owner: ownerAddress,
      }));

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search NFTs by owner';
      throw new Error(errorMessage);
    }
  }, [api]);

  // Get NFT history/events (if available)
  const getNFTHistory = useCallback(async (
    collectionId: number,
    itemId: number
  ) => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    try {
      // This would require event indexing or block scanning
      // For now, we return basic current state info
      const details = await getNFTDetails(collectionId, itemId);
      
      if (!details) {
        return null;
      }

      return {
        currentOwner: details.owner,
        currentApprovals: details.approvals,
        deposit: details.deposit,
        // Additional history would require event scanning
        events: [], // Placeholder for historical events
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get NFT history';
      throw new Error(errorMessage);
    }
  }, [api, getNFTDetails]);

  return {
    // Core lifecycle functions
    burn,
    batchBurn,
    
    // NFT queries
    getNFTDetails,
    nftExists,
    
    // Collection queries
    getCollectionItems,
    getNextItemId,
    
    // Owner-based queries
    getAccountItemsInCollection,
    getAllOwnedNFTs,
    searchNFTsByOwner,
    
    // History and analytics
    getNFTHistory,
    
    // State
    isLoading,
    error,
    isReady: !!api && !!selectedAccount && isConnected,
  };
};