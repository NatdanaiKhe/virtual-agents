import { createOpencodeClient } from "@opencode-ai/sdk";

const OPENCODE_SERVER_URL = process.env.OPENCODE_SERVER_URL ?? "http://localhost:4096";

/**
 * Singleton SDK client for the opencode server.
 * All SDK calls go through Next.js API routes to avoid CORS issues in the browser.
 */
let _client: ReturnType<typeof createOpencodeClient> | null = null;

export function getOpencodeClient() {
  if (!_client) {
    _client = createOpencodeClient({
      baseUrl: OPENCODE_SERVER_URL,
    });
  }
  return _client;
}

/**
 * Server-side only: fetches the session list from the opencode server.
 */
export async function fetchSessions() {
  const client = getOpencodeClient();
  const result = await client.session.list();
  return result.data ?? [];
}

/**
 * Server-side only: fetches messages for a session.
 */
export async function fetchSessionMessages(sessionId: string) {
  const client = getOpencodeClient();
  const result = await client.session.messages({
    path: { id: sessionId },
  });
  return result.data ?? [];
}

/**
 * Server-side only: gets a single session.
 */
export async function fetchSession(sessionId: string) {
  const client = getOpencodeClient();
  const result = await client.session.get({
    path: { id: sessionId },
  });
  return result.data ?? null;
}

/**
 * Server-side only: creates a new session.
 */
export async function createSession(title?: string) {
  const client = getOpencodeClient();
  const result = await client.session.create({
    body: title ? { title } : undefined,
  });
  return result.data ?? null;
}

/**
 * Server-side only: sends a prompt to a session.
 */
export async function promptSession(
  sessionId: string,
  text: string,
  agent?: string,
  model?: { providerID: string; modelID: string }
) {
  const client = getOpencodeClient();
  const result = await client.session.prompt({
    path: { id: sessionId },
    body: {
      parts: [{ type: "text", text }],
      ...(agent ? { agent } : {}),
      ...(model ? { model } : {}),
    },
  });
  return result.data ?? null;
}

/**
 * Server-side only: aborts a session.
 */
export async function abortSession(sessionId: string) {
  const client = getOpencodeClient();
  const result = await client.session.abort({
    path: { id: sessionId },
  });
  return result.data ?? false;
}

/**
 * Server-side only: deletes a session.
 */
export async function deleteSession(sessionId: string) {
  const client = getOpencodeClient();
  const result = await client.session.delete({
    path: { id: sessionId },
  });
  return result.data ?? false;
}

/**
 * Server-side only: fetches all available agents.
 */
export async function fetchAgents() {
  const client = getOpencodeClient();
  const result = await client.app.agents();
  return result.data ?? [];
}

/**
 * Server-side only: fetches all providers and models.
 */
export async function fetchProviders() {
  const client = getOpencodeClient();
  const result = await client.provider.list();
  return result.data ?? { all: [], default: {}, connected: [] };
}

/**
 * Server-side only: fetches session statuses.
 */
export async function fetchSessionStatuses() {
  const client = getOpencodeClient();
  const result = await client.session.status();
  return result.data ?? {};
}

/**
 * Server-side only: subscribes to the SSE event stream.
 * Returns an async iterable of events.
 */
export async function subscribeToEvents() {
  const client = getOpencodeClient();
  return client.event.subscribe();
}

/**
 * Server-side only: fetches server config (default model, agents, etc).
 */
export async function fetchConfig() {
  const client = getOpencodeClient();
  const result = await client.config.get();
  return result.data ?? null;
}

/**
 * Server-side only: fetches current path information
 */

export async function fetchPath() {
  const client = getOpencodeClient();
  const result = await client.path.get();
  return result.data ?? null;
}
