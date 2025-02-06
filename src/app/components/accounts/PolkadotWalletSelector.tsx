import React, { useContext } from "react";
import { AccountsContext } from "@/app/lib/wallets/AccountsProvider";
import { shortPolkadotAddress } from "@/app/lib/utils";
import styles from "./PolkadotWalletSelector.module.css";

const walletDownloadLinks: Record<string, string> = {
  "polkadot-js": "https://polkadot.js.org/extension/",
  "talisman": "https://talisman.xyz/",
  "subwallet-js": "https://subwallet.app/",
  "nova": "https://novawallet.io/",
  "enkrypt": "https://www.enkrypt.com/",
};

const PolkadotWalletSelector: React.FC = () => {
  const accountsContext = useContext(AccountsContext);

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
        {Object.entries(walletDownloadLinks).map(([walletName, link]) => {
          const wallet = wallets.find((w) => w.name === walletName);
          return (
            <button
              key={walletName}
              className={`${styles.pdwWalletButton} ${
                wallet ? styles.pdwAvailable : styles.pdwMissing
              }`}
              onClick={() =>
                wallet ? connectWallet(wallet.name) : window.open(link, "_blank")
              }
            >
              {wallet
                ? `Connect ${wallet.title}`
                : `Download ${walletName.replace("-", " ")}`}
            </button>
          );
        })}
      </div>

      {accounts.length > 0 && (
        <div className={styles.pdwAccountList}>
          <h3>Connected Accounts</h3>
          {accounts.map((account) => (
            <label key={account.address} className={styles.pdwAccountLabel}>
              <input
                type="radio"
                name="activeAccount"
                checked={activeAccount?.address === account.address}
                onChange={() => setActiveAccount(account)}
              />
              {account.name || shortPolkadotAddress(account.address)}
              <small> (By: {account?.meta?.source || "Unknown"})</small>
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
