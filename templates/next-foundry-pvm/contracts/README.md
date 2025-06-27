# Polkadot Smart Contracts

## Tech

- [Foundry-Polkadot](https://github.com/paritytech/foundry-polkadot)
- [Soldeer](https://soldeer.xyz/)

## Development

1. Install [foundry-polkadot](https://github.com/paritytech/foundry-polkadot?tab=readme-ov-file#1-installation-instruction)
2. Build your contracts: `forge build --resolc`
3. Deploy contracts with forge

```sh
forge create PolkadotNFT --resolc --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io --private-key $ETH_PRIVATE_KEY --broadcast -vvvvv --constructor-args "Collection Name" "SYM" $CONTRACT_URI
```

4. Send transactions with cast

```sh
cast send $CONTRACT_ADDRESS \
  "safeMint(address,string)" \
  $CONTRACT_ADDRESS \
  $TOKEN_URI \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io \
  --private-key $ETH_PRIVATE_KEY
```

## Links

- Passet Hub Faucet: https://faucet.polkadot.io/?parachain=1111
- ETH RPC: https://testnet-passet-hub-eth-rpc.polkadot.io/
- Polkadot Apps UI: https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Ftestnet-passet-hub.polkadot.io#/explorer
- Blockscout - https://blockscout-passet-hub.parity-testnet.parity.io/
