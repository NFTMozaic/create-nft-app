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
