"use client";

import { SdkProvider } from "@/lib/sdk/UniqueSdkContext";
import { type ReactNode } from "react";

export function Providers(props: { children: ReactNode }) {
  return <SdkProvider>{props.children}</SdkProvider>;
}
