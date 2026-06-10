/**
 * Client-side SDK facade — mirrors @opencode-ai/sdk API surface
 * but routes through Next.js API routes (avoids CORS to opencode :4096).
 *
 * All method names and parameter shapes match the SDK:
 * - client.session.list()      → GET  /api/sessions
 * - client.session.create({})  → POST /api/sessions
 * - client.session.get(id)     → GET  /api/sessions/{id}
 * - client.session.delete(id)  → DELETE /api/sessions/{id}
 * - client.session.prompt(id, { parts, agent?, model? })  → POST /api/sessions/{id}/prompt
 * - client.session.abort(id)   → POST /api/sessions/{id}/abort
 * - client.session.messages(id)→ GET  /api/sessions/{id}/messages
 * - client.app.agents()        → GET  /api/agents
 * - client.provider.list()     → GET  /api/models
 * - client.config.get()        → GET  /api/config
 * - client.path.get()          → GET  /api/path
 */

interface SessionPromptParams {
  parts: Array<{ type: "text"; text: string }>;
  agent?: string;
  model?: { providerID: string; modelID: string };
}

export const client = {
  session: {
    list: () =>
      fetch("/api/sessions")
        .then((r) => r.json())
        .catch(() => []),
    create: (params?: { title?: string }) =>
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params ?? {}),
      }).then((r) => r.json()),
    get: (id: string) => fetch(`/api/sessions/${id}`).then((r) => r.json()),
    delete: (id: string) =>
      fetch(`/api/sessions/${id}`, { method: "DELETE" }).then((r) => r.json()),
    prompt: (id: string, params: SessionPromptParams) =>
      fetch(`/api/sessions/${id}/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: params.parts[0]?.text ?? "",
          agent: params.agent,
          model: params.model,
        }),
      }).then((r) => r.json()),
    abort: (id: string) =>
      fetch(`/api/sessions/${id}/abort`, { method: "POST" }).then((r) =>
        r.json(),
      ),
    messages: (id: string) =>
      fetch(`/api/sessions/${id}/messages`)
        .then((r) => r.json())
        .catch(() => []),
  },
  app: {
    agents: () =>
      fetch("/api/agents")
        .then((r) => r.json())
        .catch(() => []),
  },
  provider: {
    list: () =>
      fetch("/api/models")
        .then((r) => r.json())
        .catch(() => []),
  },
  config: {
    get: () =>
      fetch("/api/config")
        .then((r) => r.json())
        .catch(() => ({ defaultModel: null })),
  },
  path: {
    get: () =>
      fetch("/api/path")
        .then((r) => r.json())
        .catch(() => []),
  },
};
