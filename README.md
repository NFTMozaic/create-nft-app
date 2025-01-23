# assethub-next
🔗 The AssetHub + Next.js template 🔗

## Set up local dev environment

#### 1. Set your secrets

Put your secrets in the `.env` file, using [`env.example`](./env.example) as a template.

- `PINATA_JWT`: get your Pinata JWT token for free on the [Pinata Cloud](https://pinata.cloud/). After registration, go to the [API keys section](https://app.pinata.cloud/developers/api-keys) and generate your API key. Save the JWT token.
- `MNEMONIC`: generate a random mnemonic seed phrase. Use [`polkadot{.js}`](https://polkadot.js.org/extension/) or any other wallet to generate a 12-word mnemonic secret phrase. For the test environment and this example, you may also use built-in secrets such as `//Alice` or `//Bob`.

#### 2. Spin up local testnet and SDK

We'll run a local SDK against Kusama fork (powered by Acala Chopsticks). Your computer should have Docker installed.

You are good to go if you use the `//Alice` account in your `.env`. Otherwise, add your address to the chopsticks config file: [`kusama-assethub.yml`](./kusama-assethub.yml) and set some balance.

Then run:

```sh
docker compose up
```

- The network will be launched at port `8002` (`ws://localhost:8002`). You may want to check your accounts and balances on the [polkadot apps](https://polkadot.js.org/apps/?rpc=ws://localhost:8002#/accounts). 
- The SDK will be launched at port `3333` (`http://localhost:3333`). Check the raw HTTP methods at [http://localhost:3333/documentation/static/index.html](http://localhost:3333/documentation/static/index.html)

#### 3. Understand how SDK works

> [!IMPORTANT]
> Ensure your test environment is running based on the previous steps.

Go to the [`__tests__`](./src/__tests__/) directory, read and execute test. Using VS Code, you may debug tests with breakpoints using [`vitest.explorer`](https://marketplace.visualstudio.com/items?itemName=vitest.explorer) extension.

## Collection metadata 101

...