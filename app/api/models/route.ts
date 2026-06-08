import { NextResponse } from "next/server";
import { fetchProviders } from "../../../lib/opencode";

export async function GET() {
  try {
    const providers = await fetchProviders();
    // Only list models from connected/configured providers
    const connectedProviders = providers.all.filter((p) =>
      providers.connected.includes(p.id)
    );
    const models = connectedProviders.flatMap((p) =>
      Object.entries(p.models).map(([key, model]) => ({
        id: model.id || key,
        providerID: p.id,
        name: model.name || key,
        status: model.status,
      }))
    );
    return NextResponse.json(models);
  } catch (error) {
    console.error("Failed to fetch models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 502 }
    );
  }
}
