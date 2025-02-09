"use client";

import { useCallback, useContext, useEffect, useState } from "react";
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
  const [transactionSent, setTransactionSent] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState<
    boolean | undefined
  >(undefined);

  const getBalance = useCallback(async () => {
    if (!sdk || !accountContext?.activeAccount) return;
    const bal = await sdk.balance.get({
      address: accountContext.activeAccount.address,
    });
    setBalance(bal.available);
  }, [accountContext, sdk]);

  useEffect(() => {
    getBalance();
  }, [getBalance]);

  const transferBalance = async () => {
    const account = accountContext?.activeAccount;
    if (!sdk || !account || !toAddress || !amount) return;

    try {
      setTransactionSent(true);
      await sdk.balance.transfer(
        { to: toAddress, amount },
        { signerAddress: account.address },
        // TODO: update @unique-nft/utils
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { signer: account.signer as any }
      );
      setTransactionSuccess(true);
    } catch {
      setTransactionSuccess(false);
    } finally {
      getBalance();
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (transactionSuccess !== undefined) {
      timer = setTimeout(() => {
        setTransactionSuccess(undefined);
        setTransactionSent(false);
      }, 5000);
    }

    return () => clearTimeout(timer);
  }, [transactionSuccess]);

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

          {transactionSent && transactionSuccess === undefined && (
            <p>Transaction sent, please wait...</p>
          )}

          {transactionSuccess === true && <p>Transaction success!</p>}
          {transactionSuccess === false && <p>Transaction failed</p>}
        </div>
      )}
    </div>
  );
}
