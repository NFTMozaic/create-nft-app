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

interface OperationState {
  isLoading: boolean;
  error: string | null;
}

interface States {
  setMetadata: OperationState;
  clearMetadata: OperationState;
  getMetadata: OperationState;
  setAttribute: OperationState;
  clearAttribute: OperationState;
  getAttribute: OperationState;
  getAllAttributes: OperationState;
  setAttributes: OperationState;
  getInfo: OperationState;
}

export const useCollectionMetadata = () => {
  const { api, isConnected } = usePolkadot();
  const { selectedAccount } = useWallet();
  
  const [states, setStates] = useState<States>({
    setMetadata: { isLoading: false, error: null },
    clearMetadata: { isLoading: false, error: null },
    getMetadata: { isLoading: false, error: null },
    setAttribute: { isLoading: false, error: null },
    clearAttribute: { isLoading: false, error: null },
    getAttribute: { isLoading: false, error: null },
    getAllAttributes: { isLoading: false, error: null },
    setAttributes: { isLoading: false, error: null },
    getInfo: { isLoading: false, error: null },
  });

  const updateState = useCallback((operation: keyof States, update: Partial<OperationState>) => {
    setStates(prev => ({
      ...prev,
      [operation]: { ...prev[operation], ...update }
    }));
  }, []);

  // Set collection metadata
  const setCollectionMetadata = useCallback(async (collectionId: number, metadataUrl: string) => {
    if (!api || !selectedAccount || !isConnected) {
      throw new Error('Polkadot API or wallet not connected');
    }

    updateState('setMetadata', { isLoading: true, error: null });

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
      updateState('setMetadata', { error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      updateState('setMetadata', { isLoading: false });
    }
  }, [api, selectedAccount, isConnected, updateState]);

  // Clear collection metadata
  const clearCollectionMetadata = useCallback(async (collectionId: number) => {
    if (!api || !selectedAccount || !isConnected) {
      throw new Error('Polkadot API or wallet not connected');
    }

    updateState('clearMetadata', { isLoading: true, error: null });

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
      updateState('clearMetadata', { error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      updateState('clearMetadata', { isLoading: false });
    }
  }, [api, selectedAccount, isConnected, updateState]);

  // Get collection metadata
  const getCollectionMetadata = useCallback(async (collectionId: number) => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    updateState('getMetadata', { isLoading: true, error: null });

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
      updateState('getMetadata', { error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      updateState('getMetadata', { isLoading: false });
    }
  }, [api, updateState]);

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

    updateState('setAttribute', { isLoading: true, error: null });

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
      updateState('setAttribute', { error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      updateState('setAttribute', { isLoading: false });
    }
  }, [api, selectedAccount, isConnected, updateState]);

  // Clear collection attribute
  const clearCollectionAttribute = useCallback(async (
    collectionId: number,
    key: string,
    namespace: AttributeNamespace = { type: 'CollectionOwner', value: undefined }
  ) => {
    if (!api || !selectedAccount || !isConnected) {
      throw new Error('Polkadot API or wallet not connected');
    }

    updateState('clearAttribute', { isLoading: true, error: null });

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
      updateState('clearAttribute', { error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      updateState('clearAttribute', { isLoading: false });
    }
  }, [api, selectedAccount, isConnected, updateState]);

  // Get collection attribute
  const getCollectionAttribute = useCallback(async (
    collectionId: number,
    key: string,
    namespace: AttributeNamespace = { type: 'CollectionOwner', value: undefined }
  ) => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }
    console.log(namespace, 'namespace')

    updateState('getAttribute', { isLoading: true, error: null });

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
      updateState('getAttribute', { error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      updateState('getAttribute', { isLoading: false });
    }
  }, [api, updateState]);

  // Get all collection attributes
  const getAllCollectionAttributes = useCallback(async (collectionId: number) => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    updateState('getAllAttributes', { isLoading: true, error: null });

    try {
      const attributes = await api.query.Nfts.Attribute.getEntries(collectionId, undefined);
      
      return attributes;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get collection attributes';
      updateState('getAllAttributes', { error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      updateState('getAllAttributes', { isLoading: false });
    }
  }, [api, updateState]);

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

    updateState('setAttributes', { isLoading: true, error: null });

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
      updateState('setAttributes', { error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      updateState('setAttributes', { isLoading: false });
    }
  }, [api, selectedAccount, isConnected, updateState]);

  // Get collection info including metadata and attributes
  const getCollectionInfo = useCallback(async (collectionId: number) => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    updateState('getInfo', { isLoading: true, error: null });

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
      updateState('getInfo', { error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      updateState('getInfo', { isLoading: false });
    }
  }, [api, getCollectionMetadata, getAllCollectionAttributes, updateState]);

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
    states,
    isLoading: Object.values(states).some(state => state.isLoading),
    error: Object.values(states).find(state => state.error)?.error || null,
    isReady: !!api && !!selectedAccount && isConnected,
  };
};