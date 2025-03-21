# 📦 Using Pinata

In this lesson, you'll learn how to:

Create a Pinata account
Set up the SDK and environment variables
Integrate Pinata into your Next.js app for IPFS uploads

## Why Pinata?

When building web3 applications, off-chain metadata (like images or NFT details) must be stored in a decentralized way. That's where IPFS comes in.

Pinata is a developer-friendly IPFS service that allows you to:

- Store images and metadata for NFTs
- Retrieve content via a dedicated gateway
- Manage files without running your own IPFS node

👉 Sign up at [pinata.cloud](https://pinata.cloud) (free tier available), then head to the [API Keys section](https://app.pinata.cloud/developers/api-keys) to generate an API key.

Copy your JWT token and gateway URL—you'll need them in the next step.


## Installing the Pinata SDK

Inside your Next.js project, install the SDK:

```sh
npm install pinata-web3
```

## Environment Variables Setup

Create a `.env` file in the root of your project (if it does not exist) and add the following:

```
...
NEXT_PUBLIC_PINATA_GATEWAY=your_pinata_gateway_here
PINATA_JWT=your_pinata_jwt_here
```

Replace placeholders with actual values. Double check your `.env` is added to `.gitignore`.

> [!NOTE]
> The `NEXT_PUBLIC_` prefix is only used for variables accessed on the client. The `PINATA_JWT` remains server-side only to avoid exposing secrets.


# Integrating Pinata in Next.js

Now, let's build API routes and utilities to interact with Pinata securely from your app.

## Step 1: Create a Pinata Utility

To avoid duplicating code, create a helper to initialize the SDK using your credentials.

Create a new file: `lib/pinata.ts`

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

This function: 
- ✅ Loads your Pinata credentials from environment variables.
- ✅ Initializes Pinata SDK so we can use it in API 
routes.
- ✅ Prevents API key leaks by keeping it server-side.

### Step 2: Configure Next.js for Pinata Gateway

By default, Next.js blocks image domains not explicitly allowed. To display images from your Pinata gateway, update `next.config.ts`:

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

### Step 3: Image Upload API Route

Create an API route to handle image uploads through Pinata.

Create: `app/api/image/route.ts`

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


### Step 4: Metadata Upload API Route

This route uploads NFT metadata in JSON format to Pinata.

Create: `app/api/metadata/route.ts`

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

## Step 5: Define NFT Metadata Types

We'll use OpenSea-compatible metadata formats. Reference:

- NFT metadata: https://docs.opensea.io/docs/metadata-standards
- Collection metadata: https://docs.opensea.io/docs/contract-level-metadata

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

## Step 6: Example — Upload and Display NFTs

To test the integration, create simple components to upload images and metadata, then display the uploaded NFT using the returned IPFS URL.

Here's a minimal example to get you started:

`ImageUpload.tsx`

```ts
"use client";

import { useState } from "react";

export default function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    onUpload(data.url);
    setLoading(false);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} />
      {loading && <p>Uploading...</p>}
    </div>
  );
}
```

## 🚀 Now You Try

Use this example as a reference and expand it:

- Add inputs for dynamic name/description
- Display NFTs images and attributes in the UI
- Integrate with a minting flow

### [➡️ Extra: challenges](./lesson-extra-1.md)
