'use client';

import { useState, useCallback } from 'react';
import { Binary, Enum, SS58String, FixedSizeArray, FixedSizeBinary } from 'polkadot-api';
import { MultiSignature } from '@polkadot-api/descriptors';
import { usePolkadot } from '../../contexts/PolkadotContext';
import { useWallet } from '../../contexts/WalletContext';

type AttributeNamespace = Enum<{
  Pallet: undefined;
  CollectionOwner: undefined;
  ItemOwner: undefined;
  Account: SS58String;
}>

export interface PreSignedAttributeData {
  collection: number;
  item: number;
  deadline: number;
  namespace: AttributeNamespace;
  attributes: FixedSizeArray<2, Binary>[];
}

export const useNFTMetadata = () => {
  const { api, isConnected } = usePolkadot();
  const { selectedAccount } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set NFT metadata
  const setMetadata = useCallback(async (
    collectionId: number,
    itemId: number,
    metadataUrl: string
  ) => {
    if (!api || !selectedAccount || !isConnected) {
      throw new Error('Polkadot API or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const setMetadataTx = await api.tx.Nfts.set_metadata({
        collection: collectionId,
        item: itemId,
        data: Binary.fromText(metadataUrl),
      }).signAndSubmit(selectedAccount.polkadotSigner);

      return {
        transactionHash: setMetadataTx.txHash,
        blockHash: setMetadataTx.block.hash,
        events: setMetadataTx.events,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set NFT metadata';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api, selectedAccount, isConnected]);

  // Clear NFT metadata
  const clearMetadata = useCallback(async (
    collectionId: number,
    itemId: number
  ) => {
    if (!api || !selectedAccount || !isConnected) {
      throw new Error('Polkadot API or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const clearMetadataTx = await api.tx.Nfts.clear_metadata({
        collection: collectionId,
        item: itemId,
      }).signAndSubmit(selectedAccount.polkadotSigner);

      return {
        transactionHash: clearMetadataTx.txHash,
        blockHash: clearMetadataTx.block.hash,
        events: clearMetadataTx.events,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear NFT metadata';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api, selectedAccount, isConnected]);

  // Get NFT metadata
  const getMetadata = useCallback(async (
    collectionId: number,
    itemId: number
  ) => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    try {
      const metadata = await api.query.Nfts.ItemMetadataOf.getValue(collectionId, itemId);
      
      if (!metadata) {
        return null;
      }

      return {
        data: metadata.data.asText(),
        deposit: metadata.deposit,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get NFT metadata';
      throw new Error(errorMessage);
    }
  }, [api]);

  // Set NFT attribute
  const setAttribute = useCallback(async (
    collectionId: number,
    itemId: number,
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
        maybe_item: itemId,
        key: Binary.fromText(key),
        value: Binary.fromText(value),
        namespace: namespace,
      }).signAndSubmit(selectedAccount.polkadotSigner);

      return {
        transactionHash: setAttributeTx.txHash,
        blockHash: setAttributeTx.block.hash,
        events: setAttributeTx.events,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set NFT attribute';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api, selectedAccount, isConnected]);

  // Clear NFT attribute
  const clearAttribute = useCallback(async (
    collectionId: number,
    itemId: number,
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
        maybe_item: itemId,
        key: Binary.fromText(key),
        namespace: namespace,
      }).signAndSubmit(selectedAccount.polkadotSigner);

      return {
        transactionHash: clearAttributeTx.txHash,
        blockHash: clearAttributeTx.block.hash,
        events: clearAttributeTx.events,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear NFT attribute';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api, selectedAccount, isConnected]);

  // Get NFT attribute
  const getAttribute = useCallback(async (
    collectionId: number,
    itemId: number,
    key: string,
    namespace: AttributeNamespace = { type: 'CollectionOwner', value: undefined }
  ) => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    try {
      const attribute = await api.query.Nfts.Attribute.getValue(
        collectionId,
        itemId,
        namespace,
        Binary.fromText(key)
      );

      if (!attribute) {
        return null;
      }

      return attribute;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get NFT attribute';
      throw new Error(errorMessage);
    }
  }, [api]);

  // Get all NFT attributes
  const getAttributes = useCallback(async (
    collectionId: number,
    itemId: number
  ) => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    try {
      const attributes = await api.query.Nfts.Attribute.getEntries(collectionId, itemId);
      
      return attributes;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get NFT attributes';
      throw new Error(errorMessage);
    }
  }, [api]);

  // Set multiple attributes in batch
  const setAttributes = useCallback(async (
    collectionId: number,
    itemId: number,
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
          maybe_item: itemId,
          key: Binary.fromText(attr.key),
          value: Binary.fromText(attr.value),
          namespace: namespace,
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to set NFT attributes';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api, selectedAccount, isConnected]);

  // Execute presigned attributes
  const setPresignedAttributes = useCallback(async (
    attributeData: PreSignedAttributeData,
    signature: Uint8Array,
    signerAddress: string
  ) => {
    if (!api || !selectedAccount || !isConnected) {
      throw new Error('Polkadot API or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const setAttributesTx = await api.tx.Nfts.set_attributes_pre_signed({
        data: attributeData,
        signature: MultiSignature.Sr25519(FixedSizeBinary.fromBytes(signature)),
        signer: signerAddress,
      }).signAndSubmit(selectedAccount.polkadotSigner);

      return {
        transactionHash: setAttributesTx.txHash,
        blockHash: setAttributesTx.block.hash,
        events: setAttributesTx.events,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set presigned attributes';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api, selectedAccount, isConnected]);

  // Create presigned attribute data (off-chain signing would happen externally)
  const createPreSignedAttributeData = useCallback((
    collectionId: number,
    itemId: number,
    attributes: Array<[string, string]>,
    deadline: number,
    namespace: AttributeNamespace = { type: 'CollectionOwner', value: undefined }
  ): PreSignedAttributeData => {
    if (attributes.length === 0 || attributes.length > 10) {
      throw new Error('Must provide 1-10 attributes');
    }

    return {
      collection: collectionId,
      item: itemId,
      deadline,
      namespace,
      attributes: attributes.map(([key, value]) => [
        Binary.fromText(key),
        Binary.fromText(value),
      ]) as FixedSizeArray<2, Binary>[],
    };
  }, []);

  // Get NFT info including metadata and attributes
  const getNFTInfo = useCallback(async (collectionId: number, itemId: number) => {
    if (!api) {
      throw new Error('Polkadot API not connected');
    }

    try {
      const [item, metadata, attributes] = await Promise.all([
        api.query.Nfts.Item.getValue(collectionId, itemId),
        getMetadata(collectionId, itemId),
        getAttributes(collectionId, itemId),
      ]);

      return {
        item,
        metadata,
        attributes,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get NFT info';
      throw new Error(errorMessage);
    }
  }, [api, getMetadata, getAttributes]);

  return {
    // Metadata functions
    setMetadata,
    clearMetadata,
    getMetadata,
    
    // Attribute functions
    setAttribute,
    clearAttribute,
    getAttribute,
    getAttributes,
    setAttributes,
    
    // Presigned attributes
    setPresignedAttributes,
    createPreSignedAttributeData,
    
    // Combined info function
    getNFTInfo,
    
    // State
    isLoading,
    error,
    isReady: !!api && !!selectedAccount && isConnected,
  };
};
