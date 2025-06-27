import { ERC721Token as TokenData } from '@/lib/blockscout';
import { ERC721Token } from './ERC721Token';

interface TokenGridProps {
  tokens: TokenData[];
  gridClassName?: string;
  emptyMessage?: string;
}

export function TokenGrid({
  tokens,
  gridClassName = 'grid-auto',
  emptyMessage = 'No tokens found',
}: TokenGridProps) {
  if (!tokens || tokens.length === 0) {
    return <div className="empty">{emptyMessage}</div>;
  }

  return (
    <div className={gridClassName}>
      {tokens.map(token => (
        <ERC721Token key={`${token.token.address}-${token.id}`} token={token} />
      ))}
    </div>
  );
}
