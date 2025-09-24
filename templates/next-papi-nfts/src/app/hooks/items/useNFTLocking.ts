'use client';

import { useState, useCallback } from 'react';
import { usePolkadot } from '../../contexts/PolkadotContext';
import { useWallet } from '../../contexts/WalletContext';

interface OperationState {
  isLoading: boolean;
  error: string | null;
}

interface States {
  lockItemTransfer: OperationState;
  unlockItemTransfer: OperationState;
  lockItemProperties: OperationState;
  getItemSettings: OperationState;
  batchLockTransfers: OperationState;
  batchUnlockTransfers: OperationState;
}

export const useNFTLocking = () => {
  const { api, isConnected } = usePolkadot();
  const { selectedAccount } = useWallet();
  
  const [states, setStates] = useState<States>({
    lockItemTransfer: { isLoading: false, error: null },
    unlockItemTransfer: { isLoading: false, error: null },
    lockItemProperties: { isLoading: false, error: null },
    getItemSettings: { isLoading: false, error: null },
    batchLockTransfers: { isLoading: false, error: null },
    batchUnlockTransfers: { isLoading: false, error: null },
  });

  const updateState = useCallback((operation: keyof States, update: Partial<OperationState>) => {
    setStates(prev => ({
      ...prev,
      [operation]: { ...prev[operation], ...update }
    }));
  }, []);

  // Lock NFT transfers (Freezer role)
  const lockItemTransfer = useCallback(
    async (collectionId: number, itemId: number) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      updateState('lockItemTransfer', { isLoading: true, error: null });

      try {
        const lockTx = await api.tx.Nfts.lock_item_transfer({
          collection: collectionId,
          item: itemId,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: lockTx.txHash,
          blockHash: lockTx.block.hash,
          events: lockTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to lock item transfer';
        updateState('lockItemTransfer', { error: errorMessage });
        throw new Error(errorMessage);
      } finally {
        updateState('lockItemTransfer', { isLoading: false });
      }
    },
    [api, selectedAccount, isConnected, updateState]
  );

  // Unlock NFT transfers (Freezer role)
  const unlockItemTransfer = useCallback(
    async (collectionId: number, itemId: number) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      updateState('unlockItemTransfer', { isLoading: true, error: null });

      try {
        const unlockTx = await api.tx.Nfts.unlock_item_transfer({
          collection: collectionId,
          item: itemId,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: unlockTx.txHash,
          blockHash: unlockTx.block.hash,
          events: unlockTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to unlock item transfer';
        updateState('unlockItemTransfer', { error: errorMessage });
        throw new Error(errorMessage);
      } finally {
        updateState('unlockItemTransfer', { isLoading: false });
      }
    },
    [api, selectedAccount, isConnected, updateState]
  );

  // Permanently lock NFT properties (Admin role)
  const lockItemProperties = useCallback(
    async (
      collectionId: number,
      itemId: number,
      lockMetadata: boolean,
      lockAttributes: boolean
    ) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      updateState('lockItemProperties', { isLoading: true, error: null });

      try {
        const lockTx = await api.tx.Nfts.lock_item_properties({
          collection: collectionId,
          item: itemId,
          lock_metadata: lockMetadata,
          lock_attributes: lockAttributes,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: lockTx.txHash,
          blockHash: lockTx.block.hash,
          events: lockTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to lock item properties';
        updateState('lockItemProperties', { error: errorMessage });
        throw new Error(errorMessage);
      } finally {
        updateState('lockItemProperties', { isLoading: false });
      }
    },
    [api, selectedAccount, isConnected, updateState]
  );

  // Get item settings/lock status
  const getItemSettings = useCallback(
    async (collectionId: number, itemId: number) => {
      if (!api) {
        throw new Error('Polkadot API not connected');
      }

      updateState('getItemSettings', { isLoading: true, error: null });

      try {
        const itemConfig = await api.query.Nfts.ItemConfigOf.getValue(
          collectionId,
          itemId
        );

        if (!itemConfig) {
          return null;
        }

        // Bitflag interpretation:
        // 1 (001) = Non-transferable
        // 2 (010) = Locked metadata
        // 4 (100) = Locked attributes
        const settingsBigint = BigInt(itemConfig);

        return {
          isTransferable: (settingsBigint & 1n) === 0n, // If bit is NOT set, it's transferable
          isMutableMetadata: (settingsBigint & 2n) === 0n, // If bit is NOT set, it's mutable
          isMutableAttributes: (settingsBigint & 4n) === 0n, // If bit is NOT set, it's mutable
          settings: settingsBigint,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get item settings';
        updateState('getItemSettings', { error: errorMessage });
        throw new Error(errorMessage);
      } finally {
        updateState('getItemSettings', { isLoading: false });
      }
    },
    [api, updateState]
  );

  // Check if NFT is transferable
  const isTransferable = useCallback(
    async (collectionId: number, itemId: number): Promise<boolean> => {
      try {
        const settings = await getItemSettings(collectionId, itemId);
        return settings ? settings.isTransferable : true; // Default to transferable if no settings
      } catch (err) {
        console.warn('Failed to check transferability:', err);
        return false;
      }
    },
    [getItemSettings]
  );

  // Check if NFT metadata is mutable
  const isMetadataMutable = useCallback(
    async (collectionId: number, itemId: number): Promise<boolean> => {
      try {
        const settings = await getItemSettings(collectionId, itemId);
        return settings ? settings.isMutableMetadata : true; // Default to mutable if no settings
      } catch (err) {
        console.warn('Failed to check metadata mutability:', err);
        return false;
      }
    },
    [getItemSettings]
  );

  // Check if NFT attributes are mutable
  const areAttributesMutable = useCallback(
    async (collectionId: number, itemId: number): Promise<boolean> => {
      try {
        const settings = await getItemSettings(collectionId, itemId);
        return settings ? settings.isMutableAttributes : true; // Default to mutable if no settings
      } catch (err) {
        console.warn('Failed to check attributes mutability:', err);
        return false;
      }
    },
    [getItemSettings]
  );

  // Check if NFT is locked (soulbound)
  const isLocked = useCallback(
    async (collectionId: number, itemId: number): Promise<boolean> => {
      try {
        const transferable = await isTransferable(collectionId, itemId);
        return !transferable;
      } catch (err) {
        console.warn('Failed to check lock status:', err);
        return false;
      }
    },
    [isTransferable]
  );

  // Batch lock multiple NFT transfers
  const batchLockTransfers = useCallback(
    async (lockData: Array<{ collectionId: number; itemId: number }>) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      if (lockData.length === 0) {
        throw new Error('No items to lock provided');
      }

      updateState('batchLockTransfers', { isLoading: true, error: null });

      try {
        const calls = lockData.map(
          ({ collectionId, itemId }) =>
            api.tx.Nfts.lock_item_transfer({
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
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to batch lock transfers';
        updateState('batchLockTransfers', { error: errorMessage });
        throw new Error(errorMessage);
      } finally {
        updateState('batchLockTransfers', { isLoading: false });
      }
    },
    [api, selectedAccount, isConnected, updateState]
  );

  // Batch unlock multiple NFT transfers
  const batchUnlockTransfers = useCallback(
    async (unlockData: Array<{ collectionId: number; itemId: number }>) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      if (unlockData.length === 0) {
        throw new Error('No items to unlock provided');
      }

      updateState('batchUnlockTransfers', { isLoading: true, error: null });

      try {
        const calls = unlockData.map(
          ({ collectionId, itemId }) =>
            api.tx.Nfts.unlock_item_transfer({
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
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to batch unlock transfers';
        updateState('batchUnlockTransfers', { error: errorMessage });
        throw new Error(errorMessage);
      } finally {
        updateState('batchUnlockTransfers', { isLoading: false });
      }
    },
    [api, selectedAccount, isConnected, updateState]
  );

  // Utility function to decode item settings bitflags
  const decodeItemSettings = useCallback((settings: bigint) => {
    return {
      isTransferable: (settings & 1n) === 0n,
      isMutableMetadata: (settings & 2n) === 0n,
      isMutableAttributes: (settings & 4n) === 0n,
      settings,
    };
  }, []);

  // Utility function to encode item settings to bitflags
  const encodeItemSettings = useCallback(
    (settings: {
      isTransferable?: boolean;
      isMutableMetadata?: boolean;
      isMutableAttributes?: boolean;
    }): bigint => {
      let encoded = 0n;
      // Note: bits are set for LOCKED states, not unlocked states
      if (settings.isTransferable === false) encoded |= 1n;
      if (settings.isMutableMetadata === false) encoded |= 2n;
      if (settings.isMutableAttributes === false) encoded |= 4n;
      return encoded;
    },
    []
  );

  return {
    // Transfer locking (reversible by Freezer)
    lockItemTransfer,
    unlockItemTransfer,
    batchLockTransfers,
    batchUnlockTransfers,

    // Property locking (permanent, Admin only)
    lockItemProperties,

    // Status queries
    getItemSettings,
    isTransferable,
    isMetadataMutable,
    areAttributesMutable,
    isLocked,

    // Utility functions
    decodeItemSettings,
    encodeItemSettings,

    // State
    states,
    isLoading: Object.values(states).some(state => state.isLoading),
    error: Object.values(states).find(state => state.error)?.error || null,
    isReady: !!api && !!selectedAccount && isConnected,
  };
};