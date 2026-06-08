import { NextRequest, NextResponse } from "next/server";
import { fetchSessions, createSession } from "../../../lib/opencode";

export async function GET() {
  try {
    const sessions = await fetchSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return NextResponse.json(
      { error: "Failed to connect to opencode server" },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await createSession(body.title);
    return NextResponse.json(session);
  } catch (error) {
    console.error("Failed to create session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 502 }
    );
  }
}
