import { ERC721Token as TokenData } from '@/lib/blockscout';
import { useState } from 'react';
import Image from 'next/image';
import styles from './ERC721Token.module.css';

interface ERC721TokenProps {
  token: TokenData;
}

export function ERC721Token({ token }: ERC721TokenProps) {
  const [imageError, setImageError] = useState(false);

  const getImageUrl = (url: string) => {
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    return url;
  };

  return (
    <div className={styles.token}>
      <div className="card-header">
        {token.metadata?.image && (
          <div className={styles.imageContainer}>
            {imageError ? (
              <div className={styles.imagePlaceholder}>
                <div className={styles.placeholderIcon}>✕</div>
              </div>
            ) : (
              <Image
                src={getImageUrl(token.metadata.image)}
                alt={token.metadata?.name || 'NFT'}
                width={48}
                height={48}
                className={styles.tokenImage}
                onError={() => setImageError(true)}
              />
            )}
          </div>
        )}
        <div className={styles.tokenInfo}>
          <h3 className="card-title">#{token.id}</h3>
          <p className="card-subtitle">{token.metadata?.name || 'Unnamed'}</p>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.row}>
          <span className={styles.label}>Owner:</span>
          <span className={styles.value}>
            {token.owner
              ? `${token.owner.hash.slice(0, 6)}...${token.owner.hash.slice(-4)}`
              : 'Unknown'}
          </span>
        </div>
      </div>
      <a
        href={`${process.env.NEXT_PUBLIC_BLOCKSCOUT_URL}/token/${token.token.address}/instance/${token.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        Block Explorer
      </a>
    </div>
  );
}
