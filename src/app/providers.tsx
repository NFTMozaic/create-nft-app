"use client";

import { SdkProvider } from "@/app/lib/sdk/UniqueSDKContext";
import { AccountsProvider } from "@/app/lib/wallets";
import { type ReactNode } from "react";

export function Providers(props: { children: ReactNode }) {
  return (
    <AccountsProvider>
      <SdkProvider>{props.children}</SdkProvider>
    </AccountsProvider>
  );
}
