import { NextResponse } from "next/server";
import { fetchConfig, getOpencodeServerUrl } from "../../../lib/opencode";

export async function GET() {
  const serverUrl = await getOpencodeServerUrl();

  try {
    const config = await fetchConfig();
    return NextResponse.json({
      serverUrl,
      connected: true,
      defaultModel: config?.model ?? null,
      defaultAgent: null,
      agents: config?.agent ?? {},
    });
  } catch {
    return NextResponse.json({
      serverUrl,
      connected: false,
      defaultModel: null,
      defaultAgent: null,
      agents: {},
      error: "Failed to connect to opencode server",
    });
  }
}
