import { NextResponse } from "next/server";
import { getNovaUsdPrice } from "@/lib/price";

// GET /api/coingecko/coins/nova
// GET /api/coingecko/coins/nova/market_chart etc
export async function GET() {
  const price = await getNovaUsdPrice();
  return NextResponse.json(
    {
      id: "nova",
      symbol: "nova",
      name: "Ethernova",
      market_data: {
        current_price: { usd: price ?? 0 },
        market_cap: { usd: 0 },
        total_volume: { usd: 0 },
        price_change_percentage_24h: 0,
      },
      market_cap_rank: null,
      image: { small: "https://nft.ethnova.net/logo.png" },
    },
    { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, s-maxage=60" } }
  );
}
