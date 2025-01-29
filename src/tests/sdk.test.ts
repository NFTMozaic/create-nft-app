import { describe, expect, test } from "vitest";
import { AssetHub } from "@unique-nft/sdk";
import { Sr25519Account } from "@unique-nft/sr25519";
import { PinataSDK } from "pinata-web3";
import fs from "fs";
import config from "./config";
import path from "path";

let imagesIpfsHash: string;
let metadataIpfsHash: string;
let collectionId: number;

describe.sequential("Pallet nfts", () => {
  test("Can upload images and metadata for the future collection and NFTs", async () => {
    // Step-1. upload collection level metadata to the IPFS
    // Init pinata
    const pinata = new PinataSDK({
      pinataJwt: config.pinataJwt,
      pinataGateway: config.pinataGateway,
    });

    // Read a collection's cover image
    const coverBlob = new Blob([
      fs.readFileSync(path.join(process.cwd(), "src/__tests__/cover.png")),
    ]);
    const tokenBlob = new Blob([
      fs.readFileSync(path.join(process.cwd(), "src/__tests__/token.png")),
    ]);
    const coverImage = new File([coverBlob], "cover.png", {
      type: "image/png",
    });
    const tokenImage = new File([tokenBlob], "token.png", {
      type: "image/png",
    });

    // Upload
    const imagesUpload = await pinata.upload.fileArray([
      coverImage,
      tokenImage,
    ]);
    imagesIpfsHash = imagesUpload.IpfsHash;
    console.log(imagesIpfsHash);

    // Define collection metadata
    const collectionMetadata = {
      name: "My NFT",
      description: "This is a unique NFT",
      image: `ipfs://ipfs/${imagesIpfsHash}/cover.png`,
    };
    const collectionMetadataBlob = new Blob([JSON.stringify(collectionMetadata)], {
      type: "application/json",
    });
    const collectionMetadataJson = new File([collectionMetadataBlob], "collection_metadata.json", {
      type: "application/json",
    });

    const nftMetadata = {
      name: "NFT name",
      description: "NFT description",
      image: `ipfs://ipfs/${imagesIpfsHash}/token.png`,
      type: "image/png",
      attributes: [{trait_type: "Age", value: "20"}],
    }
    const tokenMetadataBlob = new Blob([JSON.stringify(nftMetadata)], {
      type: "application/json",
    });
    const tokenMetadataJson = new File([tokenMetadataBlob], "token_metadata.json", {
      type: "application/json",
    });

    // Upload metadata to IPFS
    const metadataUpload = await pinata.upload.fileArray([collectionMetadataJson, tokenMetadataJson]);
    metadataIpfsHash = metadataUpload.IpfsHash;
  });

  test("Can create a collection and set collection's metadata", async () => {
    if (!imagesIpfsHash || !metadataIpfsHash)
      throw Error("Collection metadata is not set, run all tests");

    const privateKey = config.mnemonic;
    const account = Sr25519Account.fromUri(privateKey);
    const ah = AssetHub({
      baseUrl: "http://localhost:3333",
      account,
    });

    // Query balance
    const balance = await ah.balance.get(account);
    console.log(balance.available);

    // Step-xxx. Create a collection
    const collectionResult = await ah.nftsPallet.collection.create({
      collectionConfig: { maxSupply: 200 },
    });
    collectionId = collectionResult.result.collectionId;

    // set uploaded metadata to the collection
    const collectionMetadataUri = `ipfs://ipfs/${metadataIpfsHash}/collection_metadata.json`;
    await ah.nftsPallet.collection.setMetadata({
      collectionId,
      data: collectionMetadataUri,
    });

    const metadataOnchain = await ah.nftsPallet.collection.get({
      collectionId,
    });
    expect(metadataOnchain.metadata?.data).to.eq(collectionMetadataUri);
  });

  test("Can create an NFT and set NFT's metadata", async () => {
    if (!imagesIpfsHash || !metadataIpfsHash || !collectionId)
      throw Error("Metadata is not set, run all tests");

    const privateKey = config.mnemonic;
    const account = Sr25519Account.fromUri(privateKey);
    const ah = AssetHub({
      baseUrl: "http://localhost:3333",
      account,
    });

    // Mint an NFT
    const { result } = await ah.nftsPallet.item.mint({
      collectionId,
      itemId: 1,
      mintTo: account.address,
    });

    // Set NFT's metadata (off-chain)
    const tokenMetadataUri = `ipfs://ipfs/${metadataIpfsHash}/token_metadata.json`;
    await ah.nftsPallet.item.setMetadata({
      collectionId,
      itemId: result.itemId,
      data: tokenMetadataUri,
    });

    // Set token attributes (on-chain)
    await ah.nftsPallet.attributes.set({
      collectionId,
      itemId: result.itemId,
      attribute: { key: "Name", value: "Alex", namespace: "itemOwner" },
    });

    const metadataOnchain = await ah.nftsPallet.item.get({
      collectionId,
      itemId: result.itemId,
    });
    expect(metadataOnchain.metadata?.data).to.eq(tokenMetadataUri);

    expect(metadataOnchain.attributes).to.have.length(1);
    expect(metadataOnchain.attributes[0].key).eq("Name");
    expect(metadataOnchain.attributes[0].value).eq("Alex");
  });
});
