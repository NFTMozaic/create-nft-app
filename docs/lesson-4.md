# 🔐 Lesson 4: Connecting Polkadot Wallets and Managing Accounts

In this lesson, you'll set up wallet integration in your Next.js application using Polkadot-compatible wallets. This will enable users to securely connect their wallets, manage accounts, and interact seamlessly with your NFT application on Asset Hub.

## 1. Creating the Accounts Context

To handle wallet connections, accounts, and account switching conveniently, we'll create a React context. Create a file in your project at `context/AccountsContext.tsx`.

Then, paste the following initial code snippet into this file:

```ts
import React, { createContext, useState, useEffect, ReactNode, useCallback, useContext, useMemo } from "react";
import { IPolkadotExtensionAccount, IPolkadotExtensionWalletInfo, Polkadot } from "@unique-nft/utils/extension";

interface AccountsContextProps {
  wallets: IPolkadotExtensionWalletInfo[];
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
  const [wallets, setWallets] = useState<IPolkadotExtensionWalletInfo[]>([]);
  const [accounts, setAccounts] = useState<Map<string, IPolkadotExtensionAccount>>(new Map());
  const [activeAccount, setActiveAccount] = useState<IPolkadotExtensionAccount | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetActiveAccount = useCallback((account: IPolkadotExtensionAccount) => {
    setActiveAccount(account);
    localStorage.setItem("lastActiveAccount", account.address);
  }, []);
  
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
          (w) => w.name == walletName
        );

        if (!selectedExtension) {
          setError(`Failed to enable ${walletName}.`);
          return;
        }

        const requestedWallet = await Polkadot.loadWalletByName(walletName);
        setAccounts((prevAccounts) => {
          const newAccounts = new Map(prevAccounts);
          for (const account of requestedWallet.accounts) {
            newAccounts.set(account.address, account);
          }
          return newAccounts;
        });

        if (!activeAccount) {
          const restoredAccount =
            requestedWallet.accounts.find(
              (acc) => acc.address === lastActiveAddress
            ) ||
            requestedWallet.accounts[0] ||
            null;
          setActiveAccount(restoredAccount);
          if (restoredAccount)
            localStorage.setItem("lastActiveAccount", restoredAccount.address);
        }

        localStorage.setItem("lastConnectedWallet", walletName);
      } catch (error) {
        handleError(error, "Error connecting wallets");
      }
    },
    [activeAccount, handleError]
  );

  useEffect(() => {
    const connect = async () => {
      try {
        const {wallets: injectedWallets} = await Polkadot.listWallets();
        setWallets(injectedWallets);
        const lastConnectedWallet =
          localStorage.getItem("lastConnectedWallet") || undefined;
        const lastActiveAccount =
          localStorage.getItem("lastActiveAccount") || undefined;

        if (lastConnectedWallet) {
          await connectWallet(lastConnectedWallet, lastActiveAccount);
        }
      } catch (error) {
        handleError(error, "Error initializing wallets");
      }
    };

    connect();
  }, [connectWallet, handleError]);

  const disconnectWallet = () => {
    localStorage.removeItem("lastConnectedWallet");
    localStorage.removeItem("lastActiveAccount");
    setAccounts(new Map());
    setActiveAccount(null);
    setError(null);
    setWallets([]);
  };

  const contextValue = useMemo(() => ({
    wallets,
    accounts,
    activeAccount,
    error,
    connectWallet,
    setActiveAccount: handleSetActiveAccount,
    disconnectWallet,
  }), [wallets, accounts, activeAccount, error, connectWallet, handleSetActiveAccount]);

  return (
    <AccountsContext.Provider
      value={contextValue}
    >
      {children}
    </AccountsContext.Provider>
  );
};

export const useAccountsContext = () => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error("useAccountsContext must be used within AccountsProvider");
  }
  return context;
};
```

### 📚 Explanation:

- `AccountsContext` Provider: Manages the state related to wallet connections, such as available Polkadot wallets, connected accounts, the currently active account, and any connection errors. This context ensures wallet information is easily accessible across your entire application.
- Wallet Detection (`Polkadot.listWallets`): Automatically detects installed Polkadot-compatible wallet extensions (e.g., Polkadot.js) and updates the available wallet list in the application's state.
- Wallet Connection (`connectWallet`): Connects to a selected wallet extension, loads associated user accounts into state, and attempts to restore previously active account selections from local storage to provide a seamless user experience.
- Active Account Management (`setActiveAccount`): Allows selecting and persisting the active account, storing the choice in local storage to maintain consistent state even across browser sessions.
- Wallet Disconnection (`disconnectWallet`): Provides functionality to clear the current wallet connection and associated state, removing any persisted selections from local storage.

## Integrate the Context Provider

Update your `app/layout.tsx` file by wrapping the application with your newly created `AccountsProvider` alongside `UniqueSDKProvider`:

```ts
// app/layout.tsx
'use client';

import { AccountsProvider } from '../context/AccountsContext';
import { UniqueSDKProvider } from '../context/UniqueSDKContext';
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UniqueSDKProvider>
          <AccountsProvider>
            {children}
          </AccountsProvider>
        </UniqueSDKProvider>
      </body>
    </html>
  );
}
```

## Quick Wallet Detection Test

As a quick check, create a simple component (`WalletList.tsx`) to ensure wallets are detected:

```ts
'use client';

import { useAccountsContext } from "../context/AccountsContext";

export default function WalletList() {
  const { wallets, error } = useAccountsContext();

  return (
    <div>
      <h2>Available Wallets:</h2>
      {error && <p>Error: {error}</p>}
      <ul>
        {wallets.map(wallet => (
          <li key={wallet.name}>{wallet.prettyName}</li>
        ))}
      </ul>
    </div>
  );
}
```

Include this temporarily in your homepage (app/page.tsx) to test wallet detection:

```ts
'use client';

import WalletList from '../components/WalletList';

export default function Home() {
  return (
    <div>
      <h1>Test Wallet Detection</h1>
      <WalletList />
    </div>
  );
}
```

> [!NOTE]
> Make sure you have wallets such as Polkadot{.js} installed in your browser.

## 🎯 Checkpoint:
You've now successfully integrated Polkadot-compatible wallet support into your Next.js NFT application.

Next, you'll create a user-friendly component allowing your users to select wallets and accounts easily, enabling smooth NFT interactions.

Let's continue building!
