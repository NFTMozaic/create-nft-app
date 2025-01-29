"use client";

import styles from "./page.module.css";
import { SdkContext } from "./lib/sdk/UniqueSDKContext";
import { useContext, useEffect, useState } from "react";
import PolkadotWalletSelector from "@/app/components/accounts/PolkadotWalletSelector";
import { AccountsContext } from "@/app/lib/wallets";

export default function Home() {
  const { sdk } = useContext(SdkContext);
  const accountContext = useContext(AccountsContext);
  const [balance, setBalance] = useState("");

  useEffect(() => {
    const query = async () => {
      if (!sdk || !accountContext?.activeAccount) return;
      console.log(sdk.options.baseUrl);
      const balance = await sdk.balance.get({
        address: accountContext.activeAccount.address,
      });
      setBalance(balance.available);
    };

    query();
  }, [sdk, accountContext]);

  return (
    <div className={styles.page}>
      <h2>Balance is {balance !== "" ? balance : "I don't know yet"}</h2>
      <PolkadotWalletSelector></PolkadotWalletSelector>
    </div>
  );
}
