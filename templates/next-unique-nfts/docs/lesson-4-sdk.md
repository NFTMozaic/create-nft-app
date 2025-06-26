# Lesson 4: Connecting to Asset Hub Using the Unique SDK

In this lesson, you'll set up the Unique SDK within your Next.js project to interact seamlessly with Asset Hub. You'll manage the SDK's state globally in your React application by using context, allowing easy access across your components.

## Intro to Unique SDK

Unique SDK provides a convenient and lightweight way to interact with Substrate-based blockchains. It consists of two components:

- HTTP proxy server: establishes a connection with the blockchain node and provides an HTTP interface. To use an HTTP proxy, you can use [publicly available endpoints](https://docs.unique.network/reference/sdk-endpoints.html) or run your local version.
- Thin client: you can send requests to an HTTP proxy directly using your favorite HTTP framework. However, the easiest way is to use the `@unique-nft/sdk` package, which provides an easy-to-use way to send requests to an HTTP proxy server using TypeScript. We already installed this package in the previous step.

## 1. Creating the SDK Context

To manage interactions with Asset Hub NFTs efficiently, it's best practice to use React Context. This allows you to access the SDK instance globally without repeatedly creating new connections.

Add a file named `context/UniqueSDKContext.tsx`:

```sh
nft-asset-hub
├── context
│   └── UniqueSDKContext.tsx
```

Paste the following initial code snippet into your newly created context file:

```ts
"use client";

import { AssetHub, AssetHubInstance } from "@unique-nft/sdk";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAccountsContext } from "./AccountsContext";

type SdkContextType = {
  sdk: AssetHubInstance | null;
};

const UniqueSDKContext = createContext<SdkContextType | undefined>(undefined);

export const UniqueSDKProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sdk, setSdk] = useState<AssetHubInstance | null>(null);
  const { activeAccount } = useAccountsContext();

  useEffect(() => {
    const sdk = AssetHub({
      baseUrl: process.env.NEXT_PUBLIC_REST_URL!,
      account: activeAccount ? activeAccount : undefined,
    });
    setSdk(sdk);
  }, [activeAccount]);

  const value = useMemo(() => ({ sdk }), [sdk]);

  return (
    <UniqueSDKContext.Provider value={value}>
      {children}
    </UniqueSDKContext.Provider>
  );
};

export const useSdkContext = () => {
  const context = useContext(UniqueSDKContext);
  if (!context)
    throw new Error("useSdkContext must be used within UniqueSDKProvider");
  return context;
};
```

The `UniqueSDKContext` is a React context that manages a global instance of the Unique SDK, allowing the application to interact with Asset Hub without repeatedly initializing new SDK instances.

The context maintains a single piece of state: `sdk`, which stores the instance of `AssetHubInstance`. When the component mounts or when the `activeAccount` changes, it creates a new SDK instance, passing in the REST API URL and the currently active account. This ensures that the SDK is always configured with the correct user account.

A custom hook, `useSdkContext`, is provided to allow components to easily access the SDK instance. If a component tries to use this hook outside of the `UniqueSDKProvider`, an error is thrown.

## 2. Integrating the Provider in Your App

Next, integrate this context provider into your app's layout file so the SDK instance is accessible throughout your entire application.

Open `app/layout.tsx`, and update it as follows:

```ts
'use client';

import { AccountsProvider } from "@/context/AccountsContext";
import { UniqueSDKProvider } from "@/context/UniqueSDKContext";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AccountsProvider>
          <UniqueSDKProvider>
            {children}
          </UniqueSDKProvider>
        </AccountsProvider>
      </body>
    </html>
  );
}
```

## 🎯 Checkpoint:

You've now successfully connected your Next.js app to Asset Hub using the Unique SDK, and you've set up a reusable and scalable context to manage this connection.

In the next lesson, you'll integrate Polkadot-compatible wallets into your app, handling account connections smoothly.

### [➡️ Next lesson: Creating an NFT Collection](./lesson-5-collections.md)
