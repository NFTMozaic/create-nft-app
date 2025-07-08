interface DisconnectButtonProps {
  onClick: () => void;
}

export const DisconnectButton: React.FC<DisconnectButtonProps> = ({
  onClick,
}) => {
  return (
    <button onClick={onClick} className="disconnect-button">
      Disconnect Wallet
    </button>
  );
};
