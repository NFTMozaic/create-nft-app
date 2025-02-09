"use client";

import { UniqueSDKProvider } from "@/app/lib/sdk";
import { AccountsProvider } from "@/app/lib/wallets";
import { type ReactNode } from "react";

export function Providers(props: { children: ReactNode }) {
  return (
    <AccountsProvider>
      <UniqueSDKProvider>{props.children}</UniqueSDKProvider>
    </AccountsProvider>
  );
}
