import React, { useContext } from 'react';
import { AccountsContext } from '@/app/lib/wallets/AccountsProvider';
import './PolkadotWalletSelector.module.css';
import { shortPolkadotAddress } from '@/app/lib/utils';

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
    return <div className="pdw-container">Loading...</div>;
  }

  const { wallets, accounts, activeAccount, connectWallet, setActiveAccount, disconnectWallet, error } = accountsContext;

  return (
    <div className="pdw-container">
      <h2 className="pdw-title">Polkadot Wallet Selector</h2>

      {error && <p className="pdw-error">{error}</p>}

      <div className="pdw-wallet-buttons">
        {Object.entries(walletDownloadLinks).map(([walletName, link]) => {
          const wallet = wallets.find(w => w.name === walletName);
          return (
            <button
              key={walletName}
              className={`pdw-wallet-button ${wallet ? 'pdw-available' : 'pdw-missing'}`}
              onClick={() => wallet ? connectWallet(wallet.name) : window.open(link, "_blank")}
            >
              {wallet ? `Connect ${wallet.title}` : `Download ${walletName.replace("-", " ")}`}
            </button>
          );
        })}
      </div>

      {accounts.length > 0 && (
        <div className="pdw-account-list">
          <h3>Connected Accounts</h3>
          {accounts.map(account => (
            <label key={account.address} className="pdw-account-label">
              <input
                type="radio"
                name="activeAccount"
                checked={activeAccount?.address === account.address}
                onChange={() => setActiveAccount(account)}
              />
              {account.name || shortPolkadotAddress(account.address)}
              <small> (By: {account?.meta?.source || 'Unknown'})</small>
            </label>
          ))}
          <button className="pdw-disconnect-button" onClick={disconnectWallet}>
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default PolkadotWalletSelector;
