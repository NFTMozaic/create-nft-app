'use client';

import { useState, useCallback } from 'react';
import { MultiAddress } from '@polkadot-api/descriptors';
import { usePolkadot } from '../../contexts/PolkadotContext';
import { useWallet } from '../../contexts/WalletContext';

interface OperationState {
  isLoading: boolean;
  error: string | null;
}

interface States {
  transfer: OperationState;
  approveTransfer: OperationState;
  cancelApproval: OperationState;
  clearAllTransferApprovals: OperationState;
  approveItemAttributes: OperationState;
  cancelItemAttributesApproval: OperationState;
  getOwnedNFTs: OperationState;
  batchTransfer: OperationState;
}

export const useNFTTransfers = () => {
  const { api, isConnected } = usePolkadot();
  const { selectedAccount } = useWallet();
  
  const [states, setStates] = useState<States>({
    transfer: { isLoading: false, error: null },
    approveTransfer: { isLoading: false, error: null },
    cancelApproval: { isLoading: false, error: null },
    clearAllTransferApprovals: { isLoading: false, error: null },
    approveItemAttributes: { isLoading: false, error: null },
    cancelItemAttributesApproval: { isLoading: false, error: null },
    getOwnedNFTs: { isLoading: false, error: null },
    batchTransfer: { isLoading: false, error: null },
  });

  const updateState = useCallback((operation: keyof States, update: Partial<OperationState>) => {
    setStates(prev => ({
      ...prev,
      [operation]: { ...prev[operation], ...update }
    }));
  }, []);

  // Transfer NFT directly
  const transfer = useCallback(
    async (collectionId: number, itemId: number, destination: string) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      updateState('transfer', { isLoading: true, error: null });

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
        updateState('transfer', { error: errorMessage });
        throw new Error(errorMessage);
      } finally {
        updateState('transfer', { isLoading: false });
      }
    },
    [api, selectedAccount, isConnected, updateState]
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

      updateState('approveTransfer', { isLoading: true, error: null });

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
        updateState('approveTransfer', { error: errorMessage });
        throw new Error(errorMessage);
      } finally {
        updateState('approveTransfer', { isLoading: false });
      }
    },
    [api, selectedAccount, isConnected, updateState]
  );

  // Cancel specific transfer approval
  const cancelApproval = useCallback(
    async (collectionId: number, itemId: number, delegate: string) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      updateState('cancelApproval', { isLoading: true, error: null });

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
        updateState('cancelApproval', { error: errorMessage });
        throw new Error(errorMessage);
      } finally {
        updateState('cancelApproval', { isLoading: false });
      }
    },
    [api, selectedAccount, isConnected, updateState]
  );

  // Clear all transfer approvals
  const clearAllTransferApprovals = useCallback(
    async (collectionId: number, itemId: number) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      updateState('clearAllTransferApprovals', { isLoading: true, error: null });

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
        updateState('clearAllTransferApprovals', { error: errorMessage });
        throw new Error(errorMessage);
      } finally {
        updateState('clearAllTransferApprovals', { isLoading: false });
      }
    },
    [api, selectedAccount, isConnected, updateState]
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

      updateState('approveItemAttributes', { isLoading: true, error: null });

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
        updateState('approveItemAttributes', { error: errorMessage });
        throw new Error(errorMessage);
      } finally {
        updateState('approveItemAttributes', { isLoading: false });
      }
    },
    [api, selectedAccount, isConnected, updateState]
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

      updateState('cancelItemAttributesApproval', { isLoading: true, error: null });

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
        updateState('cancelItemAttributesApproval', { error: errorMessage });
        throw new Error(errorMessage);
      } finally {
        updateState('cancelItemAttributesApproval', { isLoading: false });
      }
    },
    [api, selectedAccount, isConnected, updateState]
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

      updateState('getOwnedNFTs', { isLoading: true, error: null });

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
        updateState('getOwnedNFTs', { error: errorMessage });
        throw new Error(errorMessage);
      } finally {
        updateState('getOwnedNFTs', { isLoading: false });
      }
    },
    [api, selectedAccount, updateState]
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

      updateState('batchTransfer', { isLoading: true, error: null });

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
        updateState('batchTransfer', { error: errorMessage });
        throw new Error(errorMessage);
      } finally {
        updateState('batchTransfer', { isLoading: false });
      }
    },
    [api, selectedAccount, isConnected, updateState]
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
    states,
    isLoading: Object.values(states).some(state => state.isLoading),
    error: Object.values(states).find(state => state.error)?.error || null,
    isReady: !!api && !!selectedAccount && isConnected,
  };
};