# 🖥️ Lesson 5: Building a Wallet Selector Component

In this lesson, you'll create a user-friendly wallet selector component. This component will allow users to connect their Polkadot-compatible wallets, select an active account, and easily manage connections within your Next.js application.

## 1. Creating the Wallet Selector Component

Create a new file at `components/WalletSelector.tsx`

Paste the following code snippet into your newly created component file:

```ts
'use client';

import { useMemo, useCallback } from "react";
import { useAccountsContext } from "../context/AccountsContext";

const WalletSelector: React.FC = () => {
  const {
    wallets,
    accounts,
    activeAccount,
    connectWallet,
    setActiveAccount,
    disconnectWallet,
    error,
  } = useAccountsContext();

  const handleConnect = useCallback(
    (walletName: string) => {
      connectWallet(walletName);
    },
    [connectWallet]
  );

  const accountsArray = useMemo(() => [...accounts.values()], [accounts]);

  return (
    <div className="p-3 max-w-sm mx-auto bg-gray-50 border border-gray-300 rounded">
      <h2 className="text-base font-medium text-gray-800 mb-2">Connect Wallet</h2>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="space-y-1">
        {wallets.map(({ name, prettyName }) => (
          <button
            key={name}
            onClick={() => handleConnect(name)}
            className="w-full px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            {`Connect ${prettyName}`}
          </button>
        ))}
      </div>

      {accountsArray.length > 0 && (
        <div className="mt-2">
          <h3 className="text-sm text-gray-700">Active Account:</h3>
          <div className="mt-1 space-y-1">
            {accountsArray.map((account) => (
              <label key={account.address} className="flex items-center gap-2 text-gray-800">
                <input
                  type="radio"
                  checked={activeAccount?.address === account.address}
                  onChange={() => setActiveAccount(account)}
                />
                <span className="text-sm">{account.name || account.address}</span>
              </label>
            ))}
          </div>
          <button
            onClick={disconnectWallet}
            className="mt-3 w-full px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletSelector;
```

### 📚 Explanation of the Wallet Selector Component

Your component accomplishes three primary tasks:

- Wallet Detection & Connection: Lists available Polkadot-compatible wallets detected by your browser extension. Users can connect to a wallet by clicking a button.
- Account Selection: Once a wallet is connected, all available accounts are listed. Users can choose an active account by selecting it from radio buttons.
- Disconnecting: Users can easily disconnect, clearing the active wallet connection and account information.

The component automatically manages errors, such as wallet-connection issues, and clearly informs the user.

## 2. Integrating the Wallet Selector into Your Application


Now, include this component in your homepage to verify the connection and account selection functionality.

Edit your homepage at `app/page.tsx`

Replace it with this code snippet:

```ts
'use client';

import WalletSelector from '../components/WalletSelector';

export default function Home() {
  return (
    <div>
      <h1>NFT Minting on Asset Hub</h1>
      <WalletSelector />
    </div>
  );
}
```

## 🧪 Testing Your Component

You should now see your wallet selector:

- Connect your Polkadot wallet (e.g., Polkadot.js extension).
- Select your desired account.
- Confirm that the active account selection persists and functions correctly.
