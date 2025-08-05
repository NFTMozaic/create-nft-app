import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from './connect/ConnectButton';
import { WalletModal } from './connect/WalletModal';

export function Header() {
  return (
    <header className="app-header">
      <div className="app-header-container">
        <Link href="/">
          <Image
            src="/logo.svg"
            alt="NFTMozaic Logo"
            height={0}
            width={60}
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </Link>
        <ConnectButton />
        <WalletModal />
      </div>
    </header>
  );
}
