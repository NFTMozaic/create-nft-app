'use client';

import { useState, useCallback } from 'react';
import { Enum } from 'polkadot-api';
import { usePolkadot } from '../../contexts/PolkadotContext';
import { useWallet } from '../../contexts/WalletContext';

type PriceDirection = Enum<{
  Send: undefined;
  Receive: undefined;
}>;

export interface SwapPrice {
  amount: bigint;
  direction: PriceDirection;
}

export interface SwapOffer {
  offeredCollection: number;
  offeredItem: number;
  desiredCollection: number;
  desiredItem?: number; // undefined means any item from the collection
  price?: SwapPrice;
  duration: number; // blocks until expiration
}

export interface PendingSwap {
  offeredCollection: number;
  offeredItem: number;
  desiredCollection: number;
  desiredItem?: number;
  price?: SwapPrice;
  deadline: number; // block number when swap expires
  creator: string;
}

export const useNFTSwapping = () => {
  const { api, isConnected } = usePolkadot();
  const { selectedAccount } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a swap offer
  const createSwap = useCallback(
    async (
      offeredCollection: number,
      offeredItem: number,
      desiredCollection: number,
      desiredItem?: number,
      price?: SwapPrice,
      duration: number = 1000
    ) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const createSwapTx = await api.tx.Nfts.create_swap({
          offered_collection: offeredCollection,
          offered_item: offeredItem,
          desired_collection: desiredCollection,
          maybe_desired_item: desiredItem,
          maybe_price: price
            ? {
                amount: price.amount,
                direction: price.direction,
              }
            : undefined,
          duration: duration,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: createSwapTx.txHash,
          blockHash: createSwapTx.block.hash,
          events: createSwapTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create swap offer';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Claim/accept a swap offer
  const claimSwap = useCallback(
    async (
      sendCollection: number,
      sendItem: number,
      receiveCollection: number,
      receiveItem: number,
      witnessPrice?: SwapPrice
    ) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const claimSwapTx = await api.tx.Nfts.claim_swap({
          send_collection: sendCollection,
          send_item: sendItem,
          receive_collection: receiveCollection,
          receive_item: receiveItem,
          witness_price: witnessPrice
            ? {
                amount: witnessPrice.amount,
                direction: witnessPrice.direction,
              }
            : undefined,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: claimSwapTx.txHash,
          blockHash: claimSwapTx.block.hash,
          events: claimSwapTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to claim swap';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Cancel a swap offer
  const cancelSwap = useCallback(
    async (offeredCollection: number, offeredItem: number) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const cancelSwapTx = await api.tx.Nfts.cancel_swap({
          offered_collection: offeredCollection,
          offered_item: offeredItem,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: cancelSwapTx.txHash,
          blockHash: cancelSwapTx.block.hash,
          events: cancelSwapTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to cancel swap';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Get pending swap for a specific NFT
  const getPendingSwap = useCallback(
    async (
      collectionId: number,
      itemId: number
    ): Promise<PendingSwap | null> => {
      if (!api) {
        throw new Error('Polkadot API not connected');
      }

      try {
        const swap = await api.query.Nfts.PendingSwapOf.getValue(
          collectionId,
          itemId
        );

        if (!swap) {
          return null;
        }

        // Get current block number to calculate if swap is still valid
        const currentBlock = await api.query.System.Number.getValue();

        // Get the creator (current owner of the offered item)
        const item = await api.query.Nfts.Item.getValue(collectionId, itemId);

        return {
          offeredCollection: collectionId,
          offeredItem: itemId,
          desiredCollection: swap.desired_collection,
          desiredItem: swap.desired_item,
          price: swap.price
            ? {
                amount: swap.price.amount,
                direction: swap.price.direction,
              }
            : undefined,
          deadline: swap.deadline,
          creator: item?.owner || '',
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get pending swap';
        throw new Error(errorMessage);
      }
    },
    [api]
  );

  // Check if a swap is still valid (not expired)
  const isSwapValid = useCallback(
    async (collectionId: number, itemId: number): Promise<boolean> => {
      try {
        const swap = await getPendingSwap(collectionId, itemId);

        if (!swap) {
          return false;
        }

        const currentBlock = await api?.query.System.Number.getValue();
        if (!currentBlock) {
          return false;
        }

        return currentBlock < swap.deadline;
      } catch (err) {
        console.warn('Failed to check swap validity:', err);
        return false;
      }
    },
    [api, getPendingSwap]
  );

  // Get all pending swaps in a collection
  const getCollectionSwaps = useCallback(
    async (collectionId: number): Promise<PendingSwap[]> => {
      if (!api) {
        throw new Error('Polkadot API not connected');
      }

      try {
        const swapEntries =
          await api.query.Nfts.PendingSwapOf.getEntries(collectionId);

        const swaps: PendingSwap[] = [];
        const currentBlock = await api.query.System.Number.getValue();

        for (const entry of swapEntries) {
          const itemId = entry.keyArgs[1] as number;
          const swapData = entry.value;

          // Skip expired swaps
          if (currentBlock >= swapData.deadline) {
            continue;
          }

          // Get the creator
          const item = await api.query.Nfts.Item.getValue(collectionId, itemId);

          swaps.push({
            offeredCollection: collectionId,
            offeredItem: itemId,
            desiredCollection: swapData.desired_collection,
            desiredItem: swapData.desired_item,
            price: swapData.price
              ? {
                  amount: swapData.price.amount,
                  direction: swapData.price.direction,
                }
              : undefined,
            deadline: swapData.deadline,
            creator: item?.owner || '',
          });
        }

        return swaps;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get collection swaps';
        throw new Error(errorMessage);
      }
    },
    [api]
  );

  // Get all pending swaps created by a user
  const getUserSwaps = useCallback(
    async (userAddress?: string): Promise<PendingSwap[]> => {
      if (!api) {
        throw new Error('Polkadot API not connected');
      }

      const address = userAddress || selectedAccount?.address;
      if (!address) {
        throw new Error('No user address provided');
      }

      try {
        // Get all items owned by the user
        const ownedItems = await api.query.Nfts.Account.getEntries(address);

        const userSwaps: PendingSwap[] = [];
        const currentBlock = await api.query.System.Number.getValue();

        for (const entry of ownedItems) {
          const collectionId = entry.keyArgs[1] as number;
          const itemId = entry.keyArgs[2] as number;

          // Check if this item has a pending swap
          const swap = await api.query.Nfts.PendingSwapOf.getValue(
            collectionId,
            itemId
          );

          if (swap && currentBlock < swap.deadline) {
            userSwaps.push({
              offeredCollection: collectionId,
              offeredItem: itemId,
              desiredCollection: swap.desired_collection,
              desiredItem: swap.desired_item,
              price: swap.price
                ? {
                    amount: swap.price.amount,
                    direction: swap.price.direction,
                  }
                : undefined,
              deadline: swap.deadline,
              creator: address,
            });
          }
        }

        return userSwaps;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get user swaps';
        throw new Error(errorMessage);
      }
    },
    [api, selectedAccount]
  );

  // Get all active swaps across all collections
  const getAllActiveSwaps = useCallback(async (): Promise<PendingSwap[]> => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    try {
      const allSwapEntries = await api.query.Nfts.PendingSwapOf.getEntries();

      const activeSwaps: PendingSwap[] = [];
      const currentBlock = await api.query.System.Number.getValue();

      for (const entry of allSwapEntries) {
        const collectionId = entry.keyArgs[0] as number;
        const itemId = entry.keyArgs[1] as number;
        const swapData = entry.value;

        // Skip expired swaps
        if (currentBlock >= swapData.deadline) {
          continue;
        }

        // Get the creator
        const item = await api.query.Nfts.Item.getValue(collectionId, itemId);

        activeSwaps.push({
          offeredCollection: collectionId,
          offeredItem: itemId,
          desiredCollection: swapData.desired_collection,
          desiredItem: swapData.desired_item,
          price: swapData.price
            ? {
                amount: swapData.price.amount,
                direction: swapData.price.direction,
              }
            : undefined,
          deadline: swapData.deadline,
          creator: item?.owner || '',
        });
      }

      return activeSwaps;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get all active swaps';
      throw new Error(errorMessage);
    }
  }, [api]);

  // Find swaps where user can participate (has desired items)
  const findMatchingSwaps = useCallback(
    async (userAddress?: string): Promise<PendingSwap[]> => {
      const address = userAddress || selectedAccount?.address;
      if (!address) {
        return [];
      }

      try {
        // Get all user's items
        const ownedItems = await api?.query.Nfts.Account.getEntries(address);
        if (!ownedItems) {
          return [];
        }

        const ownedByCollection = ownedItems.reduce(
          (acc, entry) => {
            const collectionId = entry.keyArgs[1] as number;
            const itemId = entry.keyArgs[2] as number;

            if (!acc[collectionId]) {
              acc[collectionId] = [];
            }
            acc[collectionId].push(itemId);
            return acc;
          },
          {} as Record<number, number[]>
        );

        // Get all active swaps
        const allSwaps = await getAllActiveSwaps();

        // Filter swaps where user has matching items
        const matchingSwaps = allSwaps.filter(swap => {
          const userItemsInDesiredCollection =
            ownedByCollection[swap.desiredCollection];

          if (!userItemsInDesiredCollection) {
            return false;
          }

          // If swap wants any item from collection
          if (!swap.desiredItem) {
            return true;
          }

          // If swap wants specific item
          return userItemsInDesiredCollection.includes(swap.desiredItem);
        });

        return matchingSwaps;
      } catch (err) {
        console.warn('Failed to find matching swaps:', err);
        return [];
      }
    },
    [api, selectedAccount, getAllActiveSwaps]
  );

  return {
    // Core swapping functions
    createSwap,
    claimSwap,
    cancelSwap,

    // Swap queries
    getPendingSwap,
    isSwapValid,

    // Browse swaps
    getCollectionSwaps,
    getUserSwaps,
    getAllActiveSwaps,
    findMatchingSwaps,

    // State
    isLoading,
    error,
    isReady: !!api && !!selectedAccount && isConnected,
  };
};
