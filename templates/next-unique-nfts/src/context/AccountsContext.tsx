import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import {
  IPolkadotExtensionAccount,
  Polkadot,
} from '@unique-nft/utils/extension';
import { KNOWN_WALLETS } from '../lib/utils';

interface Wallet {
  name: string;
  title: string;
}

interface AccountsContextProps {
  wallets: Wallet[];
  accounts: Map<string, IPolkadotExtensionAccount>;
  activeAccount: IPolkadotExtensionAccount | null;
  error: string | null;
  connectWallet: (walletName: string) => Promise<void>;
  setActiveAccount: (account: IPolkadotExtensionAccount) => void;
  disconnectWallet: () => void;
}

export const AccountsContext = createContext<AccountsContextProps | undefined>(
  undefined
);

export const AccountsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [accounts, setAccounts] = useState<
    Map<string, IPolkadotExtensionAccount>
  >(new Map());
  const [activeAccount, setActiveAccount] =
    useState<IPolkadotExtensionAccount | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetActiveAccount = useCallback(
    (account: IPolkadotExtensionAccount) => {
      setActiveAccount(account);
      localStorage.setItem('lastActiveAccount', account.address);
    },
    []
  );

  const handleError = useCallback((error: unknown, contextMessage: string) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    setError(`${contextMessage}: ${message}`);
  }, []);

  const connectWallet = useCallback(
    async (walletName: string, lastActiveAddress?: string) => {
      setError(null);
      try {
        const wallets = await Polkadot.listWallets();
        const selectedExtension = wallets.wallets.find(
          w => w.name == walletName
        );

        if (!selectedExtension) {
          setError(`Failed to enable ${walletName}.`);
          return;
        }

        const requestedWallet = await Polkadot.loadWalletByName(walletName);
        setAccounts(prevAccounts => {
          const newAccounts = new Map(prevAccounts);
          for (const account of requestedWallet.accounts) {
            newAccounts.set(account.address, account);
          }
          return newAccounts;
        });

        if (!activeAccount) {
          const restoredAccount =
            requestedWallet.accounts.find(
              acc => acc.address === lastActiveAddress
            ) ||
            requestedWallet.accounts[0] ||
            null;
          setActiveAccount(restoredAccount);
          if (restoredAccount)
            localStorage.setItem('lastActiveAccount', restoredAccount.address);
        }

        localStorage.setItem('lastConnectedWallet', walletName);
      } catch (error) {
        handleError(error, 'Error connecting wallets');
      }
    },
    [activeAccount, handleError]
  );

  useEffect(() => {
    const connect = async () => {
      try {
        const injectedWallets = await Polkadot.listWallets();
        const detectedWallets = KNOWN_WALLETS.filter(wallet =>
          injectedWallets.wallets.find(w => w.name === wallet.name)
        );
        setWallets(detectedWallets);
        const lastConnectedWallet =
          localStorage.getItem('lastConnectedWallet') || undefined;
        const lastActiveAccount =
          localStorage.getItem('lastActiveAccount') || undefined;

        if (lastConnectedWallet) {
          await connectWallet(lastConnectedWallet, lastActiveAccount);
        }
      } catch (error) {
        handleError(error, 'Error initializing wallets');
      }
    };

    connect();
  }, [connectWallet, handleError]);

  const disconnectWallet = () => {
    localStorage.removeItem('lastConnectedWallet');
    localStorage.removeItem('lastActiveAccount');
    setAccounts(new Map());
    setActiveAccount(null);
    setError(null);
    setWallets([...KNOWN_WALLETS]);
  };

  const contextValue = useMemo(
    () => ({
      wallets,
      accounts,
      activeAccount,
      error,
      connectWallet,
      setActiveAccount: handleSetActiveAccount,
      disconnectWallet,
    }),
    [
      wallets,
      accounts,
      activeAccount,
      error,
      connectWallet,
      handleSetActiveAccount,
    ]
  );

  return (
    <AccountsContext.Provider value={contextValue}>
      {children}
    </AccountsContext.Provider>
  );
};

export const useAccountsContext = () => useContext(AccountsContext);
