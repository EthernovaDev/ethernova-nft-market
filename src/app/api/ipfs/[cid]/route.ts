import { NextRequest, NextResponse } from "next/server";

const IPFS_GATEWAY = "http://127.0.0.1:8088";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cid: string }> }
) {
  const { cid } = await params;

  try {
    const res = await fetch(`${IPFS_GATEWAY}/ipfs/${cid}`, {
      headers: { Accept: request.headers.get("Accept") || "*/*" },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "application/octet-stream";

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json({ error: "IPFS gateway error" }, { status: 502 });
  }
}
