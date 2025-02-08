# The Asset Hub & Next.js template

<!-- TODO: What you need to have: docker, node.js, knowledge -->

<!-- TODO: what is Asset Hub -->

<!-- TODO: TL;DR -->

# Overview

This template is aims to bootstrap an NFT applications on `Asset Hub` by Polkadot. It utilizes [`@unique-nft/sdk`](https://www.npmjs.com/package/@unique-nft/sdk) for seamless blockchain interactions.

- If you need a quick start guide on how to build on Polkadot – continue to read this document. 
- If you want to better understand how the SDK works – proceed to the [official documentation](https://docs.unique.network/).

## Main components overview

### 1. The Asset Hub node

There are plenty of publicly available nodes you can use to send transactions. You may find several available options on [`polkadot.js.org/apps`](http://polkadot.js.org/apps). Here are some of them:

- Polkadot Asset Hub: wss://polkadot-asset-hub-rpc.polkadot.io
- Kusama Asset Hub: wss://kusama-asset-hub-rpc.polkadot.io
- Paseo testnet: wss://asset-hub-paseo-rpc.dwellir.com

> [!TIP]
> You can receive testnet tokens for free on https://faucet.polkadot.io/

For this workshop we will use our local testnet version using the Acala Chopsticks framework, which creates a local fork of a real network. If you want to understand how Chopsticks work you may proceed to the [official GitHub repo](https://TODO).

For this workshop we already crafted all the needed configuration for your own local testnet. We will launch and test it along with the SDK server in a few moments.

### 2. Unique SDK

<!-- TODO: why use SDK -->

Unique SDK provides convenient and lightweight way to interact with Substrate based blockchains. It is consist of two components:

- HTTP proxy server: establishes connection with the blockchain node and provides HTTP interface. To use HTTP proxy you can use [publicly available endpoints](https://docs.unique.network/reference/sdk-endpoints.html), or run your local version. For this workshop we prepared a docker configuration which provides your local proxy server connected to the [local blockchain](#the-asset-hub-node).
- Thin client: if you wish you can send requests to HTTP proxy directly using your favorite http framework. However, the easiest way is using `@unique-nft/sdk` package, which provides easy to use way to send request to http proxy server using TypeScript.

### Running local Asset Hub node & local SDK

We'll run a local SDK against Kusama fork (powered by Acala Chopsticks). Your computer should have Docker installed.

**First**, let's check the [docker-compose.yml](./docker-compose.yml) file. You will find it consists of two services: `assethub-chopsticks` for local the local node and `substrate-proxy` for the SDK. Take a note:

- The local blockchain will be launched on port `8002`
- The SDK will be launched on port `3333`
- The SDK will be launched against the local blockchain: `CHAIN=ws://assethub-chopsticks:8002`.

**Second**, let's check the [Chopsticks configuration](./kusama-assethub.yml). Take a note:

- the fork will be created using the Kusama network endpoint: `endpoint: wss://kusama-asset-hub-rpc.polkadot.io`
- Your blockchain will have a set of accounts with `free balances`. You may use these accounts for testing purposes, or add your own account to the list.


**Finally**, run your environment:

```sh
docker compose up
```

- The network will be launched on port `8002` (`ws://localhost:8002`). You may want to check your accounts and balances on the [polkadot apps](https://polkadot.js.org/apps/?rpc=ws://localhost:8002#/accounts). Make some transfers to make sure everything works
- The SDK will be launched at port `3333` (`http://localhost:3333`). Check the raw HTTP methods at [http://localhost:3333/documentation/static/index.html](http://localhost:3333/documentation/static/index.html). You can query some account's balance to make sure everything configured properly.

That is it! Your local development environment is ready to go!

Now let's learn how to use it on the frontend.

### Run your Next.js application

In the root directory create the `.env` file, using [`.env.example`](./.env.example) as a template. At this point the only important variable is `NEXT_PUBLIC_REST_URL`.

```
NEXT_PUBLIC_REST_URL=http://localhost:3333
```

This variable specifies the URL of the SDK server. Our local SDK should work on port `3333`. You can check it one more time by executing the `docker ps` command.

Now run your Next.js application:

```sh
npm run dev
```

Your application will normally run on the port `3000`. Go to the `http://localhost:3000` and check your application is up and running. On the screen you should see the Polkadot Wallet Selector component.

<!-- TODO  screen -->

If you don't have any Substrate wallets listed – install any of them and create an account. Then connect your wallet to the app and give it a try:

1. Make sure your balance is more than 0. If it is zero – go to the [Polkadot{.js} portal](https://polkadot.js.org/apps/?rpc=ws://localhost:8002#/accounts) and transfer some KSM tokens from one of the predefined accounts (Alice, Bob...) to your address. 
2. Get back to the application and execute transfer from your account to any other one using built in form. If the transaction succeeds you will see the alert.

<!-- TODO: the main frontend components overview -->

Now, you have everything you need. Feel free to use this template as is or as an example for your favorite framework. If you want to learn more about NFTs in general and Polkadot NFTs in common, continue reading. Otherwise, happy coding!

## Polkadot NFTs and metadata 101

In Polkadot ecosystem you don't have to deploy smart contracts to create NFTs. The `Asset Hub` chain is a special system L2 offers `nfts pallet` which is optimized for NFT use cases.

We will see how easy to create an NFT collection using [tests](./src/tests/sdk.test.ts).

But first, let's configure our environment variables. At this point you should already have the `.env` file created. If not – create one using `.env.example` as a template. Set the following environment variables:

- `PINATA_JWT` and `PINATA_GATEWAY`: there are two types of metadata in `nfts pallet` – on-chain and off-chain. To store and manage off-chain metadata we need to use third-party storage, typically IPFS. Pinata is one of the leading providers of the IPFS service. Get your credentials for free on the [Pinata Cloud](https://pinata.cloud/). After registration, go to the [API keys section](https://app.pinata.cloud/developers/api-keys) and generate your API key. Save the JWT token and your gateway to the relevant environment variables.
- `MNEMONIC`: This variable is only used for tests, and you can leave it `//Alice` which is special alias for development account. For your local environment this account already have some predefined balance specified in [kusama-assethub.yml](./kusama-assethub.yml). If you want, you may set your own mnemonic seed phrase. Use [`polkadot{.js}`](https://polkadot.js.org/extension/) or any other wallet to generate a 12-word mnemonic secret phrase. Make sure this account have non-zero balance.

Now run the tests:

```sh
npm run test
```

If everything was set correctly you will see in your terminal:

```sh
 Test Files  1 passed (1)
      Tests  3 passed (3)
```

> ![TIP]
> Using VS Code, you may debug tests with breakpoints using [`vitest.explorer`](https://marketplace.visualstudio.com/items?itemName=vitest.explorer) extension.

### Creating collections and NFTs

<!-- TODO -->

### Metadata

There are two types of metadata in the `nfts pallet` – on-chain and off-chain.

On-chain metadata (attributes) is relatively easy to understand and use. Here is how you may set 

```ts
await ah.nftsPallet.attributes.set({
  collectionId,
  itemId,
  attribute: { key: "Name", value: "Alex", namespace: "itemOwner" },
});
```

However, when it comes to off-chain metadata, you need to use third-party storage and API. The most popular one is IPFS, and Pinata is one of the leading providers of the IPFS service. 

At this point, you should already have your Pinata JWT token. If not, get one on [Pinata Cloud](https://pinata.cloud/) and set it along with the gateway to the `.env` file.

Then install and initialize PinataSDK.

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

Now, when we upload images, we need to prepare metadata JSON. We will use the metadata standard described in the [OpenSea documentation](https://docs.opensea.io/docs/metadata-standards) for that.

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
