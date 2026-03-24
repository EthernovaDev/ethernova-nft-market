import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyWalletSignature } from "@/lib/auth";
import { isAdmin } from "@/consts/admin";

// GET /api/admin?type=profiles or ?type=collections
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") || "profiles";

  try {
    if (type === "profiles") {
      const result = await pool.query(
        "SELECT address, username, bio, avatar_url, is_verified, created_at FROM profiles ORDER BY created_at DESC LIMIT 100"
      );
      return NextResponse.json({ profiles: result.rows });
    }

    if (type === "collections") {
      const result = await pool.query(
        "SELECT * FROM collections ORDER BY created_at DESC LIMIT 100"
      );
      return NextResponse.json({ collections: result.rows });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Admin error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/admin - verify/unverify profile or collection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { admin_address, signature, action, target_address, target_type } = body;

    if (!admin_address || !signature || !action || !target_address) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify admin wallet
    const valid = await verifyWalletSignature(admin_address, signature);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    if (!isAdmin(admin_address)) {
      return NextResponse.json({ error: "Not an admin" }, { status: 403 });
    }

    const verified = action === "verify";
    const table = target_type === "collection" ? "collections" : "profiles";
    const column = target_type === "collection" ? "contract_address" : "address";

    const result = await pool.query(
      `UPDATE ${table} SET is_verified = $1, updated_at = NOW() WHERE LOWER(${column}) = LOWER($2) RETURNING *`,
      [verified, target_address]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Admin error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
