"use client";

import { useState, useEffect } from "react";
import { fetchNFTMetadata, type NFTMetadata } from "./resolveIpfs";

export function useNFTMetadata(tokenURI: string | undefined) {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tokenURI) return;
    let mounted = true;
    setLoading(true);

    fetchNFTMetadata(tokenURI).then((data) => {
      if (mounted) {
        setMetadata(data);
        setLoading(false);
      }
    });

    return () => { mounted = false; };
  }, [tokenURI]);

  return { metadata, loading };
}
