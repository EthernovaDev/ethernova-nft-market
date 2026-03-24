"use client";

import { useState, useEffect } from "react";

export function useNovaPrice() {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchPrice() {
      try {
        const res = await fetch("/api/price");
        const data = await res.json();
        if (mounted && data.price) setPrice(data.price);
      } catch {
        // ignore
      }
    }

    fetchPrice();
    const interval = setInterval(fetchPrice, 60_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  function novaToUsd(nova: number | string): string | null {
    if (!price) return null;
    const usd = Number(nova) * price;
    if (usd < 0.01) return `<$0.01`;
    if (usd < 1) return `$${usd.toFixed(4)}`;
    if (usd < 1000) return `$${usd.toFixed(2)}`;
    return `$${(usd / 1000).toFixed(1)}K`;
  }

  return { price, novaToUsd };
}
