'use client';

import { useState, useCallback } from 'react';
import { MultiAddress } from '@polkadot-api/descriptors';
import { usePolkadot } from '../../contexts/PolkadotContext';
import { useWallet } from '../../contexts/WalletContext';

export interface CollectionConfig {
  maxSupply?: number;
  transferable?: boolean;
  publicMinting?: boolean;
  mintPrice?: bigint;
  startBlock?: number;
  endBlock?: number;
  defaultItemSettings?: bigint;
}

export interface CollectionDestroyWitness {
  attributes: number;
  item_configs: number;
  item_metadatas: number;
}

export const useCollectionManagement = () => {
  const { api, isConnected } = usePolkadot();
  const { selectedAccount } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new NFT collection
  const createCollection = useCallback(
    async (config: CollectionConfig) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        // Get the next collection ID first
        const nextCollectionId =
          await api.query.Nfts.NextCollectionId.getValue();
        if (!nextCollectionId) {
          throw new Error('Failed to get next collection ID');
        }

        const collectionConfig = {
          max_supply: config.maxSupply,
          mint_settings: {
            default_item_settings:
              config.defaultItemSettings ?? (config.transferable ? 0n : 1n),
            mint_type: config.publicMinting
              ? { type: 'Public' as const, value: undefined }
              : { type: 'Issuer' as const, value: undefined },
            price: config.mintPrice,
            start_block: config.startBlock,
            end_block: config.endBlock,
          },
          settings: 0n, // All settings unlocked initially
        };

        const createCollectionTx = await api.tx.Nfts.create({
          admin: MultiAddress.Id(selectedAccount.address),
          config: collectionConfig,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          collectionId: nextCollectionId,
          transactionHash: createCollectionTx.txHash,
          blockHash: createCollectionTx.block.hash,
          events: createCollectionTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create collection';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Set collection maximum supply
  const setCollectionMaxSupply = useCallback(
    async (collectionId: number, maxSupply: number) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const setMaxSupplyTx = await api.tx.Nfts.set_collection_max_supply({
          collection: collectionId,
          max_supply: maxSupply,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: setMaxSupplyTx.txHash,
          blockHash: setMaxSupplyTx.block.hash,
          events: setMaxSupplyTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to set collection max supply';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Lock collection settings permanently
  const lockCollection = useCallback(
    async (collectionId: number, lockSettings: bigint) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const lockCollectionTx = await api.tx.Nfts.lock_collection({
          collection: collectionId,
          lock_settings: lockSettings,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: lockCollectionTx.txHash,
          blockHash: lockCollectionTx.block.hash,
          events: lockCollectionTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to lock collection';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Destroy a collection (only if no items exist)
  const destroyCollection = useCallback(
    async (collectionId: number, witness?: CollectionDestroyWitness) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        // Get witness data if not provided
        let witnessData = witness;
        if (!witnessData) {
          const collection =
            await api.query.Nfts.Collection.getValue(collectionId);
          if (!collection) {
            throw new Error('Collection not found');
          }
          witnessData = {
            attributes: collection.attributes || 0,
            item_configs: collection.item_configs || 0,
            item_metadatas: collection.item_metadatas || 0,
          };
        }

        const destroyTx = await api.tx.Nfts.destroy({
          collection: collectionId,
          witness: witnessData,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: destroyTx.txHash,
          blockHash: destroyTx.block.hash,
          events: destroyTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to destroy collection';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Get collection witness data for destroy operation
  const getCollectionWitness = useCallback(
    async (collectionId: number): Promise<CollectionDestroyWitness> => {
      if (!api) {
        throw new Error('Polkadot API not connected');
      }

      try {
        const collection =
          await api.query.Nfts.Collection.getValue(collectionId);
        if (!collection) {
          throw new Error('Collection not found');
        }

        return {
          attributes: collection.attributes || 0,
          item_configs: collection.item_configs || 0,
          item_metadatas: collection.item_metadatas || 0,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to get collection witness data';
        throw new Error(errorMessage);
      }
    },
    [api]
  );

  // Get next available collection ID
  const getNextCollectionId = useCallback(async (): Promise<number> => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    try {
      const nextCollectionId = await api.query.Nfts.NextCollectionId.getValue();
      if (nextCollectionId === undefined || nextCollectionId === null) {
        throw new Error('Failed to get next collection ID');
      }
      return nextCollectionId;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get next collection ID';
      throw new Error(errorMessage);
    }
  }, [api]);

  // Get collection details
  const getCollection = useCallback(
    async (collectionId: number) => {
      if (!api) {
        throw new Error('Polkadot API not connected');
      }

      try {
        const collection =
          await api.query.Nfts.Collection.getValue(collectionId);
        return collection;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to get collection details';
        throw new Error(errorMessage);
      }
    },
    [api]
  );

  return {
    // Core management functions
    createCollection,
    setCollectionMaxSupply,
    lockCollection,
    destroyCollection,

    // Utility functions
    getCollectionWitness,
    getNextCollectionId,
    getCollection,

    // State
    isLoading,
    error,
    isReady: !!api && !!selectedAccount && isConnected,
  };
};
