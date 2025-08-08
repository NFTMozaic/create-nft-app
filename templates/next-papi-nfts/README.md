# Polkadot PAPI NFT Template

## Setup

1. Install packages

```sh
pnpm install
```

2. Download metadata from your target chain:

```sh
npx papi add dot -n paseo_asset_hub
```

Or use a websocket URL:

```sh
npx papi add dot -w wss://...
```

## PAPI

[PAPI Context](src/app/contexts/PolkadotContext.tsx) connects via light client (smoldot).

See [examples](src/app/hooks) for queries and transactions.

Official docs: https://papi.how

## Wallets

[WalletContext](src/app/contexts/WalletContext.tsx) integrates talisman-connect.

## Indexer

Use Kodadot's GraphQL [NFT indexer](https://github.com/kodadot/stick). JavaScript SDK: [unique-query](https://github.com/kodadot/uniquery)

## Tutorial

Building NFT application tutorial coming soon.