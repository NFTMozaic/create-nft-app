# 📦 Lesson 2: Installing Libraries and Configuring Environment Variables

In this lesson, you'll install essential libraries and configure environment variables to securely integrate your Next.js app with Asset Hub NFTs.

## 1. Install Required Libraries

In your Next.js project's root directory (nft-asset-hub), run the following command:

```sh
npm install @unique-nft/sdk @unique-nft/utils
```

Here's a brief overview of each package:

- `@unique-nft/sdk`: Enables interaction with Asset Hub NFT pallets (minting, querying).
- `@unique-nft/utils` Provides utility functions for managing Polkadot wallets and establishing connections.

## 2. Set Up Environment Variables

In the root of your project (nft-asset-hub), create a new file named `.env` and add the following variables:

```
NEXT_PUBLIC_REST_URL=https://rest.unique.network/v2/paseo-asset-hub
```

> [!NOTE]
> We are using public SDK endpoint for the Unique SDK connection (`NEXT_PUBLIC_REST_URL`). The full list of available endpoints you will find in the [official documentation](https://docs.unique.network/reference/sdk-endpoints.html)

## 3. Obtaining Test Tokens for Asset Hub

Before proceeding, ensure you have test tokens available for transactions. Visit the [Polkadot Faucet](https://faucet.polkadot.io/?parachain=1000) and request tokens for the wallet address you'll use later in this course.

### [➡️ Next lesson: Connecting Polkadot Wallets](./lesson-3-accounts.md)
