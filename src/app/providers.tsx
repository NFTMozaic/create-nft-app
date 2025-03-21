"use client";

import { type ReactNode } from "react";
import { AccountsProvider, UniqueSDKProvider } from "@/context";

export function Providers(props: { children: ReactNode }) {
  return (
    <AccountsProvider>
      <UniqueSDKProvider>{props.children}</UniqueSDKProvider>
    </AccountsProvider>
  );
}
