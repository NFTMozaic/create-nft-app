import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {IPolkadotExtensionAccount, Polkadot} from "@unique-nft/utils/extension";

const KNOWN_WALLETS = [
  { name: 'polkadot-js', title: 'Polkadot.js' },
  { name: 'talisman', title: 'Talisman' },
  { name: 'subwallet-js', title: 'SubWallet' },
  { name: 'nova', title: 'Nova Wallet' },
  { name: "enkrypt", title: "Enkrypt" },
];

interface Wallet {
  name: string;
  title: string;
}

interface AccountsContextProps {
  wallets: Wallet[];
  accounts: IPolkadotExtensionAccount[];
  activeAccount: IPolkadotExtensionAccount | null;
  error: string | null;
  connectWallet: (walletName: string) => Promise<void>;
  setActiveAccount: (account: IPolkadotExtensionAccount) => void;
  disconnectWallet: () => void;
}

export const AccountsContext = createContext<AccountsContextProps | undefined>(undefined);

export const AccountsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [accounts, setAccounts] = useState<IPolkadotExtensionAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<IPolkadotExtensionAccount | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async (walletName: string, lastActiveAddress?: string) => {
    setError(null);
    const wallets = await Polkadot.listWallets();
    const selectedExtension = wallets.wallets.find(w => w.name == walletName);

    if (!selectedExtension) {
      setError(`Failed to enable ${walletName}.`);
      return;
    }

    const requestedWallet = await Polkadot.loadWalletByName(walletName);
    setAccounts(requestedWallet.accounts);

    if (!activeAccount) {
      const restoredAccount = requestedWallet.accounts.find(acc => acc.address === lastActiveAddress) || requestedWallet.accounts[0] || null;
      setActiveAccount(restoredAccount);
      if (restoredAccount) localStorage.setItem('lastActiveAccount', restoredAccount.address);
    }

    localStorage.setItem('lastConnectedWallet', walletName);
  }, [activeAccount]);

  useEffect(() => {
    const detectedWallets = KNOWN_WALLETS.filter(wallet => window.injectedWeb3?.[wallet.name]);
    setWallets(detectedWallets);

    const lastConnectedWallet = localStorage.getItem('lastConnectedWallet') || undefined;
    const lastActiveAccount = localStorage.getItem('lastActiveAccount') || undefined;

    if (lastConnectedWallet) {
      connectWallet(lastConnectedWallet, lastActiveAccount);
    }
  }, [connectWallet]);

  const handleSetActiveAccount = (account: IPolkadotExtensionAccount) => {
    setActiveAccount(account);
    localStorage.setItem('lastActiveAccount', account.address);
  };

  const disconnectWallet = () => {
    localStorage.removeItem('lastConnectedWallet');
    localStorage.removeItem('lastActiveAccount');
    setAccounts([]);
    setActiveAccount(null);
    setError(null);
    setWallets([...KNOWN_WALLETS])
  };

  return (
    <AccountsContext.Provider value={{ wallets, accounts, activeAccount, error, connectWallet, setActiveAccount: handleSetActiveAccount, disconnectWallet }}>
      {children}
    </AccountsContext.Provider>
  );
};
