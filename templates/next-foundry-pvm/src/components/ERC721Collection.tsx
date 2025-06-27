import { ERC721Collection as CollectionData } from '@/lib/blockscout';
import styles from './ERC721Collection.module.css';
import { useRouter } from 'next/navigation';

interface ERC721CollectionProps {
  collection: CollectionData;
}

export function ERC721Collection({ collection }: ERC721CollectionProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/collection/${collection.address}`);
  };

  const handleExplorerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(
      `${process.env.NEXT_PUBLIC_BLOCKSCOUT_URL}/token/${collection.address}`,
      '_blank'
    );
  };

  return (
    <div className={styles.collection} onClick={handleCardClick}>
      <div className="card-header">
        <div className={styles.collectionInfo}>
          <h3 className="card-title">{collection.name}</h3>
          <p className="card-subtitle">{collection.symbol}</p>
        </div>
        <span className={styles.badge}>ERC-721</span>
      </div>

      <div className={styles.details}>
        <div className={styles.row}>
          <span className={styles.label}>Contract:</span>
          <span className={styles.value}>
            {collection.address.slice(0, 6)}...{collection.address.slice(-4)}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Holders:</span>
          <span className={styles.value}>{collection.holders_count}</span>
        </div>
      </div>

      <div className={styles.linkContainer}>
        <button className={styles.explorerLink} onClick={handleExplorerClick}>
          Block Explorer
        </button>
      </div>
    </div>
  );
}
