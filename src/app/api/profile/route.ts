import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyWalletSignature } from "@/lib/auth";

// GET /api/profile?address=0x...
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "Address required" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      "SELECT address, username, bio, avatar_url, website, twitter, discord, telegram, is_verified, created_at FROM profiles WHERE LOWER(address) = LOWER($1)",
      [address]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({ profile: result.rows[0] });
  } catch (error) {
    console.error("DB error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/profile - create or update profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, signature, username, bio, avatar_url, website, twitter, discord, telegram } = body;

    if (!address || !signature) {
      return NextResponse.json({ error: "Address and signature required" }, { status: 400 });
    }

    // Verify wallet signature
    const valid = await verifyWalletSignature(address, signature);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Sanitize username
    const cleanUsername = username?.trim().slice(0, 50) || null;
    if (cleanUsername) {
      // Check username uniqueness
      const existing = await pool.query(
        "SELECT address FROM profiles WHERE LOWER(username) = LOWER($1) AND LOWER(address) != LOWER($2)",
        [cleanUsername, address]
      );
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
      }
    }

    // Upsert profile
    const result = await pool.query(
      `INSERT INTO profiles (address, username, bio, avatar_url, website, twitter, discord, telegram, updated_at)
       VALUES (LOWER($1), $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (address) DO UPDATE SET
         username = COALESCE($2, profiles.username),
         bio = COALESCE($3, profiles.bio),
         avatar_url = COALESCE($4, profiles.avatar_url),
         website = COALESCE($5, profiles.website),
         twitter = COALESCE($6, profiles.twitter),
         discord = COALESCE($7, profiles.discord),
         telegram = COALESCE($8, profiles.telegram),
         updated_at = NOW()
       RETURNING address, username, bio, avatar_url, website, twitter, discord, telegram, is_verified`,
      [
        address,
        cleanUsername,
        bio?.slice(0, 500) || "",
        avatar_url || "",
        website?.slice(0, 200) || "",
        twitter?.slice(0, 50) || "",
        discord?.slice(0, 50) || "",
        telegram?.slice(0, 50) || "",
      ]
    );

    return NextResponse.json({ profile: result.rows[0] });
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
