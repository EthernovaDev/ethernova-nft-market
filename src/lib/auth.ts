import { verifyMessage } from "viem";

const AUTH_MESSAGE = "Sign this message to verify your identity on Ethernova NFT Marketplace.\n\nThis does not cost any gas.";

export function getAuthMessage(): string {
  return AUTH_MESSAGE;
}

export async function verifyWalletSignature(
  address: string,
  signature: string
): Promise<boolean> {
  try {
    const valid = await verifyMessage({
      address: address as `0x${string}`,
      message: AUTH_MESSAGE,
      signature: signature as `0x${string}`,
    });
    return valid;
  } catch {
    return false;
  }
}
