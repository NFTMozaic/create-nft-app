'use client';

import { MultiAddress } from '@polkadot-api/descriptors';
import { usePolkadot } from '../contexts/PolkadotContext';
import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

export function useTransferBalance() {
  const { api } = usePolkadot();
  const { selectedAccount } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transferBalance = async (recipient: string, amount: bigint) => {
    if (!api) throw new Error('API not connected');

    setIsSubmitting(true);
    setError(null);

    try {
      const tx = api.tx.Balances.transfer_keep_alive({
        dest: MultiAddress.Id(recipient),
        value: amount,
      });

      // TODO: !
      const result = await tx.signAndSubmit(
        selectedAccount?.polkadotSigner!
      );

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    transferBalance,
    isSubmitting,
    error,
    clearError: () => setError(null),
  };
}
