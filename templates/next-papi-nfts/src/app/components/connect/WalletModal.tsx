'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { AccountItem } from './AccountItem';
import { DisconnectButton } from './DisconnectButton';
import { ModalHeader } from './ModalHeader';
import { ModalOverlay } from './ModalOverlay';
import { WalletItem } from './WalletItem';

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

  const handleClose = () => {
    setIsOpen(false);
    setShowAccounts(false);
  };

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
    handleClose();
  };

  const handleBack = () => {
    setShowAccounts(false);
  };

  const handleDisconnect = () => {
    disconnect();
    handleClose();
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={handleClose}>
      <ModalHeader
        title={showAccounts ? 'Select Account' : 'Connect Wallet'}
        onClose={handleClose}
        onBack={handleBack}
        showBackButton={showAccounts}
      />

      <div className="modal-content">
        {!showAccounts ? (
          <>
            {wallets.length === 0 ? (
              <div className="modal-empty-state">No wallets found</div>
            ) : (
              wallets.map(wallet => (
                <WalletItem
                  key={wallet.title}
                  wallet={wallet}
                  isSelected={
                    selectedWallet?.extensionName === wallet.extensionName
                  }
                  isConnecting={isConnecting}
                  onClick={() => handleWalletClick(wallet)}
                />
              ))
            )}

            {selectedAccount && <DisconnectButton onClick={handleDisconnect} />}
          </>
        ) : (
          // Account selection
          <>
            {accounts.length > 0 ? (
              accounts.map((account, index) => (
                <AccountItem
                  key={account.address}
                  account={account}
                  index={index}
                  isSelected={selectedAccount?.address === account.address}
                  onSelect={() => handleAccountSelect(account.address)}
                />
              ))
            ) : (
              <div className="modal-empty-state">No accounts found</div>
            )}

            {selectedAccount && <DisconnectButton onClick={handleDisconnect} />}
          </>
        )}
      </div>
    </ModalOverlay>
  );
};
