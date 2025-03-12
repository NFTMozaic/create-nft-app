# 🎨 Lesson 7: Creating an NFT Collection on Asset Hub

In this lesson, you'll build a Collection Creation Component that allows users to create an NFT collection on Polkadot’s Asset Hub. You'll integrate the Unique SDK and the Pinata Context to manage metadata uploads.

## 1. Setting Up the Collection Creation Component

📌 Why Do We Need This Component?
Before minting NFTs, we need a collection to store them. This component will:

✅ Let users define collection attributes (name, description, cover image).

✅ Upload metadata to IPFS using Pinata.

✅ Create the collection on Asset Hub via the Unique SDK.

Create a new file: `components/CreateCollection.tsx`

Paste this code:

```ts
import { useState } from "react";
import { useSdkContext } from "@/context/UniqueSDKContext";
import { usePinata } from "@/context/PinataContext";
import { useAccountsContext } from "@/context/AccountsContext";

const CreateCollection = () => {
  const { sdk } = useSdkContext();
  const { uploadFile, uploadMetadata } = usePinata();
  const { activeAccount } = useAccountsContext();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  const createCollection = async () => {
    if (!sdk || !activeAccount) {
      setStatus("⚠️ Please connect your wallet first!");
      return;
    }
    if (!name || !description || !coverImage) {
      setStatus("⚠️ Please fill in all fields and upload an image.");
      return;
    }

    try {
      setStatus("📤 Uploading image to IPFS...");
      const imageUrl = await uploadFile(coverImage);
      if (!imageUrl) throw new Error("Image upload failed.");

      const metadata = { name, description, image: imageUrl };
      setStatus("📤 Uploading metadata to IPFS...");
      const metadataUrl = await uploadMetadata(metadata);
      if (!metadataUrl) throw new Error("Metadata upload failed.");

      setStatus("⏳ Creating collection on Asset Hub...");
      const { result } = await sdk.nftsPallet.collection.create(
        {
          name,
          description,
          tokenPrefix: "NFT",
          owner: activeAccount.address,
          schema: { schemaName: "unique" },
          offchainSchema: metadataUrl,
        },
        { signerAddress: activeAccount.address },
        // @ts-expect-error TODO fix types
        { signer: activeAccount.signer }
      );

      setStatus(`✅ Collection Created! ID: ${result.collectionId}`);
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto bg-gray-50 border border-gray-300 rounded">
      <h2 className="text-base font-medium text-gray-800 mb-2">Create NFT Collection</h2>

      <input
        type="text"
        placeholder="Collection Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100 text-gray-800"
      />

      <textarea
        placeholder="Collection Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full mt-2 px-2 py-1 border border-gray-300 rounded bg-gray-100 text-gray-800"
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
        className="w-full mt-2 text-sm text-gray-700"
      />

      <button
        onClick={createCollection}
        className="mt-3 w-full px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
      >
        Create Collection
      </button>

      <p className="text-sm mt-2 text-gray-600">{status}</p>
    </div>
  );
};

export default CreateCollection;
```

### 📚 Explanation of the Component

- Form Inputs:
  - name: Collection name.
  - description: Collection description.
  - coverImage: The main collection image uploaded to IPFS.

- Upload to IPFS via Pinata:
  - First, the cover image is uploaded.
  - Then, the metadata JSON (name, description, image) is uploaded.
- Create Collection on Asset Hub:
  - Uses sdk.collections.create() from the Unique SDK.
  - The collection is linked to the uploaded metadata.

## 2. Integrating Collection Creation into Your App

To use the CreateCollection component, add it to your homepage:

```ts
'use client';

import WalletSelector from "@/components/WalletSelector";
import CreateCollection from "@/components/CreateCollection";

export default function Home() {
  return (
    <div>
      <h1>NFT Minting on Asset Hub</h1>
      <WalletSelector />
      <CreateCollection />
    </div>
  );
}
```

## 🧪 Testing the Component

Steps to Verify:
- Connect your wallet using the Wallet Selector.
- Enter collection details (name, description, image).
- Click “Create Collection” – watch for updates in the status field.
- Check the console for transaction details.

## 🚀 Next Steps
🎉 Your collection is now on Asset Hub! Next, we’ll mint NFTs into this collection using uploaded metadata.
