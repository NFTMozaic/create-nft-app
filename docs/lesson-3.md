# Lesson 3: Connecting to Asset Hub Using the Unique SDK

In this lesson, you'll set up the Unique SDK within your Next.js project to interact seamlessly with Asset Hub. You'll manage the SDK's state globally in your React application by using context, allowing easy access across your components.

## Intro to Unique SDK

Unique SDK provides a convenient and lightweight way to interact with Substrate-based blockchains. It consists of two components:

- HTTP proxy server: establishes a connection with the blockchain node and provides an HTTP interface. To use an HTTP proxy, you can use [publicly available endpoints](https://docs.unique.network/reference/sdk-endpoints.html) or run your local version.
- Thin client: you can send requests to an HTTP proxy directly using your favorite HTTP framework. However, the easiest way is to use the `@unique-nft/sdk` package, which provides an easy-to-use way to send requests to an HTTP proxy server using TypeScript. We already installed this package in the previous step.

## Creating the SDK Context

To manage interactions with Asset Hub NFTs efficiently, it's best practice to use React Context. This allows you to access the SDK instance globally without repeatedly creating new connections.

Inside your Next.js project (nft-asset-hub), create a new directory `context`. Then, add a file named `UniqueSDKContext.tsx`:

```sh
nft-asset-hub
├── context
│   └── UniqueSDKContext.tsx
```

Paste the following initial code snippet into your newly created context file:

```ts
'use client';

import { AssetHub } from '@unique-nft/sdk';
import { createContext, useContext, useMemo, useState } from 'react';

type SdkContextType = {
  sdk: ReturnType<typeof AssetHub>;
};

const UniqueSDKContext = createContext<SdkContextType | undefined>(undefined);

export const UniqueSDKProvider = ({ children }: { children: React.ReactNode }) => {
  const [sdk] = useState(() =>
    AssetHub({ baseUrl: process.env.NEXT_PUBLIC_REST_URL! })
  );

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
    throw new Error('useSdkContext must be used within UniqueSDKProvider');
  return context;
};
```

### Understanding Your Code

1. React Context (`UniqueSDKContext`):
Holds a global instance of the Unique SDK to easily manage Asset Hub connections.
2. AssetHub Initialization:
The SDK initializes using the public REST URL (`NEXT_PUBLIC_REST_URL`) configured earlier in your `.env` file.
3. `useSdkContext` hook:
Provides easy access to the SDK from anywhere within your React components.

## Integrating the Provider in Your App

Next, integrate this context provider into your app's layout file so the SDK instance is accessible throughout your entire application.

Open `app/layout.tsx`, and update it as follows:

```ts
'use client';

import { UniqueSDKProvider } from '../context/UniqueSDKContext';
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UniqueSDKProvider>
          {children}
        </UniqueSDKProvider>
      </body>
    </html>
  );
}
```

## Quick Check
Let's quickly verify your SDK setup by creating a simple component:

Create a file `components/SdkStatus.tsx`:

```ts
'use client';

import { useSdkContext } from '../context/UniqueSDKContext';

export default function SdkStatus() {
  const { sdk } = useSdkContext();

  return (
    <div>
      <h2>Unique SDK Status:</h2>
      <pre>{JSON.stringify(sdk.options, null, 2)}</pre>
    </div>
  );
}
```

Include this component temporarily in your homepage (`app/page.tsx`):

```ts
'use client';

import SdkStatus from '../components/SdkStatus';

export default function Home() {
  return (
    <div>
      <h1>NFT Minting on Asset Hub</h1>
      <SdkStatus />
    </div>
  );
}
```

Now, run your app:

```sh
npm run dev
```

Visit http://localhost:3000. You should see a JSON display showing your SDK's configured options, indicating a successful connection.

## 🎯 Checkpoint:
You've now successfully connected your Next.js app to Asset Hub using the Unique SDK, and you've set up a reusable and scalable context to manage this connection.

In the next lesson, you'll integrate Polkadot-compatible wallets into your app, handling account connections smoothly.
