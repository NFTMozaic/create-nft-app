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
  test("Can upload images and metadata for the future collection and NFTs using Pinata SDK", async () => {
    // 🐣 Step 1: Initialize the Pinata SDK
    console.log("🟢 Initializing Pinata SDK...");
    const pinata = new PinataSDK({
      pinataJwt: config.pinataJwt,
      pinataGateway: config.pinataGateway,
    });

    // 🐣 Step 2: Read images from local filesystem
    console.log("📂 Reading 'cover.png' and 'token.png' from filesystem...");
    const coverBlob = new Blob([
      fs.readFileSync(path.join(process.cwd(), "src/tests/cover.png")),
    ]);
    const tokenBlob = new Blob([
      fs.readFileSync(path.join(process.cwd(), "src/tests/token.png")),
    ]);

    // 🐣 Step 3: Create File objects for Pinata
    const coverImage = new File([coverBlob], "cover.png", {
      type: "image/png",
    });
    const tokenImage = new File([tokenBlob], "token.png", {
      type: "image/png",
    });

    // 🐣 Step 4: Upload images to IPFS via Pinata
    console.log("🚀 Uploading images to IPFS...");
    const imagesUpload = await pinata.upload.fileArray([coverImage, tokenImage]);
    imagesIpfsHash = imagesUpload.IpfsHash;
    console.log(`✅ Images uploaded! IPFS Hash: ${imagesIpfsHash}`);
    console.log(
      `🔗 View 'cover.png' on IPFS: https://gateway.pinata.cloud/ipfs/${imagesIpfsHash}/cover.png`
    );
    console.log(
      `🔗 View 'token.png' on IPFS: https://gateway.pinata.cloud/ipfs/${imagesIpfsHash}/token.png`
    );

    // 🐣 Step 5: Prepare metadata objects
    const collectionMetadata = {
      name: "My NFT",
      description: "This is a unique NFT",
      image: `ipfs://ipfs/${imagesIpfsHash}/cover.png`,
    };
    const nftMetadata = {
      name: "NFT name",
      description: "NFT description",
      image: `ipfs://ipfs/${imagesIpfsHash}/token.png`,
      type: "image/png",
      attributes: [{ trait_type: "Age", value: "20" }],
    };

    // 🐣 Step 6: Convert metadata objects to Blobs & Files
    console.log("📝 Converting metadata objects to JSON files...");
    const collectionMetadataBlob = new Blob([JSON.stringify(collectionMetadata)], {
      type: "application/json",
    });
    const collectionMetadataJson = new File([collectionMetadataBlob], "collection_metadata.json", {
      type: "application/json",
    });
    const tokenMetadataBlob = new Blob([JSON.stringify(nftMetadata)], {
      type: "application/json",
    });
    const tokenMetadataJson = new File([tokenMetadataBlob], "token_metadata.json", {
      type: "application/json",
    });

    // 🐣 Step 7: Upload metadata JSON files to IPFS
    console.log("🚀 Uploading metadata JSON files to IPFS...");
    const metadataUpload = await pinata.upload.fileArray([
      collectionMetadataJson,
      tokenMetadataJson,
    ]);
    metadataIpfsHash = metadataUpload.IpfsHash;
    console.log(`✅ Metadata uploaded! IPFS Hash: ${metadataIpfsHash}`);
    console.log(
      `🔗 Collection metadata: https://gateway.pinata.cloud/ipfs/${metadataIpfsHash}/collection_metadata.json`
    );
    console.log(
      `🔗 NFT metadata: https://gateway.pinata.cloud/ipfs/${metadataIpfsHash}/token_metadata.json`
    );
  });

  test("Can create a collection and set collection's metadata", async () => {
    // Safety check to ensure we have IPFS hashes from the previous test
    if (!imagesIpfsHash || !metadataIpfsHash)
      throw new Error("Collection metadata is not set. Run all tests in sequence.");

    // 🐣 Step 1: Initialize the AssetHub SDK and account
    console.log("🟢 Initializing AssetHub SDK for collection creation...");
    const privateKey = config.mnemonic;
    const account = Sr25519Account.fromUri(privateKey);
    const ah = AssetHub({
      baseUrl: "http://localhost:3333",
      account,
    });

    // 🐣 Step 2: Query account balance (just for demonstration)
    const balance = await ah.balance.get(account);
    console.log(`💰 Account balance: ${balance.available}`);

    // 🐣 Step 3: Create a new collection on AssetHub
    console.log("🚀 Creating a new NFT collection on AssetHub...");
    const collectionResult = await ah.nftsPallet.collection.create({
      collectionConfig: { maxSupply: 200 },
    });
    collectionId = collectionResult.result.collectionId;
    console.log(`✅ Collection created! Collection ID: ${collectionId}`);

    // 🐣 Step 4: Set the metadata URI for the newly created collection
    console.log("📝 Setting collection metadata URI...");
    const collectionMetadataUri = `ipfs://ipfs/${metadataIpfsHash}/collection_metadata.json`;
    await ah.nftsPallet.collection.setMetadata({
      collectionId,
      data: collectionMetadataUri,
    });
    console.log(`🔗 Collection metadata URI: ${collectionMetadataUri}`);

    // 🐣 Step 5: Fetch collection info from the chain and verify
    console.log("🔎 Verifying collection metadata on-chain...");
    const metadataOnchain = await ah.nftsPallet.collection.get({ collectionId });
    expect(metadataOnchain.metadata?.data).to.eq(collectionMetadataUri);
    console.log("✅ Collection metadata verified!");
  });

  test("Can create an NFT and set NFT's metadata", async () => {
    // Safety check to ensure we have IPFS hashes and collection ID
    if (!imagesIpfsHash || !metadataIpfsHash || !collectionId)
      throw new Error("Metadata is not set. Run all tests in sequence.");

    // 🐣 Step 1: Initialize the AssetHub SDK and account
    console.log("🟢 Initializing AssetHub SDK for NFT minting...");
    const privateKey = config.mnemonic;
    const account = Sr25519Account.fromUri(privateKey);
    const ah = AssetHub({
      baseUrl: "http://localhost:3333",
      account,
    });

    // 🐣 Step 2: Mint a new NFT within the collection
    console.log(`🚀 Minting a new NFT in collection #${collectionId}...`);
    const { result } = await ah.nftsPallet.item.mint({
      collectionId,
      itemId: 1, // manually specifying itemId, though it could also be auto-generated
      mintTo: account.address,
    });
    console.log(`✅ NFT minted! Item ID: ${result.itemId}`);

    // 🐣 Step 3: Set off-chain metadata for the NFT
    console.log("📝 Setting NFT metadata...");
    const tokenMetadataUri = `ipfs://ipfs/${metadataIpfsHash}/token_metadata.json`;
    await ah.nftsPallet.item.setMetadata({
      collectionId,
      itemId: result.itemId,
      data: tokenMetadataUri,
    });
    console.log(`🔗 NFT metadata URI: ${tokenMetadataUri}`);

    // 🐣 Step 4: Set on-chain attributes (e.g., "Name" = "Alex")
    console.log("🚀 Setting NFT on-chain attributes...");
    await ah.nftsPallet.attributes.set({
      collectionId,
      itemId: result.itemId,
      attribute: { key: "Name", value: "Alex", namespace: "itemOwner" },
    });
    console.log("✅ Attribute set: Name -> Alex");

    // 🐣 Step 5: Fetch the NFT info from the chain and verify
    console.log("🔎 Verifying NFT metadata and attributes on-chain...");
    const metadataOnchain = await ah.nftsPallet.item.get({
      collectionId,
      itemId: result.itemId,
    });
    expect(metadataOnchain.metadata?.data).to.eq(tokenMetadataUri);
    expect(metadataOnchain.attributes).to.have.length(1);
    expect(metadataOnchain.attributes[0].key).eq("Name");
    expect(metadataOnchain.attributes[0].value).eq("Alex");
    console.log("✅ NFT metadata and attributes verified!");
    console.log(
      `🔗 Check the NFT metadata on IPFS: https://gateway.pinata.cloud/ipfs/${metadataIpfsHash}/token_metadata.json`
    );
  });
});
