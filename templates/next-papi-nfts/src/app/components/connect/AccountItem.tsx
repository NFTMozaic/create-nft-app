interface AccountItemProps {
  account: {
    address: string;
    name?: string;
  };
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const AccountItem: React.FC<AccountItemProps> = ({
  account,
  index,
  isSelected,
  onSelect,
}) => {
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <button
      onClick={onSelect}
      className={`account-item ${isSelected ? 'account-item-selected' : ''}`}
    >
      <span className="account-item-name">
        {account.name || `Account ${index + 1}`}
      </span>
      <span className="account-item-address">
        {shortenAddress(account.address)}
      </span>
    </button>
  );
};
