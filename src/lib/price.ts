const KLINGEX_API = "https://api.klingex.io/api/markets";
const NOVA_MARKET_ID = 88;

let cachedPrice: number | null = null;
let lastFetch = 0;
const CACHE_MS = 60_000; // 1 minute cache

export async function getNovaUsdPrice(): Promise<number | null> {
  const now = Date.now();
  if (cachedPrice !== null && now - lastFetch < CACHE_MS) {
    return cachedPrice;
  }

  try {
    const res = await fetch(KLINGEX_API, { next: { revalidate: 60 } });
    if (!res.ok) return cachedPrice;

    const markets = await res.json();
    const nova = markets.find(
      (m: { id: number; base_asset_symbol: string }) =>
        m.id === NOVA_MARKET_ID || m.base_asset_symbol === "NOVA"
    );

    if (!nova) return cachedPrice;

    // last_price is in raw units, price_decimals tells us how to convert
    const price = Number(nova.last_price) / Math.pow(10, nova.price_decimals);
    cachedPrice = price;
    lastFetch = now;
    return price;
  } catch {
    return cachedPrice;
  }
}
