'use client';

import { useState, useCallback } from 'react';
import { MultiAddress } from '@polkadot-api/descriptors';
import { usePolkadot } from '../../contexts/PolkadotContext';
import { useWallet } from '../../contexts/WalletContext';

export const useNFTTransfers = () => {
  const { api, isConnected } = usePolkadot();
  const { selectedAccount } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transfer NFT directly
  const transfer = useCallback(
    async (collectionId: number, itemId: number, destination: string) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const transferTx = await api.tx.Nfts.transfer({
          collection: collectionId,
          item: itemId,
          dest: MultiAddress.Id(destination),
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: transferTx.txHash,
          blockHash: transferTx.block.hash,
          events: transferTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to transfer NFT';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Approve transfer delegation
  const approveTransfer = useCallback(
    async (
      collectionId: number,
      itemId: number,
      delegate: string,
      deadline?: number
    ) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const approveTx = await api.tx.Nfts.approve_transfer({
          collection: collectionId,
          item: itemId,
          delegate: MultiAddress.Id(delegate),
          maybe_deadline: deadline,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: approveTx.txHash,
          blockHash: approveTx.block.hash,
          events: approveTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to approve transfer';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Cancel specific transfer approval
  const cancelApproval = useCallback(
    async (collectionId: number, itemId: number, delegate: string) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const cancelTx = await api.tx.Nfts.cancel_approval({
          collection: collectionId,
          item: itemId,
          delegate: MultiAddress.Id(delegate),
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: cancelTx.txHash,
          blockHash: cancelTx.block.hash,
          events: cancelTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to cancel approval';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Clear all transfer approvals
  const clearAllTransferApprovals = useCallback(
    async (collectionId: number, itemId: number) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const clearTx = await api.tx.Nfts.clear_all_transfer_approvals({
          collection: collectionId,
          item: itemId,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: clearTx.txHash,
          blockHash: clearTx.block.hash,
          events: clearTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to clear all transfer approvals';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Get current transfer approvals
  const getTransferApprovals = useCallback(
    async (collectionId: number, itemId: number) => {
      if (!api) {
        throw new Error('Polkadot API not connected');
      }

      try {
        const item = await api.query.Nfts.Item.getValue(collectionId, itemId);
        return item?.approvals || [];
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to get transfer approvals';
        throw new Error(errorMessage);
      }
    },
    [api]
  );

  // Approve attribute modifications
  const approveItemAttributes = useCallback(
    async (collectionId: number, itemId: number, delegate: string) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const approveTx = await api.tx.Nfts.approve_item_attributes({
          collection: collectionId,
          item: itemId,
          delegate: MultiAddress.Id(delegate),
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: approveTx.txHash,
          blockHash: approveTx.block.hash,
          events: approveTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to approve item attributes';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Cancel attribute modification approval
  const cancelItemAttributesApproval = useCallback(
    async (
      collectionId: number,
      itemId: number,
      delegate: string,
      witness: number
    ) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const cancelTx = await api.tx.Nfts.cancel_item_attributes_approval({
          collection: collectionId,
          item: itemId,
          delegate: MultiAddress.Id(delegate),
          witness: witness,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: cancelTx.txHash,
          blockHash: cancelTx.block.hash,
          events: cancelTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to cancel item attributes approval';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Get attribute modification approvals
  const getAttributeApprovals = useCallback(
    async (collectionId: number, itemId: number) => {
      if (!api) {
        throw new Error('Polkadot API not connected');
      }

      try {
        const approvals =
          await api.query.Nfts.ItemAttributesApprovalsOf.getValue(
            collectionId,
            itemId
          );
        return approvals || [];
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to get attribute approvals';
        throw new Error(errorMessage);
      }
    },
    [api]
  );

  // Check if account is approved for transfers
  const isApprovedForTransfer = useCallback(
    async (
      collectionId: number,
      itemId: number,
      account: string
    ): Promise<boolean> => {
      try {
        const approvals = await getTransferApprovals(collectionId, itemId);
        return approvals.some((approval: any) => approval.delegate === account);
      } catch (err) {
        console.warn('Failed to check transfer approval:', err);
        return false;
      }
    },
    [getTransferApprovals]
  );

  // Check if account is approved for attribute modifications
  const isApprovedForAttributes = useCallback(
    async (
      collectionId: number,
      itemId: number,
      account: string
    ): Promise<boolean> => {
      try {
        const approvals = await getAttributeApprovals(collectionId, itemId);
        return approvals.includes(account);
      } catch (err) {
        console.warn('Failed to check attribute approval:', err);
        return false;
      }
    },
    [getAttributeApprovals]
  );

  // Get NFT owner
  const getNFTOwner = useCallback(
    async (collectionId: number, itemId: number): Promise<string | null> => {
      if (!api) {
        throw new Error('Polkadot API not connected');
      }

      try {
        const item = await api.query.Nfts.Item.getValue(collectionId, itemId);
        return item?.owner || null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get NFT owner';
        throw new Error(errorMessage);
      }
    },
    [api]
  );

  // Check if current account owns the NFT
  const isNFTOwner = useCallback(
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
        const owner = await getNFTOwner(collectionId, itemId);
        return owner === address;
      } catch (err) {
        console.warn('Failed to check NFT ownership:', err);
        return false;
      }
    },
    [getNFTOwner, selectedAccount]
  );

  // Get NFTs owned by an account
  const getOwnedNFTs = useCallback(
    async (accountAddress?: string) => {
      if (!api) {
        throw new Error('Polkadot API not connected');
      }

      const address = accountAddress || selectedAccount?.address;
      if (!address) {
        throw new Error('No account address provided');
      }

      try {
        const ownedItems = await api.query.Nfts.Account.getEntries(address);

        const nfts = ownedItems.map(entry => ({
          collectionId: entry.keyArgs[1] as number,
          itemId: entry.keyArgs[2] as number,
          owner: address,
        }));

        return nfts;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get owned NFTs';
        throw new Error(errorMessage);
      }
    },
    [api, selectedAccount]
  );

  // Batch transfer multiple NFTs
  const batchTransfer = useCallback(
    async (
      transfers: Array<{
        collectionId: number;
        itemId: number;
        destination: string;
      }>
    ) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      if (transfers.length === 0) {
        throw new Error('No transfers provided');
      }

      setIsLoading(true);
      setError(null);

      try {
        const calls = transfers.map(
          transfer =>
            api.tx.Nfts.transfer({
              collection: transfer.collectionId,
              item: transfer.itemId,
              dest: MultiAddress.Id(transfer.destination),
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
          err instanceof Error ? err.message : 'Failed to batch transfer NFTs';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  return {
    // Core transfer functions
    transfer,
    batchTransfer,

    // Transfer approval management
    approveTransfer,
    cancelApproval,
    clearAllTransferApprovals,
    getTransferApprovals,
    isApprovedForTransfer,

    // Attribute approval management
    approveItemAttributes,
    cancelItemAttributesApproval,
    getAttributeApprovals,
    isApprovedForAttributes,

    // Ownership queries
    getNFTOwner,
    isNFTOwner,
    getOwnedNFTs,

    // State
    isLoading,
    error,
    isReady: !!api && !!selectedAccount && isConnected,
  };
};
