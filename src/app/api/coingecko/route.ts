import { NextRequest, NextResponse } from "next/server";
import { getNovaUsdPrice } from "@/lib/price";

// Mimics CoinGecko API format so Blockscout can fetch NOVA price
// GET /api/coingecko?ids=nova&vs_currencies=usd
export async function GET(request: NextRequest) {
  const price = await getNovaUsdPrice();

  // CoinGecko simple/price format
  const data: Record<string, Record<string, number | null>> = {
    nova: {
      usd: price,
      usd_market_cap: null,
      usd_24h_vol: null,
      usd_24h_change: null,
    },
  };

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
