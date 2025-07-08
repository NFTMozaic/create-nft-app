'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { getWallets, Wallet } from '@talismn/connect-wallets';
import {
  connectInjectedExtension,
  InjectedPolkadotAccount,
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

const STORAGE_KEY = 'wallet-connection';

interface StoredConnection {
  walletName: string;
  accountAddress?: string;
}

export const WalletProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [accounts, setAccounts] = useState<InjectedPolkadotAccount[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedPolkadotAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize wallets
  useEffect(() => {
    const supported = getWallets().filter(
      w => w.title !== 'Nova Wallet' && w.installed
    );
    setWallets(supported);
  }, []);

  // Save connection to storage
  const saveConnection = useCallback(
    (walletName: string, accountAddress?: string) => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ walletName, accountAddress })
      );
    },
    []
  );

  // Connect to wallet
  const connectWallet = useCallback(
    async (walletName: string, shouldSave = true) => {
      const wallet = wallets.find(w => w.extensionName === walletName);
      if (!wallet?.installed)
        throw new Error(`Wallet ${walletName} not found or not installed`);

      const extension = await connectInjectedExtension(walletName);
      const walletAccounts = extension.getAccounts();

      setSelectedWallet(wallet);
      setAccounts(walletAccounts);

      if (shouldSave && walletAccounts.length > 0) {
        saveConnection(walletName, walletAccounts[0].address);
      }

      return walletAccounts;
    },
    [wallets, saveConnection]
  );

  // Public connect method
  const connect = useCallback(
    async (walletName: string) => {
      try {
        setIsConnecting(true);
        setError(null);
        await connectWallet(walletName);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to connect'));
        console.error('Connection failed:', err);
      } finally {
        setIsConnecting(false);
      }
    },
    [connectWallet]
  );

  // Select account
  const selectAccount = useCallback(
    (address: string) => {
      const account = accounts.find(acc => acc.address === address);
      if (account && selectedWallet) {
        setSelectedAccount(account);
        saveConnection(selectedWallet.extensionName, address);
      }
    },
    [accounts, selectedWallet, saveConnection]
  );

  // Select wallet
  const selectWallet = useCallback(
    (walletName: string) => {
      const wallet = wallets.find(w => w.extensionName === walletName);
      if (wallet) {
        setSelectedWallet(wallet);
        setAccounts([]);
        setSelectedAccount(null);
      }
    },
    [wallets]
  );

  // Disconnect
  const disconnect = useCallback(() => {
    setSelectedWallet(null);
    setAccounts([]);
    setSelectedAccount(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Auto-connect from storage
  useEffect(() => {
    if (!wallets.length) return;

    const autoConnect = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;

        const { walletName, accountAddress }: StoredConnection =
          JSON.parse(stored);
        setIsConnecting(true);

        const walletAccounts = await connectWallet(walletName, false);

        // Set selected account
        const account = accountAddress
          ? walletAccounts.find(acc => acc.address === accountAddress) ||
            walletAccounts[0]
          : walletAccounts[0];

        if (account) {
          setSelectedAccount(account);
          saveConnection(walletName, account.address);
        }
      } catch (error) {
        console.error('Auto-connect failed:', error);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsConnecting(false);
      }
    };

    autoConnect();
  }, [wallets, connectWallet, saveConnection]);

  return (
    <WalletContext.Provider
      value={{
        wallets,
        selectedWallet,
        accounts,
        selectedAccount,
        isConnecting,
        error,
        connect,
        selectAccount,
        selectWallet,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
