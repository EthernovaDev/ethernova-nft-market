import { NextRequest, NextResponse } from "next/server";
import { getNovaUsdPrice } from "@/lib/price";

// Mimics CoinGecko API format so Blockscout can fetch NOVA price
// GET /api/coingecko?ids=nova&vs_currencies=usd
export async function GET(request: NextRequest) {
  const price = await getNovaUsdPrice();

  // CoinGecko simple/price format
  const data: Record<string, Record<string, number>> = {
    nova: {
      usd: price ?? 0,
      usd_market_cap: 0,
      usd_24h_vol: 0,
      usd_24h_change: 0,
    },
  };

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
