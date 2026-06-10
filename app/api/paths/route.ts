import { NextRequest, NextResponse } from "next/server";
import { fetchPath } from "../../../lib/opencode";

export async function GET(request: NextRequest) {
  try {
    const result = await fetchPath();
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Failed to path`, error);
    return NextResponse.json(
      { error: "Failed to send prompt" },
      { status: 502 },
    );
  }
}
