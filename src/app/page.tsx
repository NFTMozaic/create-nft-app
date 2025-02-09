"use client";

import { useContext, useEffect, useState } from "react";
import PolkadotWalletSelector from "@/app/components/accounts/PolkadotWalletSelector";
import { UniqueSDKContext } from "./lib/sdk";
import { AccountsContext } from "@/app/lib/wallets";
import styles from "./page.module.css";

export default function Home() {
  const { sdk } = useContext(UniqueSDKContext);
  const accountContext = useContext(AccountsContext);
  const [balance, setBalance] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const query = async () => {
      if (!sdk || !accountContext?.activeAccount) return;
      const bal = await sdk.balance.get({
        address: accountContext.activeAccount.address,
      });
      setBalance(bal.available);
    };
    query();
  }, [sdk, accountContext]);

  const transferBalance = async () => {
    const account = accountContext?.activeAccount;
    if (!sdk || !account || !toAddress || !amount) return;

    try {
      await sdk.balance.transfer(
        { to: toAddress, amount },
        { signerAddress: account.address },
        // TODO: update @unique-nft/utils
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { signer: account.signer as any }
      );
      alert("Transfer successful");
    } catch (error) {
      console.error("Transfer failed", error);
      alert("Transfer failed");
    }
  };

  return (
    <div className={styles.page}>
      <PolkadotWalletSelector />

      {accountContext?.activeAccount && (
        <div>
          <h2>Balance is {balance !== "" ? balance : "..."}</h2>
          <input
            type="text"
            placeholder="Recipient Address"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
          />
          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={transferBalance}>Send</button>
        </div>
      )}
    </div>
  );
}
