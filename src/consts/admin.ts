// Wallet addresses that have admin access
// Add your address here to manage verifications
export const ADMIN_ADDRESSES = [
  "0x818c1965e44a033115666f47dff1752c656652c2", // EthernovaDev
];

export function isAdmin(address: string): boolean {
  return ADMIN_ADDRESSES.includes(address.toLowerCase());
}
