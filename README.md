# Polkadot NFTMozaic Consensus Hong Kong 2025 Challenge

Welcome to the Polkadot NFTMozaic bounty challenge. This challenge consists of a core challenge with a dedicated bounty split between a winner and a runner-up according to the prize distribution listed below and several additional bonus challenges, each providing additional prize allotments if successfully accomplished. The bonus prizes are available only to the winner and runner-up.

- [Polkadot NFTMozaic Consensus Hong Kong 2025 Challenge](#polkadot-nftmozaic-consensus-hong-kong-2025-challenge)
  - [Task challenge overview](#task-challenge-overview)
  - [Task components](#task-components)
    - [Core challenge](#core-challenge)
    - [Optional challenges](#optional-challenges)
- [Judgement criteria](#judgement-criteria)
- [The bounty awards structure](#the-bounty-awards-structure)
- [The Asset Hub \& Next.js template](#the-asset-hub--nextjs-template)
  - [TL;DR](#tldr)
  - [Intro](#intro)
  - [Main components overview](#main-components-overview)
    - [1. The Asset Hub node](#1-the-asset-hub-node)
    - [2. Unique SDK](#2-unique-sdk)
    - [Running local Asset Hub node \& SDK](#running-local-asset-hub-node--sdk)
    - [Running Next.js application](#running-nextjs-application)
  - [Polkadot NFTs and metadata 101](#polkadot-nfts-and-metadata-101)
    - [Creating collections and NFTs](#creating-collections-and-nfts)
    - [Metadata](#metadata)
  - [Wrapping Up](#wrapping-up)
    - [Next Steps](#next-steps)

## Task challenge overview

Your challenge is to create a simple UI that provides a means to create an NFT asset (collection, token) on the Polkadot Asset Hub. The challenge consists of a core component and two optional challenges.

## Task components 

### Core challenge

This core challenge is to create a simple UI that allows a user to define a collection, mint one or more tokens of that collection and list and display the minted tokens on a page.

### Optional challenges

1. Using the [Opensea metadata format](https://docs.opensea.io/docs/metadata-standards) supported by the Asset Hub NFTs pallet, provide the user an opportunity to add an audio file and a description as token's extended digital assets in addition to the base image. Provide a way to display these additional assets in the browser.

2. Provide a 'Sell' button to promote a token into a sellable item and a 'Buy' button that allows a user logged in via a Polkadot wallet to purchase the token.

# Judgement criteria

The **presentable result** of your efforts should be a working in-browser UI (dApp) that implements minting of an NFT of new or existing collection. This implies an availability of both a collection and token creation fields and buttons in the UI as well as the additional elements that might be needed as a part of the optional challenges if you choose to implement them.

The **goal** of your challenge is, however, more relevant for the challenge evaluation. To accomplish the goal you should provide clean, practical to implement, easy to read and replicate code that showcases how you implemented your solution. 

For the frontend you are free to choose any framework you are comfortable with. You can use, vanilla JS/TS, React, Angular, Vue.js, Svelte, Solid.js, qwik, Astro. No restrictions.

For the backend you are free to chose any of the SDKs at your disposal which you might deem practical. We will be providing you with a tutorial below on how to accomplish this challenge with the Unique Network SDK which facilitates Asset Hub utilities in addition to the Unique's own parachain-specific functions. This approach provides, possibly the fastest time-to-completion cycle development environment for the task you are given and is also the one in which we can provide the most detailed support. We are providing comprehensive instructions below with everything you need to complete the task. The other most practical options include PolkadotJS and PAPI. We do not have a dedicated environment setup available for these options and can give limited support and assistance for them but you are free to choose them for your task.

We want you to consider this challenge with thoughts of leaving behind instructions for a whole generation of coders who will ask themselves how to do exactly what you are trying to accomplish in this challenge. We intend to showcase your solution in a future NFTs on Asset Hub tutorials section. Give us your best effort for posterity!

Your solution will be judged on two points:

- whether or not it has successfully accomplished the set task.
- how presentable is your code as a tutorial for a developer looking to replicate your efforts.

# The bounty awards structure

- A winning solution and a runner-up will be chosen based on the judgment criteria.
- A winning solution will receive a bounty of $1000 worth of stablecoins for successfully completing the core task.
- The runner-up will receive a bounty of $500 worth of stablecoins for successfully completing the core task..
- An additional bounty will be added to both the winner's and the runner's-up core bounty of they choose to pursue and succeed in successfully completing each optional challenge.
- For the FIRST optional challenge, $200 worth of stablecoins will be added to the award amount for its successful completion.
- For the SECOND optional challenge, $300 worth of stablecoins will be added to the award amount for its successful completion.

# The Asset Hub & Next.js template

Asset Hub is a specialized parachain within the Polkadot ecosystem designed for managing and transferring digital assets, including NFTs, without requiring smart contracts. It leverages Substrate's built-in `nfts pallet` to facilitate efficient and scalable NFT creation and management.

- [TL;DR](#tldr)
- [Intro](#intro)
- [Main components overview](#main-components-overview)
  - [1. The Asset Hub node](#1-the-asset-hub-node)
  - [2. Unique SDK](#2-unique-sdk)
  - [Running local Asset Hub node \& SDK](#running-local-asset-hub-node--sdk)
  - [Running Next.js application](#running-nextjs-application)
- [Polkadot NFTs and metadata 101](#polkadot-nfts-and-metadata-101)
  - [Creating collections and NFTs](#creating-collections-and-nfts)
  - [Metadata](#metadata)
- [Wrapping Up](#wrapping-up)
  - [Next Steps](#next-steps)

## TL;DR

Ensure you have the following installed on your computer:

- Node.js (latest LTS version recommended)
- npm or yarn
- Docker and Docker Compose
- Git
- A Substrate-compatible wallet (e.g., Polkadot.js extension)

Then:

1. Create a `.env` file using `.env.example` 
2. Install dependencies: `npm install`
3. Run the local blockchain & SDK

```sh
docker compose up
```

Test your local environment:
- Local blockchain: https://polkadot.js.org/apps/?rpc=ws://localhost:8002#/accounts
- SDK server: http://localhost:3333/documentation/static/index.html

3. Learn how to mint NFTs with [tests](./src/tests/sdk.test.ts)

4. Start the Next.js application

```sh
npm run dev
```

App runs on http://localhost:3000.

---
**Alternatively, watch [this video](https://youtu.be/Mjl5jRoCIYs) on YouTube:**

[![Watch the video](https://img.youtube.com/vi/Mjl5jRoCIYs/maxresdefault.jpg)](https://youtu.be/Mjl5jRoCIYs)

## Intro

This template aims to bootstrap an NFT application on `Asset Hub by Polkadot`. It utilizes [`@unique-nft/sdk`](https://www.npmjs.com/package/@unique-nft/sdk) for seamless blockchain interactions.

- If you need a quick start guide on how to build on Polkadot, continue reading this document. 
- If you want to understand how the SDK works, proceed to the [official documentation](https://docs.unique.network/).

## Main components overview

### 1. The Asset Hub node

There are plenty of publicly available nodes you can use to send transactions. You may find several options on [`polkadot.js.org/apps`](http://polkadot.js.org/apps). Here are some of them:

- Polkadot Asset Hub: wss://polkadot-asset-hub-rpc.polkadot.io
- Kusama Asset Hub: wss://kusama-asset-hub-rpc.polkadot.io
- Paseo testnet: wss://asset-hub-paseo-rpc.dwellir.com

> [!TIP]
> You can receive testnet tokens for free at https://faucet.polkadot.io/

For this workshop, we will use our local testnet version using the Acala Chopsticks framework, which creates a local fork of a real network. To understand how Chopsticks works, you may proceed to the [official GitHub repo](https://github.com/AcalaNetwork/chopsticks).

We have already crafted all the configurations for this workshop for your local testnet. In a few moments, we will launch and test it along with the SDK server.

### 2. Unique SDK

<!-- TODO: why use SDK -->

Unique SDK provides a convenient and lightweight way to interact with Substrate-based blockchains. It consists of two components:

- HTTP proxy server: establishes a connection with the blockchain node and provides an HTTP interface. To use an HTTP proxy, you can use [publicly available endpoints](https://docs.unique.network/reference/sdk-endpoints.html) or run your local version. For this workshop, we prepared a docker configuration that provides your local proxy server connected to [the local blockchain](#the-asset-hub-node).
- Thin client: you can send requests to an HTTP proxy directly using your favorite HTTP framework. However, the easiest way is to use the `@unique-nft/sdk` package, which provides an easy-to-use way to send requests to an HTTP proxy server using TypeScript.

### Running local Asset Hub node & SDK

We'll launch a local SDK against Kusama fork using Acala Chopsticks.

**First**, let's check the [docker-compose.yml](./docker-compose.yml) file. It comprises two services: `assethub-chopsticks` for the local node and `substrate-proxy` for the SDK. Take a note:

- The local blockchain will be launched on port `8002`
- The SDK will be launched on port `3333`
- The SDK will be launched against the local blockchain: `CHAIN=ws://assethub-chopsticks:8002`.

**Second**, let's check the [Chopsticks configuration](./kusama-assethub.yml). Take a note:

- the fork will be created targeting the Kusama network endpoint: `endpoint: wss://kusama-asset-hub-rpc.polkadot.io`
- Your blockchain will have accounts with `free balances`. You may use these accounts for testing purposes or add your account to the list.

**Finally**, run your environment:

```sh
docker compose up
```

- The network will be launched on port `8002` (`ws://localhost:8002`). You may want to check your accounts and balances on the [polkadot apps](https://polkadot.js.org/apps/?rpc=ws://localhost:8002#/accounts). Make some transfers to make sure everything works
- The SDK will be launched at port `3333` (`http://localhost:3333`). Check the raw HTTP methods at [http://localhost:3333/documentation/static/index.html](http://localhost:3333/documentation/static/index.html). You can query some account's balance to make sure everything is configured correctly.

That is it! Your local development environment is ready to go!

Now, let's learn how to use it on the frontend.

### Running Next.js application

Create the `.env` file in the root directory using [`.env.example`](./.env.example) as a template. At this point, the only significant variable is `NEXT_PUBLIC_REST_URL`.

```
NEXT_PUBLIC_REST_URL=http://localhost:3333
```

This variable specifies the URL of the SDK server. Our local SDK should work on port `3333`. You can recheck it by executing the `docker ps` command.

Now run your Next.js application:

```sh
npm run dev
```

Your application will normally run on port `3000`. Go to `http://localhost:3000` and check that your application is running. On the screen, you should see the Polkadot Wallet Selector component.

<img src="./images/wallets.png">

If you don't have any Substrate wallets listed – install any of them and create an account. Then connect your wallet to the app and give it a try:

1. Make sure your balance is more than 0. If it is zero – go to the [Polkadot{.js} portal](https://polkadot.js.org/apps/?rpc=ws://localhost:8002#/accounts) and transfer some KSM tokens from one of the predefined accounts (Alice, Bob...) to your address. 
2. Return to the application and execute a transfer from your account to any other one using the built-in form. If the transaction succeeds, you will see the alert.

> [!NOTE]
> - Review [UniqueSDKProvider.tsx](./src/app/lib/sdk/UniqueSDKProvider.tsx) to understand how to connect SDK
> - Review [AccountsProvider.tsx](./src/app/lib/wallets/AccountsProvider.tsx) to learn how to connect Polkadot wallets

Now, you have everything you need. Feel free to use this template as is or as an example for your favorite framework. If you want to learn more about Polkadot NFTs, continue reading. Otherwise, happy coding!

## Polkadot NFTs and metadata 101

You don't have to deploy smart contracts to create NFTs in the Polkadot ecosystem. The `Asset Hub` chain is a special system L2 that uses Substrate's `nfts pallet`, optimized for NFT use cases.

To learn how easy it is to create an NFT collection, we will discover this project's [tests](./src/tests/sdk.test.ts).

But first, let's configure our environment variables. At this point, you should have the `.env` file created. If not – create one using `.env.example` as a template. Set the following environment variables:

- `PINATA_JWT` and `PINATA_GATEWAY`: there are two types of metadata in `nfts pallet` – on-chain and off-chain. We must use third-party storage, typically IPFS, to store and manage off-chain metadata. Pinata is one of the leading providers of the IPFS service. Get your credentials for free on the [Pinata Cloud](https://pinata.cloud/). After registration, go to the [API keys section](https://app.pinata.cloud/developers/api-keys) and generate your API key. Save the JWT token and your gateway to the relevant environment variables.
- `MNEMONIC`: This variable is only used for tests, and you can leave it `//Alice`, a special alias for development accounts. This account already has some predefined balance specified in [kusama-assethub.yml](./kusama-assethub.yml). You can also set your mnemonic seed phrase instead. Use [`polkadot{.js}`](https://polkadot.js.org/extension/) or any other wallet to generate a 12-word mnemonic secret phrase. Make sure this account has a non-zero balance.

Now run the tests:

```sh
npm run test
```

If everything was set correctly, you will see in your terminal:

```sh
 Test Files  1 passed (1)
      Tests  3 passed (3)
```

> [!TIP]
> Using VS Code, you may debug tests with breakpoints using [`vitest.explorer`](https://marketplace.visualstudio.com/items?itemName=vitest.explorer) extension. This could be an easy way to learn about Asset Hub NFTs and SDK API.

### Creating collections and NFTs

> [!NOTE]
> The following guide explains the basics of NFTs and how to craft them with Unique SDK. You can also learn this by reviewing tests. If you feel comfortable with this approach – you will find them at [src/tests/sdk.test.ts](./src/tests/sdk.test.ts)

To create your NFT collection on Asset Hub, you only need one call to RPC. Here is how to do this with Unique SDK.

```ts
import { AssetHub } from "@unique-nft/sdk";
import { Sr25519Account } from "@unique-nft/sr25519";

// First, initialize an account that will be used to sign transactions
const account = Sr25519Account.fromUri(yourSubstratePrivateKey);

// Initialize the SDK
const ah = AssetHub({
  // We use the local version of the SDK launched in previous steps
  baseUrl: "http://localhost:3333",
  // The initialized account will be used as a default for signing transactions
  // It is optional and can be overwritten for each transaction
  account,
});

// Create a collection:
const {result} = await ah.nftsPallet.collection.create({
  // Some optional configurations, such as max supply, can be set:
  // collectionConfig: ...,
});

// Collections on Asset Hub are not contracts. 
// The unique identifier of the collection is collectionId (number)
const collectionId = result.collectionId;
```

One more call and you will create the first NFT in the collection:

```ts
// ...
const { result } = await ah.nftsPallet.item.mint({
  // We set the collectionId received during the collection creation
  collectionId,
  itemId: 1,
  mintTo: account.address,
});
```

And that is it! You have created a collection and NFT in just two calls.

However, what makes NFT valuable is the metadata associated with tokens. You now have an empty NFT, so let's learn how to set metadata.

### Metadata

There are two types of metadata in the `nfts pallet` – on-chain and off-chain.

On-chain metadata consists of key/value pairs, making it relatively easy to understand and utilize. Here is how you may set it with SDK:

```ts
await ah.nftsPallet.attributes.set({
  collectionId,
  itemId,
  attribute: { key: "Name", value: "Alex", namespace: "itemOwner" },
});
```

> [!NOTE]
> We set itemOwner for the namespace, which means this attribute will be mutable for the NFT owner. You may learn more about possible attribute namespaces in the [official documentation](https://wiki.polkadot.network/docs/learn-nft-pallets#attributes)

However, when it comes to off-chain metadata, you need to use third-party storage and APIs. The most popular one is IPFS, and Pinata is one of the leading providers of the IPFS service.

At this point, you should already have your Pinata JWT token. If not, get one on [Pinata Cloud](https://pinata.cloud/) and set it along with the gateway to the `.env` file.

Then, install and initialize PinataSDK.

```sh
npm install pinata-web3
```

```ts
import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
  pinataJwt,
  pinataGateway,
});
```

Finally, upload your images and get the IPFS hash of the files.

```ts
const blob = new Blob([
  fs.readFileSync(path.join(process.cwd(), "src/images/token.png")),
]);

const image = new File([blob], "token.png", {
  type: "image/png",
});

const {IpfsHash} = await pinata.upload.file(image);
// or upload many files at the time and receive the folder's hash
await pinata.upload.fileArray([image, ...]);
```

Check your images uploaded successfully – navigate to https://ipfs.io/ipfs/{...your IPFS hash}. Or visit the Pinata account page.

Now, when we upload images, we need to prepare metadata JSON. We will use the metadata standard described in the [OpenSea documentation](https://docs.opensea.io/docs/metadata-standards).

```ts
const collectionMetadata = {
  name: "My NFT",
  description: "This is a unique NFT",
  image: `ipfs://ipfs/${imagesIpfsHash}/cover.png`,
};

const nftMetadata = {
  name: "NFT name",
  description: "NFT description",
  image: `ipfs://ipfs/${imagesIpfsHash}`,
  type: "image/png",
  attributes: [{trait_type: "Age", value: "20"}],
}

const tokenMetadataBlob = new Blob([JSON.stringify(nftMetadata)], {
  type: "application/json",
});
const tokenMetadataJson = new File([tokenMetadataBlob], "token_metadata.json", {
  type: "application/json",
});

const collectionMetadataUpload = await pinata.upload.file(tokenMetadataJson);
const tokenMetadataUpload = await pinata.upload.file(tokenMetadataJson);
// Or upload them with pinata.upload.fileArray to receive an IPFS folder hash.
```

Finally, set the metadata URI for collection or NFTs.

```ts
await ah.nftsPallet.item.setMetadata({
  collectionId,
  itemId,
  data: `ipfs://ipfs/${tokenMetadataUpload.IpfsHash}`,
});

await ah.nftsPallet.collection.setMetadata({
  ...
})
```

## Wrapping Up

Congratulations! You've now set up a local NFT environment on Asset Hub, interacted with the Unique SDK, and explored NFT minting and metadata management.

### Next Steps
- **Deep Dive into Asset Hub NFTs**  
  Read the official Polkadot documentation:  
  [Polkadot NFT Pallet](https://wiki.polkadot.network/docs/learn-nft-pallets)

- **Explore More with Unique SDK**  
  Check out the SDK’s full capabilities:  
  [Unique SDK Documentation](https://docs.unique.network/)

- **Experiment & Build**  
  Use this template as a starting point to create your own NFT applications on Polkadot.

Happy coding!
