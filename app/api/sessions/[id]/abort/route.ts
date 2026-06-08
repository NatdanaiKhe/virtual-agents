import { NextRequest, NextResponse } from "next/server";
import { abortSession } from "../../../../../lib/opencode";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await abortSession((await params).id);
    return NextResponse.json({ success: result });
  } catch (error) {
    console.error(`Failed to abort session ${(await params).id}:`, error);
    return NextResponse.json(
      { error: "Failed to abort session" },
      { status: 502 }
    );
  }
}
