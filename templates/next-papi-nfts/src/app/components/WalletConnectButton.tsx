'use client';

import React from 'react';
import { useWallet } from '../contexts/WalletContext';

export const WalletConnectButton: React.FC = () => {
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
        style={{
          padding: '8px 16px',
          backgroundColor: '#f3f4f6',
          color: '#111827',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          textAlign: 'left'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e5e7eb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span>{selectedAccount.name || 'Account'}</span>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            {shortenAddress(selectedAccount.address)}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '8px 16px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#2563eb';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#3b82f6';
      }}
    >
      Connect Wallet
    </button>
  );
};