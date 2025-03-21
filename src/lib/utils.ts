/**
 * Returns the first 5 and last 5 characters of a Polkadot address,
 * separated by an ellipsis (e.g., "5D4sF...XyZ9q").
 */
export function shortPolkadotAddress(address: string): string {
  if (address.length <= 10) {
    return address;
  }

  const firstPart = address.slice(0, 5);
  const lastPart = address.slice(-5);

  return `${firstPart}...${lastPart}`;
}

export const KNOWN_WALLETS = [
  { name: "polkadot-js", title: "Polkadot.js", downloadLink: "https://polkadot.js.org/extension/" },
  { name: "talisman", title: "Talisman", downloadLink: "https://talisman.xyz/" },
  { name: "subwallet-js", title: "SubWallet", downloadLink: "https://subwallet.app/" },
  { name: "nova", title: "Nova Wallet", downloadLink: "https://novawallet.io/" },
  { name: "enkrypt", title: "Enkrypt", downloadLink: "https://www.enkrypt.com/" },
];