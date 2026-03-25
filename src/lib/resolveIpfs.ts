/**
 * Convert an IPFS URI to a fetchable HTTP URL using our gateway
 */
export function ipfsToHttp(uri: string): string {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    const cid = uri.replace("ipfs://", "");
    return `/api/ipfs/${cid}`;
  }
  if (uri.startsWith("data:")) return uri;
  // Convert our IPFS gateway URLs to local proxy for faster loading
  const ipfsGatewayMatch = uri.match(/https?:\/\/ipfs\.ethnova\.net\/ipfs\/(.+)/);
  if (ipfsGatewayMatch) {
    return `/api/ipfs/${ipfsGatewayMatch[1]}`;
  }
  return uri;
}

export type NFTMetadata = {
  name?: string;
  description?: string;
  image?: string;
};

/**
 * Fetch and parse NFT metadata from a tokenURI
 */
export async function fetchNFTMetadata(tokenURI: string): Promise<NFTMetadata | null> {
  try {
    const url = ipfsToHttp(tokenURI);
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      name: data.name || undefined,
      description: data.description || undefined,
      image: data.image ? ipfsToHttp(data.image) : undefined,
    };
  } catch {
    return null;
  }
}
