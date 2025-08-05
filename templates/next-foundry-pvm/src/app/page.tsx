'use client';

import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Image
        src="/logo.svg"
        alt="Logo"
        width={200}
        height={200}
      />
    </div>
  );
}