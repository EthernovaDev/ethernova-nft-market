import { NextResponse } from "next/server";
import { getNovaUsdPrice } from "@/lib/price";

// GET /api/coingecko/coins/nova/market_chart?vs_currency=usd&days=1
export async function GET() {
  const price = await getNovaUsdPrice();
  const now = Date.now();
  // Return minimal chart data - just current price
  return NextResponse.json(
    {
      prices: [[now, price ?? 0]],
      market_caps: [[now, 0]],
      total_volumes: [[now, 0]],
    },
    { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, s-maxage=60" } }
  );
}
