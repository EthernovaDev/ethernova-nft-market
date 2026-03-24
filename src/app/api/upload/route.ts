import { NextRequest, NextResponse } from "next/server";

const IPFS_API = "http://127.0.0.1:5001";
const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "audio/mpeg",
  "model/gltf-binary",
  "application/json",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 50MB" },
        { status: 400 }
      );
    }

    // Upload to IPFS via local node API
    const ipfsForm = new FormData();
    ipfsForm.append("file", file);

    const ipfsRes = await fetch(`${IPFS_API}/api/v0/add?pin=true`, {
      method: "POST",
      body: ipfsForm,
    });

    if (!ipfsRes.ok) {
      const errText = await ipfsRes.text();
      console.error("IPFS error:", errText);
      return NextResponse.json({ error: "IPFS upload failed" }, { status: 500 });
    }

    const ipfsData = await ipfsRes.json();
    const cid = ipfsData.Hash;

    return NextResponse.json({
      cid,
      url: `https://nft.ethnova.net/api/ipfs/${cid}`,
      ipfsUrl: `ipfs://${cid}`,
      gateway: `https://ipfs.io/ipfs/${cid}`,
      size: ipfsData.Size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
