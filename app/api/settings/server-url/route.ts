import { NextRequest, NextResponse } from "next/server";
import { getOpencodeServerUrl } from "../../../../lib/opencode";

export async function GET() {
  return NextResponse.json({ serverUrl: await getOpencodeServerUrl() });
}

export async function PUT(request: NextRequest) {
  try {
    const { serverUrl } = await request.json();
    if (!serverUrl || typeof serverUrl !== "string") {
      return NextResponse.json({ error: "serverUrl is required" }, { status: 400 });
    }

    let url: URL;
    try {
      url = new URL(serverUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const response = NextResponse.json({ serverUrl: url.origin });
    response.headers.set(
      "Set-Cookie",
      `opencode-server-url=${encodeURIComponent(url.origin)}; Path=/; SameSite=Lax`
    );
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
