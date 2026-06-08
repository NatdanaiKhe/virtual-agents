import { NextRequest, NextResponse } from "next/server";
import { fetchSessionMessages } from "../../../../../lib/opencode";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const messages = await fetchSessionMessages((await params).id);
    return NextResponse.json(messages);
  } catch (error) {
    console.error(`Failed to fetch messages for session ${(await params).id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 502 }
    );
  }
}
