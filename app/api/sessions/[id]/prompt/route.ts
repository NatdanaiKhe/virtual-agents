import { NextRequest, NextResponse } from "next/server";
import { promptSession } from "../../../../../lib/opencode";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { text, agent, model } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing required field: text" },
        { status: 400 }
      );
    }

    const result = await promptSession((await params).id, text, agent, model);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Failed to prompt session ${(await params).id}:`, error);
    return NextResponse.json(
      { error: "Failed to send prompt" },
      { status: 502 }
    );
  }
}
