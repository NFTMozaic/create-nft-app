"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PolkadotWalletSelector from "@/app/components/accounts/PolkadotWalletSelector";
import styles from "./page.module.css";
import { useAccountsContext, useSdkContext } from "@/context";

const DEFAULT_DECIMALS = 18;

export default function Home() {
  const { sdk } = useSdkContext();
  const accountContext = useAccountsContext();
  const [balance, setBalance] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionSent, setTransactionSent] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState<
    boolean | undefined
  >(undefined);
  const [decimals, setDecimals] = useState<number>(DEFAULT_DECIMALS);

  const getBalance = useCallback(async () => {
    if (!sdk || !accountContext?.activeAccount) return;

    try {
      const bal = await sdk.balance.get({
        address: accountContext.activeAccount.address,
      });
      setBalance(bal.available);
      setDecimals(bal.decimals);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      setBalance("0");
    }
  }, [accountContext?.activeAccount, sdk]);

  useEffect(() => {
    getBalance();
  }, [getBalance]);

  const transferBalance = async () => {
    const account = accountContext?.activeAccount;
    if (!sdk || !account || !toAddress || !amount) return;

    try {
      setTransactionSent(true);
      const amountInWei = BigInt(
        Math.floor(parseFloat(amount) * 10 ** decimals)
      );

      await sdk.balance.transfer(
        { to: toAddress, amount: amountInWei.toString() },
        { signerAddress: account.address },
        account
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

  const formattedBalance = useMemo(() => {
    if (!balance) return "...";
    try {
      const num = BigInt(balance)
        .toString()
        .padStart(decimals + 1, "0");
      return decimals
        ? `${num.slice(0, -decimals)}.${num.slice(-decimals)}`
        : num;
    } catch {
      return "";
    }
  }, [balance, decimals]);

  return (
    <div className={styles.page}>
      <PolkadotWalletSelector />

      {accountContext?.activeAccount && (
        <div className={styles.formWrap}>
          <h2>Balance is {formattedBalance}</h2>
          <input
            type="text"
            placeholder="Recipient Address"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={styles.input}
          />
          <button onClick={transferBalance} className={styles.walletButton}>
            Send
          </button>

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
