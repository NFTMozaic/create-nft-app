'use client';

import React from "react";
import { useAccountsContext } from "@/app/lib/wallets/AccountsProvider";
import { KNOWN_WALLETS, shortPolkadotAddress } from "@/app/lib/utils";
import styles from "./PolkadotWalletSelector.module.css";

const PolkadotWalletSelector: React.FC = () => {
  const accountsContext = useAccountsContext();

  if (!accountsContext) {
    return <div className={styles.pdwContainer}>Loading...</div>;
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

  return (
    <div className={styles.pdwContainer}>
      <h2 className={styles.pdwTitle}>Polkadot Wallet Selector</h2>

      {error && <p className={styles.pdwError}>{error}</p>}

      <div className={styles.pdwWalletButtons}>
        {KNOWN_WALLETS.map(({ name, title, downloadLink }) => {
          const wallet = wallets.find((w) => w.name === name);
          return (
            <button
              key={name}
              className={`${styles.pdwWalletButton} ${
                wallet ? styles.pdwAvailable : styles.pdwMissing
              }`}
              onClick={() =>
                wallet ? connectWallet(wallet.name) : window.open(downloadLink, "_blank")
              }
            >
              {wallet ? `Connect ${title}` : `Download ${title}`}
            </button>
          );
        })}
      </div>

      {accounts.size > 0 && (
        <div className={styles.pdwAccountList}>
          <h3>Connected Accounts</h3>
          {[...accounts.entries()].map(([address, account]) => (
            <label key={address} className={styles.pdwAccountLabel}>
              <input
                type="radio"
                name="activeAccount"
                checked={activeAccount?.address === address || false}
                onChange={() => setActiveAccount(account)}
              />
              {account.name || shortPolkadotAddress(account.address)}
              <small>By {account.wallet?.prettyName || "Unknown"}</small>
            </label>
          ))}
          <button className={styles.pdwDisconnectButton} onClick={disconnectWallet}>
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default PolkadotWalletSelector;
