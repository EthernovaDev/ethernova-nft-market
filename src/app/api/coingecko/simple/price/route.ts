import { NextResponse } from "next/server";
import { getNovaUsdPrice } from "@/lib/price";

// GET /api/coingecko/simple/price?ids=nova&vs_currencies=usd
export async function GET() {
  const price = await getNovaUsdPrice();
  return NextResponse.json(
    { nova: { usd: price ?? 0 } },
    { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, s-maxage=60" } }
  );
}
