import { NextResponse } from "next/server";
import { fetchConfig } from "../../../lib/opencode";

export async function GET() {
  try {
    const config = await fetchConfig();
    return NextResponse.json({
      defaultModel: config?.model ?? null,
      defaultAgent: null,
      agents: config?.agent ?? {},
    });
  } catch (error) {
    console.error("Failed to fetch config:", error);
    return NextResponse.json(
      { error: "Failed to fetch server config" },
      { status: 502 }
    );
  }
}
