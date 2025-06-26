# 🎨 Lesson 6: Creating NFTs

In this lesson, you'll create NFTs on Asset Hub using the Unique SDK. You'll build components that allow users to mint NFTs and retrieve NFT details.

## 1. Setting Up the NFT Creation Component

Create a new file: `components/TokenCreationForm.tsx`

Paste this code:

```ts
import { useState } from "react";
import { useAccountsContext } from "@/context/AccountsContext";
import { useSdkContext } from "@/context/UniqueSDKContext";

const TokenCreationForm = () => {
  const { activeAccount } = useAccountsContext();
  const { sdk } = useSdkContext();

  const [collectionId, setCollectionId] = useState("");
  const [itemId, setItemId] = useState("");
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

This component provides an interface for users to mint a new NFT into an existing collection on Asset Hub.

It retrieves the `activeAccount` from the `AccountsContext` to ensure a connected wallet is required. It also accesses the `sdk` instance from `UniqueSDKContext` to interact with Asset Hub.

The component manages three pieces of state: `collectionId` and `itemId`, which represent the NFT's collection and item identifiers, and `status`, which provides feedback to the user.

When the user clicks the "Mint NFT" button, the `handleCreateToken` function executes. It first validates that the SDK and wallet are available, and that valid collection and item IDs have been entered. If all conditions are met, it calls `sdk.nftsPallet.item.mint`, which attempts to create the NFT and assign it to the connected wallet's address.

If successful, the component updates the status to display the new NFT's ID. If an error occurs, it provides a meaningful error message.

## 2. Create NFTItem component

> [!NOTE]
> This lesson provides a simplified version of fetching NFT details.
> To retrieve all NFTs owned by a user, an indexer is required because there is no efficient way to query all NFTs across multiple collections directly from the blockchain. You can use indexer by [Koda](https://github.com/kodadot/stick/tree/main/src) to fetch and display all NFTs owned by an account.

Create `components/NFTItem.tsx`:

```ts
import { useCallback, useState } from "react";
import { useAccountsContext } from "@/context/AccountsContext";
import { useSdkContext } from "@/context/UniqueSDKContext";

const NFTItem = () => {
  const { activeAccount } = useAccountsContext();
  const { sdk } = useSdkContext();

  const [collectionId, setCollectionId] = useState("");
  const [itemId, setItemId] = useState("");
  const [nft, setNft] = useState<{ itemId: number; owner: string } | null>(null);
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

        setNft({ itemId: nftData.itemId, owner: nftData.owner });
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
        </div>
      )}
    </div>
  );
};

export default NFTItem;
```

This component allows users to fetch and display details of a specific NFT by entering its collection and item IDs.

Like `TokenCreationForm`, it retrieves the `activeAccount` and `sdk` instances from their respective contexts. The user inputs a collection ID and an item ID, which are stored in state.

When the "Fetch NFT" button is clicked, the `fetchNfts` function executes. If the SDK and active account are available, it sends a request using `sdk.nftsPallet.item.get`, retrieving the NFT's owner and ID.

Since Asset Hub does not provide an indexer to fetch all NFTs owned by an account, users must enter a specific collection and item ID to retrieve NFT details. The retrieved data is then displayed in a styled container.

## 3. Integrating components

Add components to your homepage `app/page.tsx`:

```ts
"use client";

import CollectionList from "@/components/CollectionList";
import CollectionCreationForm from "@/components/CollectionCreationForm";
import NFTItem from "@/components/NFTItem";
import PolkadotWalletSelector from "@/components/PolkadotWalletSelector";
import TokenCreationForm from "@/components/TokenCreationForm";

export default function Home() {
  return (
    <div className="flex flex-wrap justify-center items-start gap-6 p-6 bg-gray-50 min-h-screen">
      <PolkadotWalletSelector />
      <div>
        <CollectionCreationForm />
        <CollectionList />
      </div>
      <div>
        <TokenCreationForm />
        <NFTItem />
      </div>
    </div>
  );
}
```

## 🧪 Testing the Component

Steps to Verify:

- Connect your wallet using the Wallet Selector.
- Create an NFT using one of the previously created collection
- Query your newly created token

## 🚀 Next Steps

🎉 At this moment, your collections and NFTs are just a shell. What makes NFTs valuable is associated metadata. In the following lesson, we will learn how to add some to your NFTs.

### [➡️ Next lesson: Setting metadata](./lesson-7-metadata.md)
