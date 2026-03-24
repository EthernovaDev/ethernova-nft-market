import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyWalletSignature } from "@/lib/auth";

// GET /api/collection?address=0x... (by contract) or ?owner=0x... (by owner)
export async function GET(request: NextRequest) {
  const contractAddress = request.nextUrl.searchParams.get("address");
  const ownerAddress = request.nextUrl.searchParams.get("owner");

  try {
    if (contractAddress) {
      const result = await pool.query(
        "SELECT * FROM collections WHERE LOWER(contract_address) = LOWER($1)",
        [contractAddress]
      );
      return NextResponse.json({ collection: result.rows[0] || null });
    }

    if (ownerAddress) {
      const result = await pool.query(
        "SELECT * FROM collections WHERE LOWER(owner_address) = LOWER($1) ORDER BY created_at DESC",
        [ownerAddress]
      );
      return NextResponse.json({ collections: result.rows });
    }

    // Return all verified collections
    const result = await pool.query(
      "SELECT * FROM collections ORDER BY is_verified DESC, created_at DESC LIMIT 50"
    );
    return NextResponse.json({ collections: result.rows });
  } catch (error) {
    console.error("DB error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/collection - register a collection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, signature, contract_address, name, description, banner_url, logo_url, website, twitter, discord } = body;

    if (!address || !signature || !contract_address || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const valid = await verifyWalletSignature(address, signature);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const result = await pool.query(
      `INSERT INTO collections (contract_address, name, description, banner_url, logo_url, owner_address, website, twitter, discord)
       VALUES (LOWER($1), $2, $3, $4, $5, LOWER($6), $7, $8, $9)
       ON CONFLICT (contract_address) DO UPDATE SET
         name = $2, description = $3, banner_url = COALESCE($4, collections.banner_url),
         logo_url = COALESCE($5, collections.logo_url), website = $7, twitter = $8, discord = $9,
         updated_at = NOW()
       WHERE LOWER(collections.owner_address) = LOWER($6)
       RETURNING *`,
      [
        contract_address,
        name.slice(0, 100),
        description?.slice(0, 1000) || "",
        banner_url || "",
        logo_url || "",
        address,
        website?.slice(0, 200) || "",
        twitter?.slice(0, 50) || "",
        discord?.slice(0, 50) || "",
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Not authorized to edit this collection" }, { status: 403 });
    }

    return NextResponse.json({ collection: result.rows[0] });
  } catch (error) {
    console.error("Collection error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
