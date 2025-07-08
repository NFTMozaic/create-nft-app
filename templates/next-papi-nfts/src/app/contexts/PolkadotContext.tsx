'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { dot } from "@polkadot-api/descriptors";
import { createClient, PolkadotClient, TypedApi } from "polkadot-api";
import { getSmProvider } from "polkadot-api/sm-provider";
import { start } from "polkadot-api/smoldot";
import { chainSpec } from "polkadot-api/chains/paseo_asset_hub";
import { chainSpec as chainSpecPaseo } from "polkadot-api/chains/paseo";

interface PolkadotContextType {
  client: PolkadotClient;
  api: TypedApi<typeof dot>;
  isConnected: boolean;
  error: string | null;
}

const PolkadotContext = createContext<PolkadotContextType | undefined>(undefined);

export const usePolkadot = () => {
  const context = useContext(PolkadotContext);
  if (!context) {
    throw new Error('usePolkadot must be used within a PolkadotProvider');
  }
  return context;
};

export const PolkadotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<any>(null);
  const [api, setApi] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeClient = async () => {
      try {
        setError(null);
        
        const sm = start();
        const relayChain = await sm.addChain({ chainSpec: chainSpecPaseo });
        
        const passetChain = await sm.addChain({
          chainSpec,
          potentialRelayChains: [relayChain],
        });
        
        const polkadotClient = createClient(getSmProvider(passetChain));
        setClient(polkadotClient);
        
        const dotApi = polkadotClient.getTypedApi(dot);
        setApi(dotApi);
        
        // Subscribe to finalized blocks to check connection
        polkadotClient.finalizedBlock$.subscribe({
          next: (finalizedBlock) => {
            console.log('Connected to Passet Hub Testnet:', finalizedBlock.number, finalizedBlock.hash);
            setIsConnected(true);
          },
          error: (err) => {
            console.error('Connection error:', err);
            setError(err.message);
            setIsConnected(false);
          }
        });
        
      } catch (err: any) {
        console.error('Failed to initialize Polkadot client:', err);
        setError(err.message);
        setIsConnected(false);
      }
    };

    initializeClient();
  }, []);

  return (
    <PolkadotContext.Provider value={{ client, api, isConnected, error }}>
      {children}
    </PolkadotContext.Provider>
  );
};
