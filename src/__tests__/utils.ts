import { AssetHub } from "@unique-nft/sdk";
import Sr25519Account from "@unique-nft/sr25519";
import config from "./config";

export const initSdk = () => {
  const privateKey = config.mnemonic;
  const account = Sr25519Account.fromUri(privateKey);

  const ah = AssetHub({
    baseUrl: "http://localhost:3333",
    account,
  });

  return { ah, account };
};
