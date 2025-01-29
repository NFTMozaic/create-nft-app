import { AssetHub } from "@unique-nft/sdk";
import { ISr25519Account } from "@unique-nft/sr25519";

export const connectSdk = async (
  sdkEndpoint: string,
  account?: ISr25519Account
) => {
  const uniqueChain = AssetHub({
    baseUrl: sdkEndpoint,
    account,
  });

  return uniqueChain;
};

export type AssetHubType = ReturnType<typeof AssetHub>;
