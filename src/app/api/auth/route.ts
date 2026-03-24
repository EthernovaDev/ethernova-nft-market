import { NextResponse } from "next/server";
import { getAuthMessage } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ message: getAuthMessage() });
}
