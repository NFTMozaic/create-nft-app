'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '../contexts/WalletContext';

export const WalletModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const {
    wallets,
    accounts,
    selectedWallet,
    selectedAccount,
    connect,
    disconnect,
    selectAccount,
    isConnecting,
  } = useWallet();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenModal = () => {
      setIsOpen(true);
      if (selectedWallet && accounts.length > 0) {
        setShowAccounts(true);
      } else {
        setShowAccounts(false);
      }
    };
    window.addEventListener('open-wallet-modal', handleOpenModal);
    return () =>
      window.removeEventListener('open-wallet-modal', handleOpenModal);
  }, [selectedWallet, accounts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowAccounts(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleWalletClick = async (wallet: any) => {
    try {
      await connect(wallet.extensionName);
      setShowAccounts(true);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const handleAccountSelect = (address: string) => {
    selectAccount(address);
    setIsOpen(false);
    setShowAccounts(false);
  };

  const handleBack = () => {
    setShowAccounts(false);
  };

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
    setShowAccounts(false);
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div
        ref={modalRef}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '90%',
          margin: '0 16px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {showAccounts && (
              <button
                onClick={handleBack}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
              {showAccounts ? 'Select Account' : 'Connect Wallet'}
            </h2>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              setShowAccounts(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#666',
            }}
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div
          style={{
            padding: '16px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {!showAccounts ? (
            // Wallet selection
            <>
              {wallets.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    color: '#666',
                    padding: '20px',
                  }}
                >
                  No wallets found
                </div>
              ) : (
                wallets.map(wallet => (
                  <button
                    key={`${wallet.title}`}
                    onClick={() => handleWalletClick(wallet)}
                    disabled={!wallet.installed || isConnecting}
                    style={{
                      width: '100%',
                      padding: '12px',
                      marginBottom: '8px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      backgroundColor: wallet.installed ? 'white' : '#f5f5f5',
                      cursor: wallet.installed ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'background-color 0.2s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      if (wallet.installed) {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                      }
                    }}
                    onMouseLeave={e => {
                      if (wallet.installed) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    {wallet.logo && (
                      <img
                        src={wallet.logo.src}
                        alt={wallet.logo.alt}
                        style={{ width: '32px', height: '32px' }}
                      />
                    )}
                    <span style={{ flex: 1, textAlign: 'left' }}>
                      {wallet.title}
                    </span>
                    {selectedWallet?.extensionName === wallet.extensionName && (
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#10b981',
                          backgroundColor: '#d1fae5',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        Connected
                      </span>
                    )}
                    {!wallet.installed && (
                      <span style={{ fontSize: '14px', color: '#999' }}>
                        Not installed
                      </span>
                    )}
                  </button>
                ))
              )}

              {/* Disconnect button */}
              {selectedWallet && (
                <button
                  onClick={handleDisconnect}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '16px',
                    border: '1px solid #ef4444',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                >
                  Disconnect Wallet
                </button>
              )}
            </>
          ) : (
            // Account selection
            <>
              {accounts.length > 0 ? (
                accounts.map((account, index) => (
                  <button
                    key={account.address}
                    onClick={() => handleAccountSelect(account.address)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      marginBottom: '8px',
                      border:
                        selectedAccount?.address === account.address
                          ? '2px solid #3b82f6'
                          : '1px solid #e5e5e5',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '4px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (selectedAccount?.address !== account.address) {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>
                      {account.name || `Account ${index + 1}`}
                    </span>
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      {shortenAddress(account.address)}
                    </span>
                    {selectedAccount?.address === account.address && (
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#3b82f6',
                          fontWeight: 500,
                        }}
                      >
                        ✓ Selected
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    color: '#666',
                    padding: '20px',
                  }}
                >
                  No accounts found
                </div>
              )}

              {/* Disconnect button in account view */}
              <button
                onClick={handleDisconnect}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '16px',
                  border: '1px solid #ef4444',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#ef4444';
                }}
              >
                Disconnect Wallet
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
