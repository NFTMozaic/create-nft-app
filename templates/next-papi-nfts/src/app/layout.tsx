import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PolkadotProvider } from "./contexts/PolkadotContext";
import { WalletProvider } from "./contexts/WalletContext";
import { Header } from "./components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PAPI NFTs Template",
  description: "PAPI NFTs Template",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <WalletProvider>
          <PolkadotProvider>
            <Header />
            {children}
          </PolkadotProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
