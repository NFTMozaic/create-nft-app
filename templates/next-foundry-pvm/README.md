# Polkadot NFT dApp Template

A full-stack NFT dApp template for the Polkadot ecosystem built with Next.js, Wagmi, and Foundry. This template provides a complete solution for creating, minting, and viewing NFTs on Polkadot's Passet Hub testnet.

## Features

- **Next.js 15** with App Router for modern React development
- **Reown AppKit** for seamless Polkadot wallet connectivity
- **Wagmi v2** for Ethereum wallet integration
- **Foundry** for smart contract development and deployment
- **Polkadot Passet Hub** testnet integration

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended) or npm
- [Foundry-Polkadot](https://github.com/paritytech/foundry-polkadot) for Polkadot contract support

## Creating an App

1. **Create a new app using:**

   ```bash
   npx create-polkadot-nft
   ```

   This command creates the following structure:

   ```
   ├── contracts/          # Foundry smart contracts
   │   ├── src/            # Solidity source files
   │   ├── out/            # Compiled contracts
   │   └── foundry.toml    # Foundry configuration
   ├── src/
   │   ├── app/            # Next.js App Router pages
   │   ├── components/     # React components
   │   ├── hooks/          # Custom React hooks
   │   ├── context/        # React context providers
   │   ├── lib/            # Utility functions
   │   └── config/         # Configuration files
   ├── public/             # Static assets
   └── package.json        # Dependencies and scripts
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Install contract dependencies**
   ```bash
   pnpm run contracts:install
   ```

## Configuration

1. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

2. **Configure Environment Variables**

   Edit `.env` with your specific values:

   ```env
   # Get your Project ID from https://cloud.reown.com
   NEXT_PUBLIC_PROJECT_ID=your_reown_project_id_here

   # Polkadot Passet Hub testnet configuration
   NEXT_PUBLIC_BLOCKSCOUT_URL=https://blockscout-passet-hub.parity-testnet.parity.io
   NEXT_PUBLIC_RPC_URL=https://testnet-passet-hub-eth-rpc.polkadot.io

   # Your deployed NFT contract address
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xb2428df8e9E0fed2A8c6F0311190ecEa11c80c31
   ```

3. **Get Testnet Tokens**
   - Visit [Polkadot Faucet](https://faucet.polkadot.io/?parachain=1111) to get testnet tokens
   - Use [Polkadot Apps UI](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Ftestnet-passet-hub.polkadot.io#/explorer) to view your account

## Smart Contract Development

Polkadot virtual machine requires a different compiler called `resolc`. It will be automatically installed with `foundry-polkadot`. You can find the installation guide in the [official documentation](https://github.com/paritytech/foundry-polkadot?tab=readme-ov-file#1-installation-instruction).

### Building Contracts

```bash
pnpm run contracts:build
```

### Deploying Contracts

```bash
# Set your private key
export ETH_PRIVATE_KEY=your_private_key_here

# Deploy the NFT contract
forge create PolkadotNFT \
  --resolc \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io \
  --private-key $ETH_PRIVATE_KEY \
  --broadcast -vvvvv \
  --constructor-args "Collection Name" "SYM" "https://your-metadata-uri.com/"
```

### Minting NFTs

```bash
# Mint a new NFT
cast send $CONTRACT_ADDRESS \
  "safeMint(address,string)" \
  $RECIPIENT_ADDRESS \
  "https://your-token-metadata-uri.com/" \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io \
  --private-key $ETH_PRIVATE_KEY
```

## 🔗 Useful Links

- [Reown Cloud](https://cloud.reown.com) - Get your Project ID
- [Reown Documentation](https://docs.reown.com) - AppKit documentation
- [Polkadot Passet Hub Faucet](https://faucet.polkadot.io/?parachain=1111) - Get testnet tokens
- [Polkadot Apps UI](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Ftestnet-passet-hub.polkadot.io#/explorer) - Block explorer
- [Blockscout](https://blockscout-passet-hub.parity-testnet.parity.io/) - EVM block explorer
- [Foundry-Polkadot](https://github.com/paritytech/foundry-polkadot) - Polkadot contract development
- [Wagmi Documentation](https://wagmi.sh/) - React hooks for Ethereum
- [Next.js Documentation](https://nextjs.org/docs) - Next.js framework docs

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, join the [NFTMozaic official Telegram group](https://t.me/nft_moz_support).

---

**Happy building! 🚀**
