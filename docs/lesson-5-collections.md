# 🎨 Lesson 5: Creating an NFT Collection on Asset Hub

In this lesson, you'll build a Collection Creation Component that allows users to create an NFT collection on Polkadot's Asset Hub.

## 2. Setting Up the Collection Creation Component

📌 Why Do We Need This Component?
Before minting NFTs, we need a collection to store them. This component will:

✅ Let users define collection attributes (name, description, cover image).

✅ Create the collection on Asset Hub via the Unique SDK.

Create a new file: `components/CollectionCreationForm.tsx`

> ![NOTE]
> This form provides a minimal example of creating an NFT collection. In future lessons, we'll cover how to add metadata, customize attributes, and configure collection-level settings.

Paste this code:

```ts
import { useState } from "react";
import { useAccountsContext } from "@/context/AccountsContext";
import { useSdkContext } from "@/context/UniqueSDKContext";

const CollectionCreationForm = () => {
  const { activeAccount } = useAccountsContext();
  const { sdk } = useSdkContext();

  const [status, setStatus] = useState("");

  const handleCreateCollection = async () => {
    if (!sdk) {
      return;
    }

    if (!activeAccount) {
      setStatus("⚠️ Please connect your wallet first!");
      return;
    }

    try {
      setStatus("⏳ Creating collection on Asset Hub...");
      const { result } = await sdk.nftsPallet.collection.create({});

      if (result.collectionId) {
        setStatus(`✅ Collection Created! ID: ${result.collectionId}`);
      } else {
        setStatus("❌ Failed to create collection.");
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
        Create NFT Collection
      </h2>

      <button
        onClick={handleCreateCollection}
        className="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition"
      >
        Create Collection
      </button>

      {status && <p className="mt-4 text-sm text-gray-700 text-center">{status}</p>}
    </div>
  );
};

export default CollectionCreationForm;
```

This component provides users with a simple interface to create an NFT collection on Asset Hub.

It retrieves the `activeAccount` from the `AccountsContext` to ensure that a connected wallet is required before proceeding. It also accesses the `sdk` instance from `UniqueSDKContext` to interact with Asset Hub.

The `handleCreateCollection` function is triggered when the user clicks the "Create Collection" button. It first checks if the SDK and an active wallet connection exist. If either is missing, the function stops execution and updates the status message accordingly.

If everything is set up correctly, the function attempts to create a new NFT collection using `sdk.nftsPallet.collection.create({})`. Upon success, the UI will be updated with the new collection ID. If the operation fails, an error message is displayed.

The component maintains a `status` state, which is updated throughout the process to provide feedback to the user. This ensures clear communication on whether the collection creation was successful, failed, or still in progress.

## 2. Create CollectionList component

The `CollectionList` component retrieves and displays all NFT collections associated with the connected wallet. It allows users to view the existing collections created on Asset Hub.

Create the `components/CollectionList.tsx` file.

```ts
import { useEffect, useState } from "react";
import { useAccountsContext } from "@/context/AccountsContext";
import { useSdkContext } from "@/context/UniqueSDKContext";

const CollectionList = () => {
  const { activeAccount } = useAccountsContext();
  const { sdk } = useSdkContext();

  const [collectionIds, setCollectionIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchCollection = async () => {
      if (!sdk || !activeAccount) {
        setCollectionIds([]);
        return;
      }

      const { collections } = await sdk.nftsPallet.account.getCollections({
        account: activeAccount.address,
      });

      setCollectionIds(collections ?? []);
    };

    fetchCollection();
  }, [activeAccount, sdk]);

  return (
    <div className="flex flex-col items-center p-6 bg-white shadow-md rounded-xl border w-80">
      <h2 className="text-lg font-semibold text-gray-900 text-center mb-4">
        Your Collections
      </h2>

      {collectionIds.length > 0 ? (
        <ul className="w-full space-y-2">
          {collectionIds.map((id) => (
            <li
              key={id}
              className="p-2 bg-gray-100 rounded-lg text-gray-700 text-center text-sm"
            >
              Collection ID: {id}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm text-center">No collections found.</p>
      )}
    </div>
  );
};

export default CollectionList;
```

This component retrieves and displays all NFT collections associated with the currently connected account.

It accesses the `sdk` instance and `activeAccount` from their respective contexts. When the component mounts or when the active account changes, it fetches the user's collections from Asset Hub using `sdk.nftsPallet.account.getCollections({ account: activeAccount.address })`.

## 3. Integrating components

To integrate collection management features, add the `CollectionCreationForm` and `CollectionList` components to your homepage.

```ts
"use client";

import CollectionList from "@/components/CollectionList";
import CollectionCreationForm from "@/components/CollectionCreationForm";
import PolkadotWalletSelector from "@/components/PolkadotWalletSelector";

export default function Home() {
  return (
    <div className="flex flex-wrap justify-center items-start gap-6 p-6 bg-gray-50 min-h-screen">
      <PolkadotWalletSelector />
      <div>
        <CollectionCreationForm />
        <CollectionList />
      </div>
    </div>
  );
}
```

## 🧪 Testing the Component

Steps to Verify:
- Connect your wallet using the Wallet Selector.
- Click "Create Collection" - watch for updates in the status field.
- Check the console for transaction details.

## 🚀 Next Steps
🎉 Your collection is now on Asset Hub! Next, we'll mint NFTs into this collection using uploaded metadata.

### [➡️ Next lesson: Creating NFTs](./lesson-6-nfts.md)