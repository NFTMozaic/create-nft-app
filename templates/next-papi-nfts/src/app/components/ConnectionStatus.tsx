'use client';

import { usePolkadot } from '../contexts/PolkadotContext';

export const ConnectionStatus = () => {
  const { isConnected, error } = usePolkadot();

  return (
    <div style={{ 
      padding: '1rem', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      margin: '1rem 0',
      backgroundColor: isConnected ? '#e8f5e8' : '#ffe8e8'
    }}>
      <h3>AssetHub Connection Status</h3>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        marginTop: '0.5rem'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: isConnected ? '#4caf50' : '#f44336'
        }} />
        <span>
          {isConnected ? 'Connected to AssetHub' : 'Disconnected'}
        </span>
      </div>
      {error && (
        <div style={{ 
          marginTop: '0.5rem', 
          color: '#f44336', 
          fontSize: '0.875rem' 
        }}>
          Error: {error}
        </div>
      )}
    </div>
  );
}; 