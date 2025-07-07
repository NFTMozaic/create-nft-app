'use client';

import React from 'react';
import { useWallet } from '../../contexts/WalletContext';

export const ConnectButton: React.FC = () => {
  const { 
    selectedWallet, 
    selectedAccount 
  } = useWallet();

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleClick = () => {
    const event = new CustomEvent('open-wallet-modal');
    window.dispatchEvent(event);
  };

  if (selectedWallet && selectedAccount) {
    return (
      <button
        onClick={handleClick}
        className="connect-button-connected"
      >
        <div className="connect-button-content">
          <span>{selectedAccount.name || 'Account'}</span>
          <span className="connect-button-address">
            {shortenAddress(selectedAccount.address)}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="connect-button"
    >
      Connect Wallet
    </button>
  );
};