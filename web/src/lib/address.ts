export function truncateAddress(address: string, size = 4): string {
  if (!address.startsWith("0x") || address.length !== 42) return address;
  return `${address.slice(0, 2 + size)}…${address.slice(-size)}`;
}
