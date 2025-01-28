"use client";

import { SdkProvider } from "@/lib/sdk/UniqueSdkContext";
import { AccountsProvider } from "@/lib/wallets";
import { type ReactNode } from "react";

export function Providers(props: { children: ReactNode }) {
  return (
    <AccountsProvider>
      <SdkProvider>{props.children}</SdkProvider>
    </AccountsProvider>
  );
}
