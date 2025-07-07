'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getWallets, Wallet, WalletAccount } from '@talismn/connect-wallets';
import { InjectedPolkadotAccount } from 'polkadot-api/pjs-signer';

interface WalletContextType {
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  accounts: WalletAccount[];
  selectedAccount: WalletAccount | null;
  isConnecting: boolean;
  connect: (walletName: string) => Promise<void>;
  disconnect: () => void;
  selectAccount: (address: string) => void;
  getInjectedAccount: (address: string) => Promise<InjectedPolkadotAccount | null>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

const STORAGE_KEY = 'wallet-connection';

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load wallets on mount
  useEffect(() => {
    const supportedWallets = getWallets();
    setWallets(supportedWallets);
    setIsInitialized(true);
  }, []);

  // Auto-connect from localStorage
  useEffect(() => {
    if (!isInitialized) return;

    const loadSavedConnection = async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        const { walletName, accountAddress } = JSON.parse(saved);
        if (!walletName) return;

        const wallet = wallets.find(w => w.extensionName === walletName);
        if (!wallet?.installed) return;

        setIsConnecting(true);
        await wallet.enable('Your dApp Name');
        const walletAccounts = await wallet.getAccounts();
        
        setSelectedWallet(wallet);
        setAccounts(walletAccounts);
        
        // Select the saved account if it exists
        const savedAccount = walletAccounts.find(acc => acc.address === accountAddress);
        if (savedAccount) {
          setSelectedAccount(savedAccount);
        } else if (walletAccounts.length > 0) {
          setSelectedAccount(walletAccounts[0]);
        }
      } catch (error) {
        console.error('Failed to auto-connect wallet:', error);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsConnecting(false);
      }
    };

    loadSavedConnection();
  }, [wallets, isInitialized]);

  const connect = async (walletName: string) => {
    setIsConnecting(true);
    try {
      const wallet = wallets.find(w => w.extensionName === walletName);
      if (!wallet) throw new Error('Wallet not found');

      await wallet.enable('Your dApp Name');
      const walletAccounts = await wallet.getAccounts();
      
      setSelectedWallet(wallet);
      setAccounts(walletAccounts);
      
      // Don't auto-select account - let user choose
      // But save wallet name for auto-reconnect
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        walletName, 
        accountAddress: null 
      }));
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setSelectedWallet(null);
    setAccounts([]);
    setSelectedAccount(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const selectAccount = (address: string) => {
    const account = accounts.find(acc => acc.address === address);
    if (account) {
      setSelectedAccount(account);
      // Save selection to localStorage
      if (selectedWallet) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          walletName: selectedWallet.extensionName,
          accountAddress: address
        }));
      }
    }
  };

  const getInjectedAccount = async (address: string): Promise<InjectedPolkadotAccount | null> => {
    if (!selectedWallet) return null;
    
    try {
      const injected = (window as any).injectedWeb3?.[selectedWallet.extensionName];
      if (!injected) return null;
      
      const accounts = await injected.accounts.get();
      const account = accounts.find((acc: any) => acc.address === address);
      
      if (!account) return null;
      
      return {
        address: account.address,
        name: account.name,
        polkadotSigner: injected.signer
      };
    } catch (error) {
      console.error('Failed to get injected account:', error);
      return null;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallets,
        selectedWallet,
        accounts,
        selectedAccount,
        isConnecting,
        connect,
        disconnect,
        selectAccount,
        getInjectedAccount
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};