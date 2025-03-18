# 📦 Lesson 6: Integrating Pinata for IPFS Storage

In this lesson, you'll integrate Pinata into your Next.js application for handling IPFS file uploads and metadata storage. You'll set up a Pinata context, API routes, and a server-side utility for managing interactions with Pinata.

## 1. What is Pinata & Why Use It?

Pinata is a service that makes IPFS (InterPlanetary File System) more accessible. It allows us to:

- Store images & metadata for NFTs.
- Retrieve content efficiently through a dedicated IPFS gateway.
- Manage files securely without running our own IPFS node.

## 2. Setting Up API Routes for File & Metadata Uploads

Since Pinata requires authentication, all uploads will be routed through Next.js API endpoints instead of being handled directly on the frontend.

### Creating a Pinata Utility for Server-Side Uploads

Instead of manually configuring Pinata in every API route, we create a utility function to initialize the SDK.

Create a helper file: `lib/pinata.ts`.

Paste this code:

```ts
"use server";

import { PinataSDK } from "pinata-web3";

export async function getPinataInstance() {
  if (!process.env.PINATA_JWT || !process.env.NEXT_PUBLIC_PINATA_GATEWAY) {
    throw new Error("❌ Pinata environment variables are missing!");
  }

  return new PinataSDK({
    pinataJwt: process.env.PINATA_JWT!,
    pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY!,
  });
}
```

This function: ✅ Loads your Pinata credentials from environment variables.

✅ Initializes Pinata SDK so we can use it in API 
routes.

✅ Prevents API key leaks by keeping it server-side.



### Image Upload API Route

This route lets users upload image files to Pinata and returns the IPFS URL.

Create a new file: `app/api/image/route.ts`.

Paste the following code:

```ts
import { getPinataInstance } from "@/lib/pinata";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const pinata = await getPinataInstance();
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files are allowed" }, { status: 415 });

    const uploadData = await pinata.upload.file(file);
    const url = await pinata.gateways.convert(uploadData.IpfsHash);
    
    return NextResponse.json({ url }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

<!-- TODO briefly explain -->

### Metadata Upload API Route

This route lets users upload metadata JSON (name, description, image link) to Pinata.

Create a new file: `app/api/metadata/route.ts`.

Paste this code:

```ts
import { getPinataInstance } from "@/lib/pinata";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const pinata = await getPinataInstance();
    const metadata = await request.json();

    if (!metadata.name || !metadata.description || !metadata.image) {
      return NextResponse.json({ error: "Missing required metadata fields" }, { status: 400 });
    }
    
    const uploadData = await pinata.upload.json(metadata);
    const url = await pinata.gateways.convert(uploadData.IpfsHash);

    return NextResponse.json({ url }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

<!-- TODO: come up with a better title: -->
## 3. Describe metadata

<!-- TODO: fix english and explain better -->

We will use OpenSea compatible metadata format described:

- here for NFTs: https://docs.opensea.io/docs/metadata-standards
- here for collections: https://docs.opensea.io/docs/contract-level-metadata

Let's create interfaces which define our feauture metadata. Create `lib/types.ts` file:

```ts
// This simplified metadata will be used for collections
export interface BasicMetadata {
  name: string;
  description: string;
  image: string;
}

// For NFTs we will use an extra array with token attributes
export interface NFTMetadata extends BasicMetadata {
  attributes: [
    {
      trait_type: string;
      value: string;
    }
  ];
}
```

## 4. Setting Up the Pinata Context

We'll create a Pinata Context to centralize IPFS operations, making it easier to upload files, store metadata, and fetch NFT details.

Create a new file: `context/PinataContext.tsx`.

Paste this code inside:

```ts
'use client';

import { BasicMetadata, NFTMetadata } from "@/lib/types";
import React, { createContext, useCallback, useContext, useMemo } from "react";

interface PinataContextType {
  uploadImage: (file: File) => Promise<string | null>;
  uploadMetadata: (metadata: BasicMetadata) => Promise<string | null>;
  fetchCollectionMetadata: (url: string) => Promise<BasicMetadata | null>;
  fetchNFTMetadata: (url: string) => Promise<NFTMetadata | null>;
}

const PinataContext = createContext<PinataContextType | undefined>(undefined);

export const PinataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    try {
      const data = new FormData();
      data.set("file", file);

      const uploadRequest = await fetch("/api/image", {
        method: "POST",
        body: data,
      });

      const result = await uploadRequest.json();
      return result.url;
    } catch (error) {
      console.error("❌ File Upload Failed:", error);
      return null;
    }
  }, []);

  const uploadMetadata = useCallback(async (metadata: BasicMetadata): Promise<string | null> => {
    try {
      const metadataRequest = await fetch("/api/metadata", {
        method: "POST",
        body: JSON.stringify(metadata),
        headers: { "Content-Type": "application/json" },
      });

      const result = await metadataRequest.json();
      return result.url;
    } catch (error) {
      console.error("❌ Metadata Upload Failed:", error);
      return null;
    }
  }, []);

  const fetchMetadata = useCallback(async <T extends BasicMetadata>(url: string): Promise<T | null> => {
    try {
      console.log("FETCHING", url);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch metadata");

      return await response.json();
    } catch (error) {
      console.error("❌ Error fetching metadata:", error);
      return null;
    }
  }, []);

  const fetchCollectionMetadata = useCallback((url: string) => fetchMetadata<BasicMetadata>(url), [fetchMetadata]);
  const fetchNFTMetadata = useCallback((url: string) => fetchMetadata<NFTMetadata>(url), [fetchMetadata]);

  const contextValue = useMemo(() => ({
    uploadImage,
    uploadMetadata,
    fetchCollectionMetadata,
    fetchNFTMetadata,
  }), [uploadImage, uploadMetadata, fetchCollectionMetadata, fetchNFTMetadata]);

  return <PinataContext.Provider value={contextValue}>{children}</PinataContext.Provider>;
};

export const usePinata = (): PinataContextType => {
  return useContext(PinataContext) || {
    uploadImage: async () => null,
    uploadMetadata: async () => null,
    fetchCollectionMetadata: async () => null,
    fetchNFTMetadata: async () => null,
  };
};
```

<!-- TODO briefly explain -->

## 5. Integrating Pinata Provider

Now, wrap your app in PinataProvider so all components can access the upload functions.

Edit `app/layout.tsx`:

```ts
"use client";

import { AccountsProvider } from "@/context/AccountsContext";
import { PinataProvider } from "@/context/PinataContext";
import { UniqueSDKProvider } from "@/context/UniqueSDKContext";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PinataProvider>
          <AccountsProvider>
            <UniqueSDKProvider>{children}</UniqueSDKProvider>
          </AccountsProvider>
        </PinataProvider>
      </body>
    </html>
  );
}
```

## 6. Configure Next.js

<!-- TODO: explain better -->

By default next.js cannot work with external urls because ...

Configure next to work with pinata, edit `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.mypinata.cloud",
      },
    ],
  },
};

export default nextConfig;
```


## ✅ Final Overview

What We Built:

- API routes for file & metadata uploads.
- Pinata utility for secure authentication.
- React Context to make uploads easy to use.

