import { getOpencodeClient } from "../../../lib/opencode";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const client = getOpencodeClient();

        await client.event.subscribe({
          onSseEvent: (event) => {
            try {
              const data = JSON.stringify(event.data);
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            } catch {
              // Skip unparseable events
            }
          },
          onSseError: (error) => {
            console.error("SSE stream error:", error);
            controller.enqueue(
              encoder.encode(
                `event: error\ndata: ${JSON.stringify({ error: "Stream error" })}\n\n`
              )
            );
          },
          sseDefaultRetryDelay: 2000,
          sseMaxRetryAttempts: 10,
          sseMaxRetryDelay: 30000,
        });
      } catch (error) {
        console.error("Failed to subscribe to events:", error);
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ error: "Failed to subscribe to events" })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
