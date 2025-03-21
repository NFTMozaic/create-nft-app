"use client";

import {
  createContext,
  PropsWithChildren,
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
  const [sdk] = useState(() => AssetHub({ baseUrl }));

  const sdkValue = useMemo(() => ({ sdk }), [sdk]);

  return (
    <UniqueSDKContext.Provider value={sdkValue}>
      {children}
    </UniqueSDKContext.Provider>
  );
};

export const useSdkContext = () => {
  const context = useContext(UniqueSDKContext);
  if (!context) {
    throw new Error("useSdkContext must be used within a UniqueSDKProvider");
  }
  return context;
};
