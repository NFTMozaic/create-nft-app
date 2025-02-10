"use client";

import {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";
import { AssetHub, AssetHubInstance } from "@unique-nft/sdk";

export type SdkContextValueType = {
  sdk?: AssetHubInstance;
};

export const UniqueSDKContext = createContext<SdkContextValueType>({
  sdk: undefined,
});

export const baseUrl = process.env.NEXT_PUBLIC_REST_URL || "";

export const UniqueSDKProvider = ({ children }: PropsWithChildren) => {
  const [sdk, setSdk] = useState<AssetHubInstance>();

  useEffect(() => {
    const sdk = AssetHub({ baseUrl });
    setSdk(sdk);
  }, []);

  return (
    <UniqueSDKContext.Provider value={useMemo(() => ({ sdk }), [sdk])}>
      {children}
    </UniqueSDKContext.Provider>
  );
};


export const useSdkContext = () => useContext(UniqueSDKContext);