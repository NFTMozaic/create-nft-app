'use client';

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Loader } from './Loader';
import PolkadotNFT from '../../contracts/out/PolkadotNFT.sol/PolkadotNFT.json';

// Use the ABI from the compiled contract
// Run pnpm contracts:build to generate the ABI
const POLKADOT_NFT_ABI = PolkadotNFT.abi;

export function MintNFTButton() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Pre-uploaded metadata URI
  const METADATA_URI =
    'ipfs://bafkreigwmoyzxoens6zw4yqmd4pyaooqsbsbfgsoi3d5xwsslyez4nvlrq';

  const handleMint = async () => {
    if (!address) return;

    writeContract({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
      abi: POLKADOT_NFT_ABI,
      functionName: 'safeMint',
      args: [address, METADATA_URI],
    });
  };

  useEffect(() => {
    if (isSuccess && !isConfirming) {
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        queryClient.invalidateQueries({ queryKey: ['user-nfts', address] });
        queryClient.refetchQueries({ queryKey: ['user-nfts', address] });
      }, 2000);
    }
  }, [isSuccess, isConfirming, queryClient, address]);

  if (!address) {
    return (
      <button className="mint-button" disabled>
        Connect Wallet to Mint
      </button>
    );
  }

  return (
    <button
      className="mint-button"
      onClick={handleMint}
      disabled={isPending || isConfirming}
    >
      {isPending || isConfirming ? (
        <Loader message="" />
      ) : showSuccess ? (
        'Success!'
      ) : (
        'Mint NFT'
      )}
    </button>
  );
}
