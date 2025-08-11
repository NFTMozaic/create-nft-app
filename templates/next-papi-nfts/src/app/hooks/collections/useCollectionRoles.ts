'use client';

import { useState, useCallback } from 'react';
import { MultiAddress } from '@polkadot-api/descriptors';
import { usePolkadot } from '../../contexts/PolkadotContext';
import { useWallet } from '../../contexts/WalletContext';

export interface CollectionTeam {
  admin?: string;
  issuer?: string;
  freezer?: string;
}

export interface CollectionRoles {
  isAdmin: boolean;
  isFreezer: boolean;
  isIssuer: boolean;
  roles: bigint; // Bitflag representation
}

export interface OwnershipTransfer {
  collectionId: number;
  newOwner: string;
}

export const useCollectionRoles = () => {
  const { api, isConnected } = usePolkadot();
  const { selectedAccount } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set collection team (Admin, Issuer, Freezer)
  const setCollectionTeam = useCallback(
    async (collectionId: number, team: CollectionTeam) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const setTeamTx = await api.tx.Nfts.set_team({
          collection: collectionId,
          admin: team.admin ? MultiAddress.Id(team.admin) : undefined,
          issuer: team.issuer ? MultiAddress.Id(team.issuer) : undefined,
          freezer: team.freezer ? MultiAddress.Id(team.freezer) : undefined,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: setTeamTx.txHash,
          blockHash: setTeamTx.block.hash,
          events: setTeamTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to set collection team';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Get collection roles for a specific account
  const getCollectionRoles = useCallback(
    async (
      collectionId: number,
      accountAddress: string
    ): Promise<CollectionRoles | null> => {
      if (!api) {
        throw new Error('Polkadot API not connected');
      }

      try {
        const roles = await api.query.Nfts.CollectionRoleOf.getValue(
          collectionId,
          accountAddress
        );

        if (!roles) {
          return null;
        }

        // Bitflag interpretation:
        // 1 (001) = Issuer
        // 2 (010) = Freezer
        // 4 (100) = Admin
        const rolesBigint = BigInt(roles);

        return {
          isIssuer: (rolesBigint & 1n) !== 0n,
          isFreezer: (rolesBigint & 2n) !== 0n,
          isAdmin: (rolesBigint & 4n) !== 0n,
          roles: rolesBigint,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get collection roles';
        throw new Error(errorMessage);
      }
    },
    [api]
  );

  // Check if current account has specific role
  const hasRole = useCallback(
    async (
      collectionId: number,
      role: 'admin' | 'issuer' | 'freezer',
      accountAddress?: string
    ): Promise<boolean> => {
      const address = accountAddress || selectedAccount?.address;
      if (!address) {
        return false;
      }

      try {
        const roles = await getCollectionRoles(collectionId, address);
        if (!roles) {
          return false;
        }

        switch (role) {
          case 'admin':
            return roles.isAdmin;
          case 'issuer':
            return roles.isIssuer;
          case 'freezer':
            return roles.isFreezer;
          default:
            return false;
        }
      } catch (err) {
        console.warn(`Failed to check role ${role}:`, err);
        return false;
      }
    },
    [getCollectionRoles, selectedAccount]
  );

  // Get all accounts with roles for a collection
  const getCollectionTeamMembers = useCallback(
    async (collectionId: number) => {
      if (!api) {
        throw new Error('Polkadot API not connected');
      }

      try {
        const roleEntries =
          await api.query.Nfts.CollectionRoleOf.getEntries(collectionId);

        const teamMembers = roleEntries.map(entry => {
          const accountAddress = entry.keyArgs[1] as string;
          const rolesBigint = BigInt(entry.value);

          return {
            address: accountAddress,
            isAdmin: (rolesBigint & 4n) !== 0n,
            isFreezer: (rolesBigint & 2n) !== 0n,
            isIssuer: (rolesBigint & 1n) !== 0n,
            roles: rolesBigint,
          };
        });

        return teamMembers;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to get collection team members';
        throw new Error(errorMessage);
      }
    },
    [api]
  );

  // Set accept ownership (step 1 of ownership transfer)
  const setAcceptOwnership = useCallback(
    async (collectionId: number) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const acceptTx = await api.tx.Nfts.set_accept_ownership({
          maybe_collection: collectionId,
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: acceptTx.txHash,
          blockHash: acceptTx.block.hash,
          events: acceptTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to set accept ownership';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Transfer ownership (step 2 of ownership transfer)
  const transferOwnership = useCallback(
    async (collectionId: number, newOwner: string) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const transferTx = await api.tx.Nfts.transfer_ownership({
          collection: collectionId,
          new_owner: MultiAddress.Id(newOwner),
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          transactionHash: transferTx.txHash,
          blockHash: transferTx.block.hash,
          events: transferTx.events,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to transfer ownership';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Complete ownership transfer (both steps in sequence)
  const completeOwnershipTransfer = useCallback(
    async (
      collectionId: number,
      newOwner: string,
      newOwnerSigner: any // The signer for the new owner
    ) => {
      if (!api || !selectedAccount || !isConnected) {
        throw new Error('Polkadot API or wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        // Step 1: New owner accepts ownership
        const acceptTx = await api.tx.Nfts.set_accept_ownership({
          maybe_collection: collectionId,
        }).signAndSubmit(newOwnerSigner);

        // Step 2: Current owner transfers ownership
        const transferTx = await api.tx.Nfts.transfer_ownership({
          collection: collectionId,
          new_owner: MultiAddress.Id(newOwner),
        }).signAndSubmit(selectedAccount.polkadotSigner);

        return {
          acceptTransaction: {
            transactionHash: acceptTx.txHash,
            blockHash: acceptTx.block.hash,
            events: acceptTx.events,
          },
          transferTransaction: {
            transactionHash: transferTx.txHash,
            blockHash: transferTx.block.hash,
            events: transferTx.events,
          },
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to complete ownership transfer';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [api, selectedAccount, isConnected]
  );

  // Get collection owner
  const getCollectionOwner = useCallback(
    async (collectionId: number): Promise<string | null> => {
      if (!api) {
        throw new Error('Polkadot API not connected');
      }

      try {
        const collection =
          await api.query.Nfts.Collection.getValue(collectionId);
        return collection?.owner || null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get collection owner';
        throw new Error(errorMessage);
      }
    },
    [api]
  );

  // Check if current account is collection owner
  const isCollectionOwner = useCallback(
    async (collectionId: number, accountAddress?: string): Promise<boolean> => {
      const address = accountAddress || selectedAccount?.address;
      if (!address) {
        return false;
      }

      try {
        const owner = await getCollectionOwner(collectionId);
        return owner === address;
      } catch (err) {
        console.warn('Failed to check collection ownership:', err);
        return false;
      }
    },
    [getCollectionOwner, selectedAccount]
  );

  // Get collections owned by an account
  const getOwnedCollections = useCallback(
    async (accountAddress?: string) => {
      if (!api) {
        throw new Error('Polkadot API not connected');
      }

      const address = accountAddress || selectedAccount?.address;
      if (!address) {
        throw new Error('No account address provided');
      }

      try {
        const ownedCollections =
          await api.query.Nfts.CollectionAccount.getEntries(address);
        const collectionIds = ownedCollections.map(c => c.keyArgs[1] as number);

        // Get collection details for each owned collection
        const collectionsWithDetails = await Promise.all(
          collectionIds.map(async collectionId => {
            try {
              const collection =
                await api.query.Nfts.Collection.getValue(collectionId);
              return {
                id: collectionId,
                collection,
              };
            } catch (err) {
              console.warn(
                `Failed to get details for collection ${collectionId}:`,
                err
              );
              return {
                id: collectionId,
                collection: null,
              };
            }
          })
        );

        return {
          collectionIds,
          collections: collectionsWithDetails,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to query owned collections';
        throw new Error(errorMessage);
      }
    },
    [api, selectedAccount]
  );

  // Get collections where account has any role
  const getCollectionsWithRoles = useCallback(
    async (accountAddress?: string) => {
      if (!api) {
        throw new Error('Polkadot API not connected');
      }

      const address = accountAddress || selectedAccount?.address;
      if (!address) {
        throw new Error('No account address provided');
      }

      try {
        const roleEntries = await api.query.Nfts.CollectionRoleOf.getEntries();

        // Filter entries for the specified account
        const accountRoles = roleEntries.filter(entry => {
          const entryAddress = entry.keyArgs[1] as string;
          return entryAddress === address;
        });

        const collectionsWithRoles = await Promise.all(
          accountRoles.map(async entry => {
            const collectionId = entry.keyArgs[0] as number;
            const rolesBigint = BigInt(entry.value);

            try {
              const collection =
                await api.query.Nfts.Collection.getValue(collectionId);

              return {
                collectionId,
                collection,
                roles: {
                  isAdmin: (rolesBigint & 4n) !== 0n,
                  isFreezer: (rolesBigint & 2n) !== 0n,
                  isIssuer: (rolesBigint & 1n) !== 0n,
                  roles: rolesBigint,
                },
              };
            } catch (err) {
              console.warn(
                `Failed to get details for collection ${collectionId}:`,
                err
              );
              return {
                collectionId,
                collection: null,
                roles: {
                  isAdmin: (rolesBigint & 4n) !== 0n,
                  isFreezer: (rolesBigint & 2n) !== 0n,
                  isIssuer: (rolesBigint & 1n) !== 0n,
                  roles: rolesBigint,
                },
              };
            }
          })
        );

        return collectionsWithRoles;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to get collections with roles';
        throw new Error(errorMessage);
      }
    },
    [api, selectedAccount]
  );

  // Utility function to decode role bitflags
  const decodeRoles = useCallback((roles: bigint): CollectionRoles => {
    return {
      isIssuer: (roles & 1n) !== 0n,
      isFreezer: (roles & 2n) !== 0n,
      isAdmin: (roles & 4n) !== 0n,
      roles,
    };
  }, []);

  // Utility function to encode roles to bitflags
  const encodeRoles = useCallback(
    (roles: {
      isAdmin?: boolean;
      isFreezer?: boolean;
      isIssuer?: boolean;
    }): bigint => {
      let encoded = 0n;
      if (roles.isIssuer) encoded |= 1n;
      if (roles.isFreezer) encoded |= 2n;
      if (roles.isAdmin) encoded |= 4n;
      return encoded;
    },
    []
  );

  return {
    // Team management
    setCollectionTeam,
    getCollectionRoles,
    hasRole,
    getCollectionTeamMembers,

    // Ownership management
    setAcceptOwnership,
    transferOwnership,
    completeOwnershipTransfer,
    getCollectionOwner,
    isCollectionOwner,

    // Collection queries
    getOwnedCollections,
    getCollectionsWithRoles,

    // Utility functions
    decodeRoles,
    encodeRoles,

    // State
    isLoading,
    error,
    isReady: !!api && !!selectedAccount && isConnected,
  };
};
