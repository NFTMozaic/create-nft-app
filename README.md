# The Asset Hub & Next.js template

<!-- TODO: What you need to have: docker, node.js, knowledge -->

<!-- TODO: what is Asset Hub -->

<!-- TODO: TL;DR -->

# Overview

This template aims to bootstrap an NFT application on `Asset Hub` by Polkadot. It utilizes [`@unique-nft/sdk`](https://www.npmjs.com/package/@unique-nft/sdk) for seamless blockchain interactions.

- If you need a quick start guide on how to build on Polkadot – continue to read this document. 
- If you want to better understand how the SDK works – proceed to the [official documentation](https://docs.unique.network/).

## Main components overview

### 1. The Asset Hub node

There are plenty of publicly available nodes you can use to send transactions. You may find several options on [`polkadot.js.org/apps`](http://polkadot.js.org/apps). Here are some of them:

- Polkadot Asset Hub: wss://polkadot-asset-hub-rpc.polkadot.io
- Kusama Asset Hub: wss://kusama-asset-hub-rpc.polkadot.io
- Paseo testnet: wss://asset-hub-paseo-rpc.dwellir.com

> [!TIP]
> You can receive testnet tokens for free at https://faucet.polkadot.io/

For this workshop, we will use our local testnet version using the Acala Chopsticks framework, which creates a local fork of a real network. You may proceed to the [official GitHub repo](https://github.com/AcalaNetwork/chopsticks) to understand how Chopsticks work.

For this workshop, we have already crafted all the needed configurations for your own local testnet. In a few moments, we will launch and test it along with the SDK server.

### 2. Unique SDK

<!-- TODO: why use SDK -->

Unique SDK provides a convenient and lightweight way to interact with Substrate-based blockchains. It consists of two components:

- HTTP proxy server: establishes a connection with the blockchain node and provides an HTTP interface. To use an HTTP proxy, you can use [publicly available endpoints](https://docs.unique.network/reference/sdk-endpoints.html) or run your local version. For this workshop, we prepared a docker configuration that provides your local proxy server connected to [the local blockchain](#the-asset-hub-node).
- Thin client: you can send requests to an HTTP proxy directly using your favorite HTTP framework. However, the easiest way is to use the `@unique-nft/sdk` package, which provides an easy-to-use way to send requests to an HTTP proxy server using TypeScript.

### Running local Asset Hub node & SDK

We'll run a local SDK against Kusama fork (powered by Acala Chopsticks). Your computer should have Docker installed.

**First**, let's check the [docker-compose.yml](./docker-compose.yml) file. It comprises two services: `assethub-chopsticks` for local the local node and `substrate-proxy` for the SDK. Take a note:

- The local blockchain will be launched on port `8002`
- The SDK will be launched on port `3333`
- The SDK will be launched against the local blockchain: `CHAIN=ws://assethub-chopsticks:8002`.

**Second**, let's check the [Chopsticks configuration](./kusama-assethub.yml). Take a note:

- the fork will be created using the Kusama network endpoint: `endpoint: wss://kusama-asset-hub-rpc.polkadot.io`
- Your blockchain will have accounts with `free balances`. You may use these accounts for testing purposes or add your account to the list.

**Finally**, run your environment:

```sh
docker compose up
```

- The network will be launched on port `8002` (`ws://localhost:8002`). You may want to check your accounts and balances on the [polkadot apps](https://polkadot.js.org/apps/?rpc=ws://localhost:8002#/accounts). Make some transfers to make sure everything works
- The SDK will be launched at port `3333` (`http://localhost:3333`). Check the raw HTTP methods at [http://localhost:3333/documentation/static/index.html](http://localhost:3333/documentation/static/index.html). You can query some account's balance to make sure everything is configured correctly.

That is it! Your local development environment is ready to go!

Now, let's learn how to use it on the frontend.

### Run your Next.js application

Create the `.env` file in the root directory using [`.env.example`](./.env.example) as a template. At this point, the only significant variable is `NEXT_PUBLIC_REST_URL`.

```
NEXT_PUBLIC_REST_URL=http://localhost:3333
```

This variable specifies the URL of the SDK server. Our local SDK should work on port `3333`. You can recheck it by executing the `docker ps` command.

Now run your Next.js application:

```sh
npm run dev
```

Your application will normally run on port `3000`. Go to `http://localhost:3000` and check that your application is up and running. On the screen, you should see the Polkadot Wallet Selector component.

<!-- TODO  screen -->

If you don't have any Substrate wallets listed – install any of them and create an account. Then connect your wallet to the app and give it a try:

1. Make sure your balance is more than 0. If it is zero – go to the [Polkadot{.js} portal](https://polkadot.js.org/apps/?rpc=ws://localhost:8002#/accounts) and transfer some KSM tokens from one of the predefined accounts (Alice, Bob...) to your address. 
2. Return to the application and execute a transfer from your account to any other one using the built-in form. If the transaction succeeds, you will see the alert.

<!-- TODO: the main frontend components overview -->

Now, you have everything you need. Feel free to use this template as is or as an example for your favorite framework. If you want to learn more about Polkadot NFTs, continue reading. Otherwise, happy coding!

## Polkadot NFTs and metadata 101

In the Polkadot ecosystem, you don't have to deploy smart contracts to create NFTs. The `Asset Hub` chain is a special system L2 offers, `nfts pallet`, which is optimized for NFT use cases.

We will see how easy it is to create an NFT collection using [tests](./src/tests/sdk.test.ts).

But first, let's configure our environment variables. At this point, you should have the `.env` file created. If not – create one using `.env.example` as a template. Set the following environment variables:

- `PINATA_JWT` and `PINATA_GATEWAY`: there are two types of metadata in `nfts pallet` – on-chain and off-chain. We need to use third-party storage, typically IPFS, to store and manage off-chain metadata. Pinata is one of the leading providers of the IPFS service. Get your credentials for free on the [Pinata Cloud](https://pinata.cloud/). After registration, go to the [API keys section](https://app.pinata.cloud/developers/api-keys) and generate your API key. Save the JWT token and your gateway to the relevant environment variables.
- `MNEMONIC`: This variable is only used for tests, and you can leave it `//Alice`, a special alias for development accounts. This account already has some predefined balance specified in [kusama-assethub.yml](./kusama-assethub.yml) for your local environment. You can also set your mnemonic seed phrase. Use [`polkadot{.js}`](https://polkadot.js.org/extension/) or any other wallet to generate a 12-word mnemonic secret phrase. Make sure this account has a non-zero balance.

Now run the tests:

```sh
npm run test
```

If everything was set correctly, you will see in your terminal:

```sh
 Test Files  1 passed (1)
      Tests  3 passed (3)
```

> ![TIP]
> Using VS Code, you may debug tests with breakpoints using [`vitest.explorer`](https://marketplace.visualstudio.com/items?itemName=vitest.explorer) extension.

### Creating collections and NFTs

> ![NOTE]
> The following guide explains the basics of NFTs and how to craft them with Unique SDK. You can also learn this by reviewing tests. If you feel comfortable with this approach – you will find them here: [src/tests/sdk.test.ts](./src/tests/sdk.test.ts)

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

On-chain metadata (attributes) is relatively easy to understand and use. Here is how you may set it with SDK:

```ts
await ah.nftsPallet.attributes.set({
  collectionId,
  itemId,
  attribute: { key: "Name", value: "Alex", namespace: "itemOwner" },
});
```

<!-- TODO: explain namespace -->

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

Check your images uploaded successfully – navigate to https://ipfs.io/ipfs/<Your IPFS hash>. Or visit the Pinata account page.

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
