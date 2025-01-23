# assethub-next
🔗 The AssetHub + Next.js template 🔗

## Set up local dev environment

#### 1. Set your secrets

Put your secrets in the `.env` file, using [`env.example`](./env.example) as a template.

- `PINATA_JWT` and `PINATA_GATEWAY`: get your credentials for free on the [Pinata Cloud](https://pinata.cloud/). After registration, go to the [API keys section](https://app.pinata.cloud/developers/api-keys) and generate your API key. Save the JWT token and your gateway to the relevant environment variables.
- `MNEMONIC`: generate a random mnemonic seed phrase. Use [`polkadot{.js}`](https://polkadot.js.org/extension/) or any other wallet to generate a 12-word mnemonic secret phrase. For the test environment and this example, you may also use built-in secrets such as `//Alice` or `//Bob`.

#### 2. Spin up local testnet and SDK

We'll run a local SDK against Kusama fork (powered by Acala Chopsticks). Your computer should have Docker installed.

You are good to go if you use the `//Alice` account in your `.env`. Otherwise, add your address to the chopsticks config file: [`kusama-assethub.yml`](./kusama-assethub.yml) and set some balance.

Then run:

```sh
docker compose up
```

- The network will be launched at port `8002` (`ws://localhost:8002`). You may want to check your accounts and balances on the [polkadot apps](https://polkadot.js.org/apps/?rpc=ws://localhost:8002#/accounts). 
- The SDK will be launched at port `3333` (`http://localhost:3333`). Check the raw HTTP methods at [http://localhost:3333/documentation/static/index.html](http://localhost:3333/documentation/static/index.html)

#### 3. Understand how SDK works

> [!IMPORTANT]
> Ensure your test environment is running based on the previous steps.

Go to the [`__tests__`](./src/__tests__/) directory, read and execute test. Using VS Code, you may debug tests with breakpoints using [`vitest.explorer`](https://marketplace.visualstudio.com/items?itemName=vitest.explorer) extension.

The SDK consists of a thin client and a REST server. In the previous steps, we already launched the REST server, so ensure it's live: http://localhost:3333/documentation/static/index.html. For production environments, you may use [publicly available endpoints](https://docs.unique.network/reference/sdk-endpoints.html) or run a local server the same way we did—just modify the `CHAIN` variable in the [`docker-compose.yml`](./docker-compose.yml) file.

The Unique Network [documentation](https://docs.unique.network/build/sdk/v2/asset-hub.html) introduces working with SDK.

## Collection metadata 101

There are two types of metadata in the `nfts pallet` – on-chain and off-chain.

On-chain metadata is relatively easy to understand and use. And SDK is the only tool you need to set them:
<!-- Except of namespaces -->

```ts
await ah.nftsPallet.attributes.set({
  collectionId,
  itemId,
  attribute: { key: "Name", value: "Alex", namespace: "itemOwner" },
});
```

However, when it comes to off-chain metadata, you need to use third-party storage and API. The most popular one is IPFS, and Pinata is one of the leading providers of the IPFS service. 

At this point, you should already have your Pinata JWT token. If not, get one on [Pinata Cloud](https://pinata.cloud/). Then set it and your Pinata gateway to the `.env` file.

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
