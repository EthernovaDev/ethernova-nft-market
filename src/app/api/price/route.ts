import { NextResponse } from "next/server";
import { getNovaUsdPrice } from "@/lib/price";

export const revalidate = 60;

export async function GET() {
  const price = await getNovaUsdPrice();
  return NextResponse.json(
    { price, currency: "USD", source: "klingex" },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
  );
}
