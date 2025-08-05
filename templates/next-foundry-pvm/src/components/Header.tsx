import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from './ConnectButton';

export function Header() {
  return (
    <header className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.svg"
              alt="NFTMozaic Logo"
              height={0}
              width={60}
              style={{ width: 'auto', height: 'auto' }}
              priority
              className="h-8 w-auto"
            />
            <span className="text-xl font-semibold text-gray-900">
              NFTMozaic
            </span>
          </Link>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
