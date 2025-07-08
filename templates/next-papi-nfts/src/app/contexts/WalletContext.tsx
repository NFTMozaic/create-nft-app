'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { getWallets, Wallet } from '@talismn/connect-wallets';
import {
  connectInjectedExtension,
  InjectedPolkadotAccount,
  InjectedExtension,
} from 'polkadot-api/pjs-signer';

interface WalletContextProps {
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  accounts: InjectedPolkadotAccount[];
  selectedAccount: InjectedPolkadotAccount | null;
  isConnecting: boolean;
  error: Error | null;
  connect: (walletName: string) => Promise<void>;
  selectAccount: (address: string) => void;
  selectWallet: (walletName: string) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextProps>({
  wallets: [],
  selectedWallet: null,
  accounts: [],
  selectedAccount: null,
  isConnecting: false,
  error: null,
  connect: async () => {},
  selectAccount: () => {},
  selectWallet: () => {},
  disconnect: () => {},
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'wallet-connection';

export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
}) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [accounts, setAccounts] = useState<InjectedPolkadotAccount[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedPolkadotAccount | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const supportedWallets = getWallets();
    setWallets(
      supportedWallets.filter(
        wallet => wallet.title !== 'Nova Wallet' && wallet.installed
      )
    );
    setIsInitialized(true);
  }, []);

  // Auto-connect from localStorage
  useEffect(() => {
    if (!isInitialized) return;

    const loadSavedConnection = async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        const { walletName, accountAddress } = JSON.parse(saved);
        if (!walletName) return;

        const wallet = wallets.find(w => w.extensionName === walletName);
        if (!wallet?.installed) return;

        setSelectedWallet(wallet);
        await connect(walletName);

        // Select the saved account if it exists
        if (accountAddress) {
          setTimeout(() => {
            selectAccount(accountAddress);
          }, 100);
        }
      } catch (error) {
        console.error('Failed to auto-connect wallet:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    loadSavedConnection();
  }, [wallets, isInitialized]);

  const connect = async (walletName: string) => {
    try {
      setLoading(true);
      setError(null);

      let targetWallet: Wallet | null = null;

      // Connect to specific wallet
      targetWallet = wallets.find(w => w.extensionName === walletName) || null;
      if (!targetWallet) {
        throw new Error(`Wallet ${walletName} not found`);
      }

      const selectedExtension: InjectedExtension =
        await connectInjectedExtension(walletName);

      const accounts: InjectedPolkadotAccount[] =
        selectedExtension.getAccounts();

      setAccounts(accounts);
      setSelectedWallet(targetWallet);

      // Save to localStorage
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          walletName,
          accountAddress: selectedAccount?.address || null,
        })
      );
    } catch (err) {
      console.error('Failed to connect extension:', err);
      setError(
        err instanceof Error ? err : new Error('Failed to connect to extension')
      );
    } finally {
      setLoading(false);
    }
  };

  const selectAccount = (address: string) => {
    const account = accounts.find(acc => acc.address === address);
    if (account) {
      setSelectedAccount(account);

      // Update localStorage with selected account
      if (selectedWallet) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            walletName: selectedWallet.extensionName,
            accountAddress: address,
          })
        );
      }
    }
  };

  const selectWallet = (walletName: string) => {
    const wallet = wallets.find(w => w.extensionName === walletName);
    if (wallet) {
      setSelectedWallet(wallet);
      setAccounts([]);
      setSelectedAccount(null);
    }
  };

  const disconnect = () => {
    setSelectedWallet(null);
    setAccounts([]);
    setSelectedAccount(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value: WalletContextProps = {
    wallets,
    selectedWallet,
    accounts,
    selectedAccount,
    isConnecting: loading,
    error,
    connect,
    selectAccount,
    selectWallet,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
