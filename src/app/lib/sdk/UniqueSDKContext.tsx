"use client";

import {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AssetHubInstance } from "@unique-nft/sdk";
import { connectSdk } from "./connect";

export type SdkContextValueType = {
  sdk?: AssetHubInstance;
};

export const SdkContext = createContext<SdkContextValueType>({
  sdk: undefined,
});

export const baseUrl = process.env.NEXT_PUBLIC_REST_URL || "";

export const SdkProvider = ({ children }: PropsWithChildren) => {
  const [sdk, setSdk] = useState<AssetHubInstance>();

  useEffect(() => {
    const connect = async () => {
      const sdk = await connectSdk(baseUrl);
      setSdk(sdk);
    };
    connect();
  }, []);

  return (
    <SdkContext.Provider value={useMemo(() => ({ sdk }), [sdk])}>
      {children}
    </SdkContext.Provider>
  );
};
