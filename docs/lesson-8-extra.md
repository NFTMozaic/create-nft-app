# 🚀 Extra Challenges: Taking Your NFT App Further

Now that you've built the core functionality of your NFT application, here are some optional challenges to expand and refine your project. These improvements will help you enhance wallet support, improve the user experience, and integrate better metadata storage solutions.

## 1. Enhance Wallet Support

Right now, your app only supports the `Polkadot.js` wallet. Expand it to support multiple wallets. Here are a few ways:

1. Accept wallet name as a parameter instead of hardcoding `polkadot-js`.
2. Use a third-party library like `@talismn/connect-wallets` to support wallets like Talisman, SubWallet, and Nova Wallet.
3. Provide a way to choose an active account instead of setting the first one.
   
### Improve `PolkadotWalletSelector` component

1. Show your component in a modal window. Display the available wallets as a list and let users select their preferred wallet. 
2. Provide a selector that will give a way to choose active account

## 2. Improve Component Styles
Your components are functional, but they could look even better!

1. Refine the UI using Tailwind CSS by improving button styles, spacing, and layouts.
2. Make the app mobile-friendly by ensuring that forms and buttons scale well on smaller screens.

## 3. Store Metadata Efficiently with Pinata

Currently, users must manually enter a metadata URL when minting an NFT. Instead, integrate `Pinata` to automate metadata storage.

1. Use the [Pinata API](https://docs.pinata.cloud/quickstart) to upload JSON metadata automatically.
2. Modify your `TokenCreationForm` and `CollectionCreationForm` components to give the user the ability to attach an image and set metadata such as name, description and attributes.

## 4. Add NFT transfers

Use `sdk.nftsPallet.item.transfer` method.

## 5. Turn your application into the marketplace

`nfts` pallet has built-in support for NFT trading.

- Check and implement the SDK methods under `sdk.nftsPallet.trade`
- Add UI to put NFTs on sale and buy them
