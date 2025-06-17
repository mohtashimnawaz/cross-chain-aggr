import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet, WalletContextState } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextType {
  connection: Connection | null;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  disconnect: () => void;
  wallet: WalletContextState;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [connection, setConnection] = useState<Connection | null>(null);

  // Use localhost for development
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);

  useEffect(() => {
    const conn = new Connection(endpoint, 'confirmed');
    setConnection(conn);
  }, [endpoint]);

  const wallet = useWallet();

  const value: WalletContextType = {
    connection,
    publicKey: wallet.publicKey,
    connected: wallet.connected,
    connecting: wallet.connecting,
    disconnect: wallet.disconnect,
    wallet,
  };

  return (
    <WalletContext.Provider value={value}>
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </WalletContext.Provider>
  );
};

export { WalletMultiButton }; 