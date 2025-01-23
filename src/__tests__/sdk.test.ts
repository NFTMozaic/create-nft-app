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
      pinataGateway: "orange-impressed-bonobo-853.mypinata.cloud",
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
    console.log(imagesUpload.IpfsHash);
    imagesIpfsHash = imagesUpload.IpfsHash;

    // Define collection metadata
    const collectionMetadata = {
      name: "My NFT",
      description: "This is a unique NFT",
      image: `ipfs://ipfs/${imagesUpload.IpfsHash}`,
    };
    const metadataBlob = new Blob([JSON.stringify(collectionMetadata)], {
      type: "application/json",
    });
    const metadataJson = new File([metadataBlob], "metadata.json", {
      type: "application/json",
    });

    // Upload metadata to IPFS
    const metadataUpload = await pinata.upload.file(metadataJson);
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
    const collectionMetadataUri = `ipfs://ipfs/${metadataIpfsHash}`;
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

    // Set NFT's metadata
    const tokenMetadataUri = `ipfs://ipfs/${metadataIpfsHash}`;
    await ah.nftsPallet.item.setMetadata({
      collectionId,
      itemId: result.itemId,
      data: tokenMetadataUri,
    });

    const metadataOnchain = await ah.nftsPallet.item.get({
      collectionId,
      itemId: result.itemId,
    });
    expect(metadataOnchain.metadata?.data).to.eq(tokenMetadataUri);
  });
});
