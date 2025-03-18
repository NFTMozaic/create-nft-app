# Lesson 7: Setting metadata

> [!NOTE] 
> This lesson does not cover how to create and store metadata files.
> 
> You can use services like Pinata to upload JSON metadata to IPFS.
>
> To keep this tutorial focused, we have already prepared a metadata file following OpenSea's Metadata Standard. You can view and use the example metadata here: https://orange-impressed-bonobo-853.mypinata.cloud/ipfs/bafkreigqw6s6se5plrn6hzxiw2ve42lczzyfi4brdrvad26vlh57fnwaai

Metadata is what gives NFTs their uniqueness and value. Let's enhance our NFT creation process by allowing users to attach metadata. To do this, we'll modify `components/TokenCreationForm.tsx`.

1. We set a new state for tracking metadata

```ts
const TokenCreationForm = () => {
...
const [metadata, setMetadata] = useState("");
...
```

2. Next create an input to set the link of metadata

```ts
...

return (
...

<div className="w-full mb-4">
  <label className="block text-sm font-medium text-gray-800">
    Metadata URL
  </label>
  <input
    type="text"
    value={metadata}
    onChange={(e) => setMetadata(e.target.value)}
    className="mt-1 p-2 w-full border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:ring focus:ring-blue-300"
    placeholder="Enter Metadata URL"
  />
</div>
```

3. Finally, in our NFT creation handler function, let's add a call to set the token's metadata right after `sdk.nftsPallet.item.mint` is finished.

```ts
...

const handleCreateToken = async () => {
...

if (metadata) {
  setStatus("⏳ Setting NFT metadata");
  const setMetadataTx = await sdk.nftsPallet.item.setMetadata({
    collectionId: Number(collectionId),
    itemId: Number(itemId),
    data: metadata,
  });
  if (!setMetadataTx.result.metadata) {
    setStatus("❌ Failed to set metadata.");
  }
}
```

## Modify the NFTItem component to show a link for token metadata

To display metadata for each NFT, we need to modify the `NFTItem.tsx` component to include a link to its metadata file. This will allow users to view the metadata stored on IPFS.

1. Modify nft state to keep metadata link

```ts
...

const [nft, setNft] = useState<{ itemId: number; owner: string, metadata: string | undefined } | null>(null);

...

const fetchNfts = useCallback(

...
setNft({ itemId: nftData.itemId, owner: nftData.owner, metadata: nftData.metadata?.data });
```

2. We will add a metadata link inside the NFT details section so users can click and view the metadata JSON file.

```ts
import Link from "next/link";

return (
...
{nft && (
  ...
  {nft.metadata && <Link className="text-blue-500" href={nft.metadata} target="_blank">Metadata</Link>}
)}
```

## 🧪 Testing the Component

Steps to Verify:
- Create a new NFT with metadata. You will be asked to sign two transactions – one for NFT creation and one for setting NFT's metadata
- Query your newly created NFT


## The final code

<details> 
  <summary>TokenCreationForm.tsx</summary>
  
```ts
import { useState } from "react";
import { useAccountsContext } from "@/context/AccountsContext";
import { useSdkContext } from "@/context/UniqueSDKContext";

const TokenCreationForm = () => {
  const { activeAccount } = useAccountsContext();
  const { sdk } = useSdkContext();

  const [collectionId, setCollectionId] = useState("");
  const [itemId, setItemId] = useState("");
  const [metadata, setMetadata] = useState("");
  const [status, setStatus] = useState("");

  const handleCreateToken = async () => {
    if (!sdk) return;
    if (!activeAccount) {
      setStatus("⚠️ Please connect your wallet first!");
      return;
    }

    if (!collectionId || !itemId) {
      setStatus("⚠️ Please enter valid Collection ID and Item ID!");
      return;
    }

    try {
      setStatus("⏳ Creating NFT on Asset Hub...");
      const { result } = await sdk.nftsPallet.item.mint({
        collectionId: Number(collectionId),
        itemId: Number(itemId),
        mintTo: activeAccount.address,
      });

      if (metadata) {
        setStatus("⏳ Setting NFT metadata");
        const setMetadataTx = await sdk.nftsPallet.item.setMetadata({
          collectionId: Number(collectionId),
          itemId: Number(itemId),
          data: metadata,
        });
        if (!setMetadataTx.result.metadata) {
          setStatus("❌ Failed to set metadata.");
        }
      }

      if (result?.itemId) {
        setStatus(`✅ NFT Created! ID: ${result.itemId}`);
      } else {
        setStatus("❌ Failed to create NFT.");
      }
    } catch (error) {
      console.error(error);
      setStatus(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white shadow-md rounded-xl border w-80">
      <h2 className="text-lg font-semibold text-gray-900 text-center mb-4">
        Create NFT
      </h2>

      <div className="w-full mb-4">
        <label className="block text-sm font-medium text-gray-800">
          Collection ID
        </label>
        <input
          type="number"
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          className="mt-1 p-2 w-full border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:ring focus:ring-blue-300"
          placeholder="Enter Collection ID"
        />
      </div>

      <div className="w-full mb-4">
        <label className="block text-sm font-medium text-gray-800">
          Item ID
        </label>
        <input
          type="number"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="mt-1 p-2 w-full border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:ring focus:ring-blue-300"
          placeholder="Enter Item ID"
        />
      </div>

      <div className="w-full mb-4">
        <label className="block text-sm font-medium text-gray-800">
          Metadata URL
        </label>
        <input
          type="text"
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
          className="mt-1 p-2 w-full border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:ring focus:ring-blue-300"
          placeholder="Enter Metadata URL"
        />
      </div>

      <button
        onClick={handleCreateToken}
        className="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition"
      >
        Mint NFT
      </button>

      {status && (
        <p className="mt-4 text-sm text-gray-800 text-center break-all">{status}</p>
      )}
    </div>
  );
};

export default TokenCreationForm;
```
</details>

<details> 
  <summary>NFTItem.tsx</summary>

```ts
import { useCallback, useState } from "react";
import { useAccountsContext } from "@/context/AccountsContext";
import { useSdkContext } from "@/context/UniqueSDKContext";
import Link from "next/link";

const NFTItem = () => {
  const { activeAccount } = useAccountsContext();
  const { sdk } = useSdkContext();

  const [collectionId, setCollectionId] = useState("");
  const [itemId, setItemId] = useState("");
  const [nft, setNft] = useState<{ itemId: number; owner: string, metadata: string | undefined } | null>(null);
  const [status, setStatus] = useState("");

  const fetchNfts = useCallback(
    async () => {
      if (!sdk) {
        setStatus("⚠️ SDK not available!");
        return;
      }

      if (!activeAccount) {
        setStatus("⚠️ Please connect your wallet first!");
        return;
      }

      if (!collectionId || !itemId) {
        setStatus("⚠️ Please enter valid Collection ID and Item ID!");
        return;
      }

      try {
        setStatus("⏳ Fetching NFT details...");
        const nftData = await sdk.nftsPallet.item.get({
          collectionId: Number(collectionId),
          itemId: Number(itemId),
        });

        setNft({ itemId: nftData.itemId, owner: nftData.owner, metadata: nftData.metadata?.data });
        setStatus("✅ NFT details fetched successfully!");
      } catch (error) {
        console.error(error);
        setStatus("❌ Failed to fetch NFT details.");
      }
    },
    [activeAccount, sdk, collectionId, itemId]
  );

  const shortenAddress = (address: string) => {
    return `${address.slice(0,5)}...${address.slice(-5)}`
  }

  return (
    <div className="flex flex-col items-center p-6 bg-white shadow-md rounded-xl border w-80">
      <h2 className="text-lg font-semibold text-gray-900 text-center mb-4">
        Fetch NFT Details
      </h2>

      <div className="w-full mb-4">
        <label className="block text-sm font-medium text-gray-800">
          Collection ID
        </label>
        <input
          type="number"
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          className="mt-1 p-2 w-full border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:ring focus:ring-blue-300"
          placeholder="Enter Collection ID"
        />
      </div>

      <div className="w-full mb-4">
        <label className="block text-sm font-medium text-gray-800">
          Item ID
        </label>
        <input
          type="number"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="mt-1 p-2 w-full border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:ring focus:ring-blue-300"
          placeholder="Enter Item ID"
        />
      </div>

      <button
        onClick={fetchNfts}
        className="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition"
      >
        Fetch NFT
      </button>

      {status && <p className="mt-4 text-sm text-gray-800 text-center break-all">{status}</p>}

      {nft && (
        <div className="mt-6 w-full p-4 bg-gray-100 rounded-lg text-center">
          <h3 className="text-md font-medium text-gray-700">NFT Details</h3>
          <p className="text-gray-600">Item ID: {nft.itemId}</p>
          <p className="text-gray-600">Owner: {shortenAddress(nft.owner)}</p>
          {nft.metadata && <Link className="text-blue-500" href={nft.metadata} target="_blank">Metadata</Link>}
        </div>
      )}
    </div>
  );
};

export default NFTItem;
```

</details> 

### [➡️ Next lesson: Extra Challenges](./lesson-8-extra.md)