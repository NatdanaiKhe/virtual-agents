# Multi-Agent Dashboard

Real-time monitoring and control interface for [opencode](https://opencode.ai) AI coding agents. Observe all running sessions, stream live output, send follow-up prompts, and manage agent lifecycles — all from a single browser window.

> **Requires an opencode server running at `localhost:4096`.** Start it with `opencode serve`.

![Stack](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Stack](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Stack](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![Stack](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript)

## Quick Start

```bash
# 1. Start the opencode server (separate terminal)
opencode serve

# 2. Install dependencies
npm install

# 3. Start the dashboard
npm run dev        # → http://localhost:3000
```

## Architecture

```
Browser (localhost:3000)
  → Next.js API routes (proxy)
    → @opencode-ai/sdk client
      → opencode server (localhost:4096)
```

All SDK calls are proxied through Next.js API routes to avoid CORS issues. No direct browser-to-opencode calls.

## Directory Structure

```
├── app/
│   ├── page.tsx, layout.tsx        # Pages
│   └── api/                        # API route proxies
│       ├── sessions/               # Session CRUD, prompt, abort, messages
│       ├── events/                 # SSE event stream proxy
│       ├── agents/                 # Available agents
│       ├── models/                 # Connected models only
│       └── config/                 # Server default model
├── components/
│   ├── atoms/                      # Smallest UI primitives
│   │   ├── agent-icon.tsx          # Agent → Greek god icon
│   │   ├── pixel-sprite.tsx        # Animated 8×8 pixel art sprites
│   │   ├── status-dot.tsx          # Glow-effect connection dots
│   │   └── sprites/                # Per-character sprite files
│   ├── molecules/                  # Simple composites
│   │   ├── prompt-group.tsx        # Agent select + model select + input + send
│   │   └── status-indicator.tsx    # Status badge with dot
│   ├── organisms/                  # Complex sections
│   │   ├── agent-card.tsx          # Full card: pixel character, terminal, prompt
│   │   ├── agent-grid.tsx          # Flex-wrap layout for cards
│   │   ├── dashboard-header.tsx    # Top bar + connection status
│   │   ├── filter-bar.tsx          # Search + status filter pills
│   │   ├── new-session-modal.tsx   # Create session form
│   │   └── terminal-pane.tsx       # Scrollable output with markdown rendering
│   ├── templates/
│   │   └── dashboard-layout.tsx    # Page wrapper with CircuitBackground + GridScan
│   ├── thegridcn/                  # Installed Gridcn components
│   └── ui/                         # shadcn base components
├── hooks/
│   └── useSessionStream.ts         # SSE + 10s polling fallback
├── lib/
│   ├── api.ts                      # Client-side SDK facade
│   ├── opencode.ts                 # Server-side SDK client
│   ├── store.ts                    # Zustand state management
│   └── agent-characters.tsx         # Agent → Greek god theme mapping
└── components.json                 # shadcn registry config (Gridcn registered)
```

## Features

| Feature | Description |
|---------|-------------|
| **Live Session Grid** | All active sessions displayed as Tron-styled cards with pixel art characters |
| **Real-time Output** | SSE streaming via `/api/events` proxy, 10s polling fallback |
| **Send Prompts** | Follow-up prompts with per-card agent and model selection |
| **Session Management** | Create, abort, and delete sessions from the UI |
| **Agent Characters** | 8×8 animated pixel art sprites per agent (Sisyphus, Hephaestus, Prometheus, Atlas) |
| **Markdown Rendering** | Terminal pane renders markdown via `remark` + `remark-html` |
| **Collapsible Panels** | Card expand/collapse, character toggle, terminal toggle — each independently |
| **Filter & Search** | Filter by session name/ID or status (All, Idle, Running, Done, Error) |
| **Dark Mode** | Full Tron-themed dark UI with Gridcn Tron cyan theme |
| **Connected Models** | Only shows models from authenticated/configured providers |
| **Session Deletion** | Confirmation modal before deleting sessions |

## Agent Characters

Each opencode agent maps to a unique pixel art character with status-aware animation:

| Agent | Character | Animation | Color |
|-------|-----------|-----------|-------|
| `build` | Hephaestus (Smith) | Hammer swing + fire glow | Red-brown `#993C1D` |
| `plan` / `oracle` / `metis` | Prometheus (Thinker) | Bobbing, blinking, thought bubbles | Blue `#185FA5` |
| `explore` / `librarian` / `momus` | Atlas (Runner) | Running stride, visor glow | Green `#0F6E56` |
| `general` / `sisyphus` | Sisyphus (Orchestrator) | Floating, arm swing, rolling boulder | Purple `#534AB7` |

Status effects: **busy** (pulsing blue glow), **done** (green overlay, slowed), **error** (red overlay, frozen, "ERR").

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/sessions` | GET | List all sessions |
| `/api/sessions` | POST | Create new session |
| `/api/sessions/[id]` | GET | Get single session |
| `/api/sessions/[id]` | DELETE | Delete session |
| `/api/sessions/[id]/prompt` | POST | Send prompt to session |
| `/api/sessions/[id]/abort` | POST | Abort running session |
| `/api/sessions/[id]/messages` | GET | Fetch session messages |
| `/api/events` | GET | SSE event stream proxy |
| `/api/agents` | GET | List available agents |
| `/api/models` | GET | List connected models only |
| `/api/config` | GET | Server config (default model) |

## Tech Stack

- **Framework**: Next.js 16 (Turbopack)
- **UI**: React 19, Tailwind v4 (CSS-based `@theme`), shadcn v2
- **Theme**: [The Gridcn](https://thegridcn.com) — Tron-inspired shadcn registry, Tron cyan theme
- **State**: Zustand v5 (immutable Map patterns)
- **Markdown**: remark + remark-html
- **SDK**: `@opencode-ai/sdk` v1.16 (server-side proxy)
- **Icons**: lucide-react

## Commands

```bash
npm run dev      # Development server (Turbopack, port 3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Adding Gridcn Components

```bash
# Install a Gridcn component
npx shadcn@latest add @thegridcn/<component-name> --yes --overwrite

# List all available components
npx shadcn list @thegridcn
```

After installing, fix `@/` imports in the new files — they use `@/lib/utils` which must be converted to relative imports.

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENCODE_SERVER_URL` | `http://localhost:4096` | Opencode server base URL |

## Gotchas

- **API route `params` is a Promise** in Next.js 16 — must `await params`
- **No `@/` path aliases** — Turbopack doesn't resolve them. Use relative imports
- **`Select.Item` can't have `value=""`** — Radix reserves empty string for clear state
- **`useState(default)` is mount-only** — use `useEffect` to sync async defaults (agent/model)
- **SDK `"type": "module"`** in its package.json — don't add to root package.json
- **Build ECONNREFUSED errors** during static generation are expected when opencode isn't running

## License

ISC
