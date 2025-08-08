'use client';

import { useState, useCallback } from 'react';
import { Binary, Enum, SS58String } from 'polkadot-api';
import { usePolkadot } from '../../contexts/PolkadotContext';
import { useWallet } from '../../contexts/WalletContext';

type AttributeNamespace = Enum<{
  Pallet: undefined;
  CollectionOwner: undefined;
  ItemOwner: undefined;
  Account: SS58String;
}>

export const useCollectionMetadata = () => {
  const { api, isConnected } = usePolkadot();
  const { selectedAccount } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set collection metadata
  const setCollectionMetadata = useCallback(async (collectionId: number, metadataUrl: string) => {
    if (!api || !selectedAccount || !isConnected) {
      throw new Error('Polkadot API or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const setMetadataTx = await api.tx.Nfts.set_collection_metadata({
        collection: collectionId,
        data: Binary.fromText(metadataUrl),
      }).signAndSubmit(selectedAccount.polkadotSigner);

      return {
        transactionHash: setMetadataTx.txHash,
        blockHash: setMetadataTx.block.hash,
        events: setMetadataTx.events,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set collection metadata';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api, selectedAccount, isConnected]);

  // Clear collection metadata
  const clearCollectionMetadata = useCallback(async (collectionId: number) => {
    if (!api || !selectedAccount || !isConnected) {
      throw new Error('Polkadot API or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const clearMetadataTx = await api.tx.Nfts.clear_collection_metadata({
        collection: collectionId,
      }).signAndSubmit(selectedAccount.polkadotSigner);

      return {
        transactionHash: clearMetadataTx.txHash,
        blockHash: clearMetadataTx.block.hash,
        events: clearMetadataTx.events,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear collection metadata';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api, selectedAccount, isConnected]);

  // Get collection metadata
  const getCollectionMetadata = useCallback(async (collectionId: number) => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    try {
      const metadata = await api.query.Nfts.CollectionMetadataOf.getValue(collectionId);
      
      if (!metadata) {
        return null;
      }

      return {
        data: metadata.data.asText(),
        deposit: metadata.deposit,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get collection metadata';
      throw new Error(errorMessage);
    }
  }, [api]);

  // Set collection attribute
  const setCollectionAttribute = useCallback(async (
    collectionId: number,
    key: string,
    value: string,
    namespace: AttributeNamespace = { type: 'CollectionOwner', value: undefined }
  ) => {
    if (!api || !selectedAccount || !isConnected) {
      throw new Error('Polkadot API or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const setAttributeTx = await api.tx.Nfts.set_attribute({
        collection: collectionId,
        key: Binary.fromText(key),
        value: Binary.fromText(value),
        namespace: namespace,
        maybe_item: undefined,
      }).signAndSubmit(selectedAccount.polkadotSigner);

      return {
        transactionHash: setAttributeTx.txHash,
        blockHash: setAttributeTx.block.hash,
        events: setAttributeTx.events,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set collection attribute';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api, selectedAccount, isConnected]);

  // Clear collection attribute
  const clearCollectionAttribute = useCallback(async (
    collectionId: number,
    key: string,
    namespace: AttributeNamespace = { type: 'CollectionOwner', value: undefined }
  ) => {
    if (!api || !selectedAccount || !isConnected) {
      throw new Error('Polkadot API or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const clearAttributeTx = await api.tx.Nfts.clear_attribute({
        collection: collectionId,
        key: Binary.fromText(key),
        namespace: namespace,
        maybe_item: undefined,
      }).signAndSubmit(selectedAccount.polkadotSigner);

      return {
        transactionHash: clearAttributeTx.txHash,
        blockHash: clearAttributeTx.block.hash,
        events: clearAttributeTx.events,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear collection attribute';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api, selectedAccount, isConnected]);

  // Get collection attribute
  const getCollectionAttribute = useCallback(async (
    collectionId: number,
    key: string,
    namespace: AttributeNamespace = { type: 'CollectionOwner', value: undefined }
  ) => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    try {
      const attribute = await api.query.Nfts.Attribute.getValue(
        collectionId,
        undefined, // No item ID for collection attributes
        namespace,
        Binary.fromText(key)
      );

      if (!attribute) {
        return null;
      }

      return attribute;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get collection attribute';
      throw new Error(errorMessage);
    }
  }, [api]);

  // Get all collection attributes
  const getAllCollectionAttributes = useCallback(async (collectionId: number) => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    try {
      const attributes = await api.query.Nfts.Attribute.getEntries(collectionId, undefined);
      
      return attributes;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get collection attributes';
      throw new Error(errorMessage);
    }
  }, [api]);

  // Batch set multiple collection attributes
  const setCollectionAttributes = useCallback(async (
    collectionId: number,
    attributes: Array<{ key: string; value: string }>,
    namespace: AttributeNamespace = { type: 'CollectionOwner', value: undefined }
  ) => {
    if (!api || !selectedAccount || !isConnected) {
      throw new Error('Polkadot API or wallet not connected');
    }

    if (attributes.length === 0) {
      throw new Error('No attributes provided');
    }

    setIsLoading(true);
    setError(null);

    try {
      const calls = attributes.map(attr => 
        api.tx.Nfts.set_attribute({
          collection: collectionId,
          key: Binary.fromText(attr.key),
          value: Binary.fromText(attr.value),
          namespace: namespace,
          maybe_item: undefined,
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to set collection attributes';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api, selectedAccount, isConnected]);

  // Get collection info including metadata and attributes
  const getCollectionInfo = useCallback(async (collectionId: number) => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    try {
      const [collection, metadata, attributes] = await Promise.all([
        api.query.Nfts.Collection.getValue(collectionId),
        getCollectionMetadata(collectionId),
        getAllCollectionAttributes(collectionId),
      ]);

      return {
        collection,
        metadata,
        attributes,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get collection info';
      throw new Error(errorMessage);
    }
  }, [api, getCollectionMetadata, getAllCollectionAttributes]);

  return {
    // Metadata functions
    setCollectionMetadata,
    clearCollectionMetadata,
    getCollectionMetadata,
    
    // Attribute functions
    setCollectionAttribute,
    clearCollectionAttribute,
    getCollectionAttribute,
    getAllCollectionAttributes,
    setCollectionAttributes,
    
    // Combined info function
    getCollectionInfo,
    
    // State
    isLoading,
    error,
    isReady: !!api && !!selectedAccount && isConnected,
  };
};