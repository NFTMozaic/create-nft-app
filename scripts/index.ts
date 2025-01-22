import {AssetHub} from "@unique-nft/sdk";
import {Sr25519Account} from "@unique-nft/sr25519";
import {PinataSDK} from "pinata-web3";
import fs from 'fs';
import path from "path";
import config from './secret';

const main = async () => {
  const privateKey = config.substrateSecret;
  const account = Sr25519Account.fromUri(privateKey);
  const ah = AssetHub({
    baseUrl: "http://localhost:3333", // TODO change it to the production
    account
  });

  // Step-1. upload collection level metadata to the IPFS
  // Init pinata
  const pinata = new PinataSDK({
    pinataJwt: config.pinataJwt,
    pinataGateway: "orange-impressed-bonobo-853.mypinata.cloud",
  });

  // Read an image
  const blob = new Blob([fs.readFileSync(path.join(process.cwd(), 'src/sdk/cover.png'))]);
  const coverImage = new File([blob], 'cover.png', {type: 'image/png'});
  // Upload
  const coverUpload = await pinata.upload.file(coverImage);
  console.log(coverUpload.IpfsHash);

  // Define collection metadata
  const collectionMetadata = {
    name: "My NFT",
    description: "This is a unique NFT",
    image: `ipfs://ipfs/${coverUpload.IpfsHash}`
  };
  const metadataBlob = new Blob([JSON.stringify(collectionMetadata)], {type: "application/json"});
  const metadataJson = new File([metadataBlob], 'metadata.json', {type: "application/json"});
  const metadataUpload = await pinata.upload.file(metadataJson);
  

  // Step-xxx. create a collection
  const collectionResult = await ah.nftsPallet.collection.create({collectionConfig: {maxSupply: 200}})
  const collectionId = collectionResult.result.collectionId;

  // set metadata
  await ah.nftsPallet.collection.setMetadata({collectionId, data: `ipfs://ipfs/${metadataUpload.IpfsHash}`})
}

main().catch(e => console.log(e.message));
