# AGENTS.md

## Stack

- **Next.js 16** (Turbopack), **React 19**, **Tailwind v4**, **TypeScript 6**
- State: **Zustand** v5. UI: **shadcn v2** + **Gridcn** (Tron-themed shadcn registry). Icons: **lucide-react**
- Connects to opencode server via `@opencode-ai/sdk`

## Commands

```bash
npm run dev      # localhost:3000 (requires opencode server on :4096)
npm run build    # production build (Turbopack)
```

OpenCode server must be running separately: `opencode serve` (starts at `localhost:4096`).

## Architecture

```
app/
  page.tsx, layout.tsx    → pages (entry: /)
  api/                     → Next.js API routes (proxy SDK calls server-side)
    sessions/              → CRUD + prompt + abort + messages
    events/                → SSE proxy to opencode event stream
    agents/, models/, config/ → metadata endpoints
components/
  atoms/       → Button, Badge, Input, Select (Gridcn re-exports), AgentIcon, StatusDot
  molecules/   → PromptGroup, StatusIndicator
  organisms/   → AgentCard, AgentGrid, DashboardHeader, FilterBar, NewSessionModal, TerminalPane
  templates/   → DashboardLayout (wraps page with CircuitBackground)
  ui/          → shadcn base (button, badge, input, select — installed via Gridcn)
  thegridcn/   → Gridcn components (data-card, hud-corner-frame, circuit-background, etc.)
hooks/
  useSessionStream.ts → SSE + 10s polling fallback, event handling
lib/
  opencode.ts   → SDK client singleton (baseUrl: OPENCODE_SERVER_URL env or localhost:4096)
  store.ts      → Zustand store (sessions Map, agents, models, filters, dark mode)
  agent-characters.tsx → Greek god theme mapping per agent name
```

**Data flow**: Browser → Next.js API route → `lib/opencode.ts` (SDK client) → opencode server on `:4096`. No direct browser-to-opencode calls (CORS avoidance).

## Import rules

- **Do NOT use `@/` path aliases.** They are in tsconfig but NOT resolved by Turbopack. Always use relative imports.
- **No `.ts` / `.tsx` extensions in imports.** TypeScript 6 rejects them unless `allowImportingTsExtensions` is enabled.

## API route params (Next.js 16)

In Next.js 16, route handler `params` is a **Promise**. Must destructure with `await`:

```ts
// CORRECT
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}

// WRONG — was valid in Next.js 14, breaks in 16
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await fetchSession(params.id); // TypeError
}
```

## Tailwind v4 (not v3)

- **No `tailwind.config.ts`** — themes live in `app/globals.css` via `@theme inline { ... }` and CSS custom properties.
- PostCSS config must exist at `postcss.config.mjs` with `@tailwindcss/postcss` plugin.
- Colors use OKLCH: `oklch(0.6 0.2 250)`. Opacity with `color-mix()`.
- Gridcn theme CSS is imported in globals.css and overrides `:root` variables (Poseidon blue theme).

## Gridcn components

Registered as a shadcn registry in `components.json`:
```json
"registries": { "@thegridcn": "https://thegridcn.com/r/{name}.json" }
```

Install: `npx shadcn@latest add @thegridcn/<component-name> --yes --overwrite`

Installed components go to `components/thegridcn/` (Tron-specific) and `components/ui/` (base shadcn). **After installing, fix `@/` imports in the new files** — they use `@/lib/utils` which won't resolve.

## Zustand store

- `sessions` is a `Map<string, AgentCardData>`. Every mutation creates a new Map (immutable pattern).
- State updates trigger re-renders in all `useAppStore()` subscribers. Keep selectors narrow.
- Session model/agent is extracted from messages (not session metadata). Uses `findLast` for model, `find` for agent.

## Polling & SSE

- **SSE is primary** (via `/api/events` proxy to opencode's event stream).
- **Polling is fallback**: 10s interval, skips `updateSession` when title hasn't changed.
- SSE fallback waits 5s before activating polling (lets auto-reconnect try first).
- Error/connected state checks current value before setting (avoids no-op re-renders).

## Agent characters (Gridcn Greek gods)

Each opencode agent name maps to a Greek god theme with color and glow:
- `build` → ⚔️ Ares (red `#ff3333`), `plan` → 🦉 Athena (gold `#ffd700`), `explore` → 🔍 Tron (cyan `#00d4ff`)
- `oracle` → 🔮, `librarian` → 📚, `metis` → 💡, `momus` → 🌊 Poseidon, `general` → 🤖 Clu
- Mapping in `lib/agent-characters.tsx`. Used by AgentCard header + all agent dropdowns.

## OpenCode SDK methods used

| Method | Purpose |
|--------|---------|
| `client.session.list()` | Fetch all sessions |
| `client.session.create({ title })` | New session |
| `client.session.get({ path: { id } })` | Single session |
| `client.session.delete({ path: { id } })` | Delete session |
| `client.session.abort({ path: { id } })` | Abort running session |
| `client.session.prompt({ path: { id }, body: { parts, agent?, model? } })` | Send prompt |
| `client.session.messages({ path: { id } })` | Fetch messages |
| `client.event.subscribe()` | SSE event stream |
| `client.app.agents()` | List available agents |
| `client.provider.list()` | List providers + models + connected IDs |
| `client.config.get()` | Server config (default model) |

## Connected models filter

`/api/models` only returns models from `providers.connected` (configured/authenticated providers). Not all known providers.

## Common gotchas

- Build fails with `ECONNREFUSED` on API routes during static generation — expected when opencode isn't running. Routes still compile.
- `Select.Item` from Radix cannot have `value=""` — empty string is reserved for clear/placeholder state.
- `useState(default)` only captures initial value. When defaults arrive async (e.g., agent/model from messages), use `useEffect` to sync.
- The SDK package has `"type": "module"` in its package.json — keep it out of the root package.json (breaks CJS configs).

When I ask about any library, framework, API, setup, config, or code generation,
always use Context7 first.

Steps:
1. Use resolve-library-id to find the correct library ID.
2. Use query-docs / get-library-docs with that library ID and my question.
3. Answer using the pulled documentation.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
