# assethub-next
🔗 The AssetHub + Next.js template 🔗

## Set up local dev environment

#### 1. Set your secrets

Put your secrets to the [`secret.ts`](./src/sdk/secret.ts) (under `.gitignore`).

- `pinataJwt`: get your Pinata JWT token for free on the [Pinata Cloud](https://pinata.cloud/). After registration, go to the [API keys section](https://app.pinata.cloud/developers/api-keys) and generate your API key. Save the JWT token.
- `substrateSecret`: generate random mnemonic seed phrase. Use `polkadot{.js}` or any other wallet to generate a 12-word mnemonic secret phrase. You may also use built-in secrets such as `//Alice` or `//Bob`.

#### 2. Spin up local testnet and SDK

You are good to go if you decide to use the `Alice` account. Otherwise – add your address to the chopsticks config file: [`kusama-assethub.yml`](./kusama-assethub.yml).

Run local SDK against Kusama fork (powered by Acala Chopsticks):

```sh
docker compose up
```

- The network will be launched at port `8002` (`ws://localhost:8002`). You may want to check your accounts and balances on the [polkadot apps](https://polkadot.js.org/apps/?rpc=ws://localhost:8002#/accounts). 
- The SDK will be launched at port `3333` (`http://localhost:3333`). Check the raw HTTP methods at [http://localhost:3333/documentation/static/index.html](http://localhost:3333/documentation/static/index.html)