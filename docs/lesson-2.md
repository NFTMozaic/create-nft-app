# 📦 Lesson 2: Installing Libraries and Configuring Environment Variables

In this lesson, you'll install essential libraries and configure environment variables to securely integrate your Next.js app with Asset Hub NFTs and Pinata for IPFS file uploads.

## 1. Install Required Libraries

In your Next.js project's root directory (nft-asset-hub), run the following command:

```sh
npm install @unique-nft/sdk @unique-nft/utils pinata-web3 dotenv
```

Here's a clear overview of each package:

- `@unique-nft/sdk`:	Enables interaction with Asset Hub NFT pallets (minting, querying).
- `@unique-nft/utils`	Provides utilities for Polkadot wallet management and connections.
- `pinata-web3`	Simplifies file upload and management on IPFS via Pinata.
- `dotenv`	Securely loads environment variables from `.env` files.

## Creating Pinata account

We must use third-party storage, typically IPFS, to store and manage off-chain metadata. Pinata is one of the leading providers of the IPFS service. Get your credentials for free on the [Pinata Cloud](https://pinata.cloud/). After registration, go to the [API keys section](https://app.pinata.cloud/developers/api-keys) and generate your API key. Save the JWT token and your gateway to the relevant environment variables.

## Set Up Environment Variables

Your Next.js app requires certain sensitive data, such as API endpoints and credentials, to interact securely with Asset Hub and Pinata. For this, you'll use environment variables.

In the root of your project (nft-asset-hub), create a new file named `.env` and add the following content:

```
NEXT_PUBLIC_REST_URL=https://rest.unique.network/v2/paseo-asset-hub
NEXT_PUBLIC_PINATA_GATEWAY=your_pinata_gateway_here
PINATA_JWT=your_pinata_jwt_here
```

> [!NOTE]
> 1. `NEXT_PUBLIC` prefix is not used for PINATA_JWT secret because it will be used on server only. We do not want to expose it on the client.
> 2. We are using public SDK endpoint for the Unique SDK connection (`NEXT_PUBLIC_REST_URL`). The full list of available endpoints you will find in the [official documentation](https://docs.unique.network/reference/sdk-endpoints.html)

Replace placeholders with actual values. Double check your `.env` is added to `.gitignore`.

## Obtaining Test Tokens for Asset Hub

Before moving forward, it's a good idea to have some test tokens ready. Visit the [Polkadot Faucet](https://faucet.polkadot.io/?parachain=1000) and request tokens for the wallet address you'll use later in this course.