import { createThirdwebClient, type ThirdwebClient } from "thirdweb";

let _client: ThirdwebClient | null = null;

export function getClient(): ThirdwebClient {
  if (!_client) {
    _client = createThirdwebClient({
      clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "placeholder",
    });
  }
  return _client;
}

// For convenience in client components
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "placeholder",
});
