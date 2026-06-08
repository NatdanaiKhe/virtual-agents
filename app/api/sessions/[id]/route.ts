import { NextRequest, NextResponse } from "next/server";
import { fetchSession, deleteSession } from "../../../../lib/opencode";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await fetchSession((await params).id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json(session);
  } catch (error) {
    console.error(`Failed to fetch session ${(await params).id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 502 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await deleteSession((await params).id);
    return NextResponse.json({ success: result });
  } catch (error) {
    console.error(`Failed to delete session ${(await params).id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 502 }
    );
  }
}
