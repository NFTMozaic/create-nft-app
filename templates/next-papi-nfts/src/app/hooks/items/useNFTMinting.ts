'use client';

import { useState, useCallback } from 'react';
import {
  Binary,
  Enum,
  SS58String,
  FixedSizeArray,
  FixedSizeBinary,
} from 'polkadot-api';
import { MultiAddress, MultiSignature } from '@polkadot-api/descriptors';
import { usePolkadot } from '../../contexts/PolkadotContext';
import { useWallet } from '../../contexts/WalletContext';

export interface NftMintData {
  itemId: number;
  mintTo: string;
  metadata?: string;
  attributes?: Array<[string, string]>;
}

export interface MintWitnessData {
  owned_item?: number | undefined;
  mint_price?: bigint | undefined;
}

export interface PreSignedMintData {
  collection: number;
  item: number;
  attributes: FixedSizeArray<2, Binary>[];
  metadata: Binary;
  only_account?: SS58String | undefined;
  deadline: number;
  mint_price?: bigint | undefined;
}

export const useNFTMinting = () => {
  const { api, isConnected } = usePolkadot();
  const { selectedAccount } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Standard NFT mint
  const mint = useCallback(
    async (
      collectionId: number,
      itemId: number,
      mintTo: string,
      witnessData?: MintWitnessData
    ) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const mintTx = await api.tx.Nfts.mint({
          collection: collectionId,
          item: itemId,
          mint_to: MultiAddress.Id(mintTo),
          witness_data: witnessData || undefined,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          itemId,
          transactionHash: mintTx.txHash,
          blockHash: mintTx.block.hash,
          events: mintTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to mint NFT';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Mint with metadata and attributes in one transaction
  const mintWithMetadata = useCallback(
    async (
      collectionId: number,
      mintData: NftMintData,
      witnessData?: MintWitnessData
    ) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const calls = [];

        // Add mint call
        const mintCall = api.tx.Nfts.mint({
          collection: collectionId,
          item: mintData.itemId,
          mint_to: MultiAddress.Id(mintData.mintTo),
          witness_data: witnessData || undefined,
        });
        calls.push(mintCall.decodedCall);

        // Add metadata call if provided
        if (mintData.metadata) {
          const setMetadataCall = api.tx.Nfts.set_metadata({
            collection: collectionId,
            item: mintData.itemId,
            data: Binary.fromText(mintData.metadata),
          });
          calls.push(setMetadataCall.decodedCall);
        }

        // Add attribute calls if provided
        if (mintData.attributes && mintData.attributes.length > 0) {
          for (const [key, value] of mintData.attributes) {
            const setAttributeCall = api.tx.Nfts.set_attribute({
              collection: collectionId,
              maybe_item: mintData.itemId,
              namespace: { type: 'CollectionOwner' as const, value: undefined },
              key: Binary.fromText(key),
              value: Binary.fromText(value),
            });
            calls.push(setAttributeCall.decodedCall);
          }
        }

        // Execute batch transaction
        const batchTx = await api.tx.Utility.batch_all({
          calls: calls,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          itemId: mintData.itemId,
          transactionHash: batchTx.txHash,
          blockHash: batchTx.block.hash,
          events: batchTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to mint NFT with metadata';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Batch mint multiple NFTs
  const batchMint = useCallback(
    async (
      collectionId: number,
      mintDataArray: NftMintData[],
      witnessData?: MintWitnessData
    ) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      if (mintDataArray.length === 0) {
        throw new Error('No mint data provided');
      }

      setIsLoading(true);
      setError(null);

      try {
        const calls: any[] = [];

        // Add all mint calls and their metadata/attributes to the batch
        for (const mintData of mintDataArray) {
          // Add mint call
          const mintCall = api.tx.Nfts.mint({
            collection: collectionId,
            item: mintData.itemId,
            mint_to: MultiAddress.Id(mintData.mintTo),
            witness_data: witnessData || undefined,
          });
          calls.push(mintCall.decodedCall);

          // Add metadata call if provided
          if (mintData.metadata) {
            const setMetadataCall = api.tx.Nfts.set_metadata({
              collection: collectionId,
              item: mintData.itemId,
              data: Binary.fromText(mintData.metadata),
            });
            calls.push(setMetadataCall.decodedCall);
          }

          // Add attribute calls if provided
          if (mintData.attributes && mintData.attributes.length > 0) {
            for (const [key, value] of mintData.attributes) {
              const setAttributeCall = api.tx.Nfts.set_attribute({
                collection: collectionId,
                maybe_item: mintData.itemId,
                namespace: {
                  type: 'CollectionOwner' as const,
                  value: undefined,
                },
                key: Binary.fromText(key),
                value: Binary.fromText(value),
              });
              calls.push(setAttributeCall.decodedCall);
            }
          }
        }

        const batchTx = await api.tx.Utility.batch_all({
          calls: calls,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          itemIds: mintDataArray.map(md => md.itemId),
          transactionHash: batchTx.txHash,
          blockHash: batchTx.block.hash,
          events: batchTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to batch mint NFTs';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Execute presigned mint
  const mintPreSigned = useCallback(
    async (
      mintData: PreSignedMintData,
      signature: Uint8Array,
      signerAddress: string
    ) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const mintTx = await api.tx.Nfts.mint_pre_signed({
          mint_data: mintData,
          signature: MultiSignature.Sr25519(
            FixedSizeBinary.fromBytes(signature)
          ),
          signer: signerAddress,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          itemId: mintData.item,
          transactionHash: mintTx.txHash,
          blockHash: mintTx.block.hash,
          events: mintTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to mint presigned NFT';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Create presigned mint data (off-chain signing would happen externally)
  const createPreSignedMintData = useCallback(
    (
      collectionId: number,
      itemId: number,
      options: {
        attributes?: Array<[string, string]>;
        metadata?: string;
        onlyAccount?: string;
        deadline: number;
        mintPrice?: bigint;
      }
    ): PreSignedMintData => {
      const mintData: PreSignedMintData = {
        collection: collectionId,
        item: itemId,
        deadline: options.deadline,
        attributes: [],
        metadata: Binary.fromText(''),
      };

      if (options.attributes) {
        mintData.attributes = options.attributes.map(([key, value]) => [
          Binary.fromText(key),
          Binary.fromText(value),
        ]) as FixedSizeArray<2, Binary>[];
      }

      if (options.metadata) {
        mintData.metadata = Binary.fromText(options.metadata);
      }

      if (options.onlyAccount) {
        mintData.only_account = options.onlyAccount as SS58String;
      }

      if (options.mintPrice !== undefined) {
        mintData.mint_price = options.mintPrice;
      }

      return mintData;
    },
    []
  );

  // Update mint settings (issuer only)
  const updateMintSettings = useCallback(
    async (
      collectionId: number,
      mintSettings: {
        mintType: Enum<{
          Issuer: undefined;
          Public: undefined;
          HolderOf: number;
        }>;
        price?: bigint;
        startBlock?: number;
        endBlock?: number;
        default_item_settings?: bigint;
      }
    ) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const updateTx = await api.tx.Nfts.update_mint_settings({
          collection: collectionId,
          mint_settings: {
            mint_type: mintSettings.mintType,
            price: mintSettings.price,
            start_block: mintSettings.startBlock,
            end_block: mintSettings.endBlock,
            default_item_settings: mintSettings.default_item_settings || 0n,
          },
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: updateTx.txHash,
          blockHash: updateTx.block.hash,
          events: updateTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update mint settings';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  return {
    // Core minting functions
    mint,
    mintWithMetadata,
    batchMint,

    // Presigned minting
    mintPreSigned,
    createPreSignedMintData,

    // Settings management
    updateMintSettings,

    // State
    isLoading,
    error,
    isReady: !!api && !!selectedAccount && isConnected,
  };
};
