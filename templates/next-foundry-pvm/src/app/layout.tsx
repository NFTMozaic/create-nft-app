import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Header } from '@/components/Header';
import './globals.css';
import ContextProvider from '@/context';

export const metadata: Metadata = {
  title: 'PVM NFT Template',
  description: 'PVM NFT Template',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersData = await headers();
  const cookies = headersData.get('cookie');

  return (
    <html lang="en">
      <body>
        <ContextProvider cookies={cookies}>
          <Header />
          {children}
        </ContextProvider>
      </body>
    </html>
  );
}
