'use client';

import { useState, useCallback } from 'react';
import { SS58String } from 'polkadot-api';
import { usePolkadot } from '../../contexts/PolkadotContext';
import { useWallet } from '../../contexts/WalletContext';
import { MultiAddress } from '@polkadot-api/descriptors';

export interface NFTPrice {
  price: bigint;
  whitelistedBuyer?: SS58String;
}

export interface MarketplaceListing {
  collectionId: number;
  itemId: number;
  price: bigint;
  seller: string;
  whitelistedBuyer?: SS58String;
}

export const useNFTTrading = () => {
  const { api, isConnected } = usePolkadot();
  const { selectedAccount } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set NFT price (list for sale)
  const setPrice = useCallback(
    async (
      collectionId: number,
      itemId: number,
      price: bigint,
      whitelistedBuyer?: SS58String
    ) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const setPriceTx = await api.tx.Nfts.set_price({
          collection: collectionId,
          item: itemId,
          price: price,
          whitelisted_buyer: whitelistedBuyer
            ? MultiAddress.Id(whitelistedBuyer)
            : undefined,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: setPriceTx.txHash,
          blockHash: setPriceTx.block.hash,
          events: setPriceTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to set NFT price';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Remove NFT from sale (withdraw listing)
  const withdrawFromSale = useCallback(
    async (collectionId: number, itemId: number) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const withdrawTx = await api.tx.Nfts.set_price({
          collection: collectionId,
          item: itemId,
          price: undefined,
          whitelisted_buyer: undefined,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: withdrawTx.txHash,
          blockHash: withdrawTx.block.hash,
          events: withdrawTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to withdraw NFT from sale';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Buy an NFT
  const buyItem = useCallback(
    async (collectionId: number, itemId: number, bidPrice: bigint) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const buyTx = await api.tx.Nfts.buy_item({
          collection: collectionId,
          item: itemId,
          bid_price: bidPrice,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: buyTx.txHash,
          blockHash: buyTx.block.hash,
          events: buyTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to buy NFT';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Get NFT price
  const getPrice = useCallback(
    async (collectionId: number, itemId: number): Promise<NFTPrice | null> => {
      if (!api) {
        throw new Error('Polkadot API not connected');
      }

      try {
        const priceInfo = await api.query.Nfts.ItemPriceOf.getValue(
          collectionId,
          itemId
        );

        if (!priceInfo) {
          return null;
        }

        return {
          price: priceInfo[0],
          whitelistedBuyer: priceInfo[1] || undefined,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get NFT price';
        throw new Error(errorMessage);
      }
    },
    [api]
  );

  // Check if NFT is for sale
  const isForSale = useCallback(
    async (collectionId: number, itemId: number): Promise<boolean> => {
      try {
        const price = await getPrice(collectionId, itemId);
        return price !== null;
      } catch (err) {
        console.warn('Failed to check if NFT is for sale:', err);
        return false;
      }
    },
    [getPrice]
  );

  // Check if current account can buy NFT (considering whitelist)
  const canBuyNFT = useCallback(
    async (
      collectionId: number,
      itemId: number,
      accountAddress?: string
    ): Promise<boolean> => {
      const address = accountAddress || selectedAccount?.address;
      if (!address) {
        return false;
      }

      try {
        const priceInfo = await getPrice(collectionId, itemId);

        if (!priceInfo) {
          return false; // Not for sale
        }

        // If there's a whitelisted buyer, check if current account is whitelisted
        if (priceInfo.whitelistedBuyer) {
          return priceInfo.whitelistedBuyer === address;
        }

        return true; // Public sale, anyone can buy
      } catch (err) {
        console.warn('Failed to check buy eligibility:', err);
        return false;
      }
    },
    [getPrice, selectedAccount]
  );

  // Get all NFTs for sale in a collection
  const getCollectionListings = useCallback(
    async (collectionId: number): Promise<MarketplaceListing[]> => {
      if (!api) {
        throw new Error('Polkadot API not connected');
      }

      try {
        const priceEntries =
          await api.query.Nfts.ItemPriceOf.getEntries(collectionId);

        const listings: MarketplaceListing[] = [];

        for (const entry of priceEntries) {
          const itemId = entry.keyArgs[1] as number;
          const price = entry.value[0];
          const whitelistedBuyer = entry.value[1];

          // Get the current owner
          const item = await api.query.Nfts.Item.getValue(collectionId, itemId);
          if (item) {
            listings.push({
              collectionId,
              itemId,
              price,
              seller: item.owner,
              whitelistedBuyer: whitelistedBuyer || undefined,
            });
          }
        }

        return listings.sort((a, b) => Number(a.price - b.price)); // Sort by price
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to get collection listings';
        throw new Error(errorMessage);
      }
    },
    [api]
  );

  // Get all NFTs for sale by a specific seller
  const getSellerListings = useCallback(
    async (sellerAddress?: string): Promise<MarketplaceListing[]> => {
      if (!api) {
        throw new Error('Polkadot API not connected');
      }

      const address = sellerAddress || selectedAccount?.address;
      if (!address) {
        throw new Error('No seller address provided');
      }

      try {
        // Get all items owned by the seller
        const ownedItems = await api.query.Nfts.Account.getEntries(address);

        const listings: MarketplaceListing[] = [];

        for (const entry of ownedItems) {
          const collectionId = entry.keyArgs[1] as number;
          const itemId = entry.keyArgs[2] as number;

          // Check if this item is for sale
          const priceInfo = await api.query.Nfts.ItemPriceOf.getValue(
            collectionId,
            itemId
          );

          if (priceInfo) {
            listings.push({
              collectionId,
              itemId,
              price: priceInfo[0],
              seller: address,
              whitelistedBuyer: priceInfo[1] || undefined,
            });
          }
        }

        return listings.sort((a, b) => Number(a.price - b.price)); // Sort by price
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get seller listings';
        throw new Error(errorMessage);
      }
    },
    [api, selectedAccount]
  );

  // Get all NFTs for sale across all collections (marketplace overview)
  const getAllListings = useCallback(async (): Promise<
    MarketplaceListing[]
  > => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    try {
      const allPriceEntries = await api.query.Nfts.ItemPriceOf.getEntries();

      const listings: MarketplaceListing[] = [];

      for (const entry of allPriceEntries) {
        const collectionId = entry.keyArgs[0] as number;
        const itemId = entry.keyArgs[1] as number;
        const price = entry.value[0];
        const whitelistedBuyer = entry.value[1];

        // Get the current owner
        const item = await api.query.Nfts.Item.getValue(collectionId, itemId);
        if (item) {
          listings.push({
            collectionId,
            itemId,
            price,
            seller: item.owner,
            whitelistedBuyer: whitelistedBuyer || undefined,
          });
        }
      }

      return listings.sort((a, b) => Number(a.price - b.price)); // Sort by price
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get all listings';
      throw new Error(errorMessage);
    }
  }, [api]);

  // Batch set prices for multiple NFTs
  const batchSetPrices = useCallback(
    async (
      priceData: Array<{
        collectionId: number;
        itemId: number;
        price: bigint;
        whitelistedBuyer?: string;
      }>
    ) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      if (priceData.length === 0) {
        throw new Error('No price data provided');
      }

      setIsLoading(true);
      setError(null);

      try {
        const calls = priceData.map(
          ({ collectionId, itemId, price, whitelistedBuyer }) =>
            api.tx.Nfts.set_price({
              collection: collectionId,
              item: itemId,
              price: price,
              whitelisted_buyer: whitelistedBuyer
                ? MultiAddress.Id(whitelistedBuyer)
                : undefined,
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
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to batch set prices';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Batch withdraw multiple NFTs from sale
  const batchWithdrawFromSale = useCallback(
    async (withdrawData: Array<{ collectionId: number; itemId: number }>) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      if (withdrawData.length === 0) {
        throw new Error('No withdraw data provided');
      }

      setIsLoading(true);
      setError(null);

      try {
        const calls = withdrawData.map(
          ({ collectionId, itemId }) =>
            api.tx.Nfts.set_price({
              collection: collectionId,
              item: itemId,
              price: undefined,
              whitelisted_buyer: undefined,
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
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to batch withdraw from sale';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  return {
    // Core trading functions
    setPrice,
    withdrawFromSale,
    buyItem,

    // Price queries
    getPrice,
    isForSale,
    canBuyNFT,

    // Marketplace queries
    getCollectionListings,
    getSellerListings,
    getAllListings,

    // Batch operations
    batchSetPrices,
    batchWithdrawFromSale,

    // State
    isLoading,
    error,
    isReady: !!api && !!selectedAccount && isConnected,
  };
};
