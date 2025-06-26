# 🔐 Lesson 3: Connecting Polkadot Wallets and Managing Accounts

In this lesson, you'll integrate wallet functionality into your Next.js application using the `Polkadot{.js}` wallet. This will allow users to securely connect their wallets, manage accounts, and interact with your NFT application on Asset Hub.

## 1. Creating the Accounts Context

To manage wallet connections and user accounts, we will create a React context.

The AccountsContext is a React context that centralizes wallet connection logic. It allows components to access the currently active account and provides methods for connecting and disconnecting from the Polkadot{.js} wallet.

Create a new file in your project at `context/AccountsContext.tsx`. Copy and paste the following code:

```tsx
'use client';

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { IPolkadotExtensionAccount, Polkadot } from '@unique-nft/utils/extension';

interface AccountsContextProps {
  activeAccount: IPolkadotExtensionAccount | null;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const AccountsContext = createContext<AccountsContextProps | undefined>(undefined);

export const AccountsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeAccount, setAccount] = useState<IPolkadotExtensionAccount | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    setError(null);
    try {
      const { wallets } = await Polkadot.listWallets();
      const polkadotJsWallet = wallets.find(w => w.name === 'polkadot-js');

      if (!polkadotJsWallet) {
        setError('Polkadot{.js} wallet not found.');
        return;
      }

      const loadedWallet = await Polkadot.loadWalletByName('polkadot-js');
      if (loadedWallet.accounts.length === 0) {
        setError('No accounts found in Polkadot{.js} wallet.');
        return;
      }

      setAccount(loadedWallet.accounts[0]);
      localStorage.setItem('activeAccount', loadedWallet.accounts[0].address);
    } catch {
      setError('Error connecting to Polkadot{.js} wallet.');
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    localStorage.removeItem('activeAccount');
    setAccount(null);
    setError(null);
  }, []);

  useEffect(() => {
    const reconnect = async () => {
      const savedAccount = localStorage.getItem('activeAccount');
      if (savedAccount) {
        await connectWallet();
      }
    };
    reconnect();
  }, [connectWallet]);

  return (
    <AccountsContext.Provider value={{ activeAccount, error, connectWallet, disconnectWallet }}>
      {children}
    </AccountsContext.Provider>
  );
};

export const useAccountsContext = () => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccountsContext must be used within an AccountsProvider');
  }
  return context;
};
```

The `AccountsContext` is a React context that centralizes wallet connection logic. It keeps track of the currently active account and provides functions to connect and disconnect from the Polkadot{.js} wallet.

The component maintains two pieces of state: `activeAccount`, which stores the currently connected wallet account, and `error`, which holds any connection errors.

The `connectWallet` function retrieves the list of available wallets and attempts to load the `polkadot-js` wallet. If it finds a valid wallet with accounts, it sets the first account as active and saves it in `localStorage` to persist the session. If no wallets or accounts are found, an error message is displayed.

The `disconnectWallet` function clears the active account from the state and removes it from `localStorage`, effectively logging the user out.

There is also an effect that runs when the component mounts. It checks `localStorage` for a previously connected account and attempts to reconnect it automatically, ensuring a seamless user experience.

## 2. Creating the Wallet Selector Component

Now, we'll build a UI component that allows users to connect and manage their Polkadot wallet.

Create a file `components/PolkadotWalletSelector.tsx`:

```tsx
'use client';

import React from 'react';
import { useAccountsContext } from '@/context/AccountsContext';

const PolkadotWalletSelector: React.FC = () => {
  const { activeAccount, connectWallet, disconnectWallet, error } = useAccountsContext();

  return (
    <div className="flex flex-col items-center p-6 bg-white shadow-md rounded-xl border w-80">
      <h2 className="text-lg font-semibold text-gray-900 text-center mb-4">Polkadot Wallet Selector</h2>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="flex justify-center w-full mt-4">
        {activeAccount ? (
          <button
            className="w-full px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition"
            onClick={disconnectWallet}
          >
            Disconnect {activeAccount.name || 'Wallet'}
          </button>
        ) : (
          <button
            className="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition"
            onClick={connectWallet}
          >
            Connect Polkadot{'.js'}
          </button>
        )}
      </div>

      {activeAccount && (
        <div className="mt-6 w-full p-4 bg-gray-100 rounded-lg text-center">
          <h3 className="text-md font-medium text-gray-700">Connected Account</h3>
          <p className="text-gray-600">{activeAccount.name}</p>
          <p className="text-gray-600">
            {activeAccount.address && activeAccount.address.slice(0, 6)}...${activeAccount.address.slice(-4)}
          </p>
        </div>
      )}
    </div>
  );
};

export default PolkadotWalletSelector;
```

This component provides a simple UI for users to connect and disconnect their Polkadot wallet.

It uses the `useAccountsContext` hook to access the active account, any errors, and the functions to connect or disconnect the wallet.

If the user is not connected, the component displays a "Connect" button, which triggers the `connectWallet` function when clicked. If the user is already connected, it shows their account name (or address if no name is available) and a "Disconnect" button that triggers the `disconnectWallet` function.

If there's an error during the connection process, the component displays an error message. The design is minimal but functional, ensuring a smooth user experience.

## 3. Integrating the Wallet Selector into Your App

To make the wallet connection available globally, wrap your app with the AccountsProvider. Update `layout.tsx` to include the context provider:

```ts
"use client";

import "./globals.css";
import { AccountsProvider } from "@/context/AccountsContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AccountsProvider>
          {children}
        </AccountsProvider>
      </body>
    </html>
  );
}
```

Include the `PolkadotWalletSelector` component on your homepage. Update `app/page.tsx`:

```tsx
'use client';

import PolkadotWalletSelector from '@/components/PolkadotWalletSelector';

export default function Home() {
  return (
    <div className="flex flex-wrap justify-center items-start gap-6 p-6 bg-gray-50 min-h-screen">
      <PolkadotWalletSelector />
    </div>
  );
}
```

## 🧪 Testing Your Component

You should now see your wallet selector:

- Connect your Polkadot wallet (e.g., Polkadot.js extension).
- Select your desired account.
- Confirm that the active account selection persists and functions correctly.

### [➡️ Next lesson: Connecting to Unique SDK](./lesson-4-sdk.md)
