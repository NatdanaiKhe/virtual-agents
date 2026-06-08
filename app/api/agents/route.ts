import { NextResponse } from "next/server";
import { fetchAgents } from "../../../lib/opencode";

export async function GET() {
  try {
    const agents = await fetchAgents();
    return NextResponse.json(agents);
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 502 }
    );
  }
}
