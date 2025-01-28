import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

const KNOWN_WALLETS = [
  { name: 'polkadot-js', title: 'Polkadot.js' },
  { name: 'talisman', title: 'Talisman' },
  { name: 'subwallet-js', title: 'SubWallet' },
  { name: 'nova', title: 'Nova Wallet' },
  { name: "enkrypt", title: "Enkrypt" },
];

interface Account {
  address: string;
  name?: string;
  meta?: {
    source?: string;
  };
}

interface Wallet {
  name: string;
  title: string;
}

interface AccountsContextProps {
  wallets: Wallet[];
  accounts: Account[];
  activeAccount: Account | null;
  error: string | null;
  connectWallet: (walletName: string) => Promise<void>;
  setActiveAccount: (account: Account) => void;
  disconnectWallet: () => void;
}

export const AccountsContext = createContext<AccountsContextProps | undefined>(undefined);

export const AccountsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectedWallets = KNOWN_WALLETS.filter(wallet => window.injectedWeb3?.[wallet.name]);
    setWallets(detectedWallets);

    const lastConnectedWallet = localStorage.getItem('lastConnectedWallet') || undefined;
    const lastActiveAccount = localStorage.getItem('lastActiveAccount') || undefined;

    if (lastConnectedWallet) {
      connectWallet(lastConnectedWallet, lastActiveAccount);
    }
  }, []);

  const connectWallet = async (walletName: string, lastActiveAddress?: string) => {
    setError(null);
    const extensions = await web3Enable('Your DApp Name');
    const selectedExtension = extensions.find(ext => ext.name === walletName);

    if (!selectedExtension) {
      setError(`Failed to enable ${walletName}.`);
      return;
    }

    const userAccounts = await web3Accounts();
    setAccounts(userAccounts);

    // Preserve the active account if it exists, otherwise set a default one
    if (!activeAccount) {
      const restoredAccount = userAccounts.find(acc => acc.address === lastActiveAddress) || userAccounts[0] || null;
      setActiveAccount(restoredAccount);
      if (restoredAccount) localStorage.setItem('lastActiveAccount', restoredAccount.address);
    }

    localStorage.setItem('lastConnectedWallet', walletName);
  };

  const handleSetActiveAccount = (account: Account) => {
    setActiveAccount(account);
    localStorage.setItem('lastActiveAccount', account.address);
  };

  const disconnectWallet = () => {
    localStorage.removeItem('lastConnectedWallet');
    localStorage.removeItem('lastActiveAccount');
    setAccounts([]);
    setActiveAccount(null);
    setError(null);
    window.location.reload();
  };

  return (
    <AccountsContext.Provider value={{ wallets, accounts, activeAccount, error, connectWallet, setActiveAccount: handleSetActiveAccount, disconnectWallet }}>
      {children}
    </AccountsContext.Provider>
  );
};
