interface WalletItemProps {
  wallet: {
    title: string;
    logo?: { src: string; alt: string };
    installed?: boolean;
    extensionName: string;
  };
  isSelected: boolean;
  isConnecting: boolean;
  onClick: () => void;
}

export const WalletItem: React.FC<WalletItemProps> = ({
  wallet,
  isSelected,
  isConnecting,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={!wallet.installed || isConnecting}
      className="wallet-item"
    >
      {wallet.logo && (
        <img
          src={wallet.logo.src}
          alt={wallet.logo.alt}
          className="wallet-item-logo"
        />
      )}
      <span className="wallet-item-title">{wallet.title}</span>
      {isSelected && (
        <span className="wallet-item-status wallet-item-connected">
          Connected
        </span>
      )}
      {!wallet.installed && (
        <span className="wallet-item-not-installed">Not installed</span>
      )}
    </button>
  );
};
