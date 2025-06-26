'use client';

import React, { useCallback, useMemo } from 'react';
import { KNOWN_WALLETS, shortPolkadotAddress } from '@/lib/utils';
import styles from './PolkadotWalletSelector.module.css';
import { useAccountsContext } from '@/context';
import { IPolkadotExtensionAccount } from '@unique-nft/utils/extension';

const PolkadotWalletSelector: React.FC = () => {
  const accountsContext = useAccountsContext();
  if (!accountsContext) {
    throw new Error(
      'PolkadotWalletSelector must be used within AccountsProvider'
    );
  }

  const {
    wallets,
    accounts,
    activeAccount,
    connectWallet,
    setActiveAccount,
    disconnectWallet,
    error,
  } = accountsContext;

  const availableWallets = useMemo(() => {
    return new Set(wallets.map(w => w.name));
  }, [wallets]);

  const accountsArray = useMemo(() => [...accounts.entries()], [accounts]);

  const handleConnectWallet = useCallback(
    (walletName: string) => {
      connectWallet(walletName);
    },
    [connectWallet]
  );

  const handleAccountSelection = useCallback(
    (account: IPolkadotExtensionAccount) => {
      setActiveAccount(account);
    },
    [setActiveAccount]
  );

  return (
    <div className={styles.pdwContainer}>
      <h2 className={styles.pdwTitle}>Polkadot Wallet Selector</h2>

      {error && <p className={styles.pdwError}>{error}</p>}

      <div className={styles.pdwWalletButtons}>
        {KNOWN_WALLETS.map(({ name, title, downloadLink }) => {
          const isAvailable = availableWallets.has(name);
          return (
            <button
              key={name}
              className={`${styles.pdwWalletButton} ${
                isAvailable ? styles.pdwAvailable : styles.pdwMissing
              }`}
              onClick={() =>
                isAvailable
                  ? handleConnectWallet(name)
                  : window.open(downloadLink, '_blank', 'noopener,noreferrer')
              }
            >
              {isAvailable ? `Connect ${title}` : `Download ${title}`}
            </button>
          );
        })}
      </div>

      {accounts.size > 0 && (
        <div className={styles.pdwAccountList}>
          <h3>Connected Accounts</h3>
          {accountsArray.map(([address, account]) => (
            <label key={address} className={styles.pdwAccountLabel}>
              <input
                type="radio"
                name="activeAccount"
                checked={activeAccount?.address === address || false}
                onChange={() => handleAccountSelection(account)}
              />
              {account.name || shortPolkadotAddress(account.address)}
              <small>By {account.wallet?.prettyName || 'Unknown'}</small>
            </label>
          ))}
          <button
            className={styles.pdwDisconnectButton}
            onClick={disconnectWallet}
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default PolkadotWalletSelector;
