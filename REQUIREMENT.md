# Multi-Agent Dashboard — Implementation Specification

**Version:** 1.0 | **Date:** June 5, 2025 | **Status:** Draft
**Stack:** Next.js 16 · @opencode-ai/sdk · TypeScript

---

## 1. Overview

Multi-Agent Dashboard is a Next.js web application that provides a real-time monitoring and control interface for multiple concurrent opencode AI coding agents. It connects to the opencode server via the official `@opencode-ai/sdk` TypeScript SDK, displaying each agent's name, session ID, current prompt, live output, and status — while also allowing operators to send prompts, pause, or terminate sessions interactively.

---

## 2. Problem Statement

Running multiple opencode agents in parallel (e.g. a coder, reviewer, and security auditor) currently requires jumping between multiple terminal windows with no unified view. There is no way to observe all agents simultaneously, compare their progress, or send follow-up instructions without re-entering each session manually. This creates friction, makes it easy to miss agent errors, and limits the ability to orchestrate parallel workflows effectively.

---

## 3. Goals & Success Criteria

### Goals
- Provide a single web UI to observe all running opencode agent sessions at once
- Allow operators to send prompts and control sessions without touching the terminal
- Surface key metadata per agent: name, session ID, active prompt, and streaming output
- Keep the UI lightweight and developer-focused — no bloat

### Done When
- [ ] All active sessions appear on the dashboard within 2 seconds of being started
- [ ] Streaming output from each agent renders in real-time without page refresh
- [ ] User can send a prompt to any session and see the response stream in the UI
- [ ] User can terminate a session from the UI and the card disappears
- [ ] UI is accessible at `localhost:3000` and connects to opencode server at `localhost:4096`

---

## 4. Target Users

**Primary — Developer / AI Orchestrator:** A technical user running multiple opencode agents in parallel on a local machine or server. Comfortable with terminals but wants a faster, visual way to monitor progress and intervene without context-switching.

**Secondary — Team Lead / Reviewer** `[Assumed]`: Someone observing agents running on a shared server who needs a read-only view of all active sessions and their outputs.

---

## 5. Core Features & Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| R-01 | Dashboard lists all active opencode sessions as cards | Must Have | `client.session.list()` |
| R-02 | Each card shows: agent name, session ID, current prompt, status badge | Must Have | Session + Message types from SDK |
| R-03 | Live streaming output per agent rendered in scrollable terminal pane | Must Have | SSE via `client.events` or session subscribe |
| R-04 | Send Prompt input on each card — submits to session via `client.session.prompt()` | Must Have | `body.parts[{type:'text', text}]` |
| R-05 | Terminate Session button — calls `client.session.abort()` or equivalent | Must Have | Remove card on success |
| R-06 | Create New Session button — modal with agent name, model, initial prompt | Must Have | `client.session.create()` |
| R-07 | Auto-refresh / real-time updates via SSE event stream (`client.events`) | Must Have | Poll fallback if SSE fails |
| R-08 | Status indicators: Idle / Running / Error / Done per session | Must Have | Derived from event stream |
| R-09 | Collapse/expand individual agent cards | Should Have | Reduce visual noise |
| R-10 | Token usage display per session (if available from SDK) | Should Have | From message metadata |
| R-11 | Copy session ID / output to clipboard | Should Have | Convenience |
| R-12 | Filter/search sessions by name or status | Should Have | Client-side filter |
| R-13 | Dark mode UI | Should Have | Tailwind `dark:` classes |
| R-14 | Session history list (past sessions, not just active) | Nice to Have | `client.session.list` all |
| R-15 | Export session transcript as markdown/text | Nice to Have | — |

---

## 6. User Flows

### Flow 1 — Monitor Running Agents
1. User opens `http://localhost:3000` in browser
2. App calls `GET /session/list` via SDK — renders a card per active session
3. Each card subscribes to its session event stream for live output
4. Status badges update automatically as events arrive (Running → Done)
- **Edge:** No active sessions → empty state with "Start a new session" CTA

### Flow 2 — Send a Follow-up Prompt to an Agent
1. User types a prompt into the input field on an agent card
2. User clicks Send (or presses Enter)
3. App calls `client.session.prompt({ path: { id }, body: { parts: [{type:'text', text}] } })`
4. Response streams into the terminal pane below the input
- **Edge:** Session is busy/running → show "Agent is busy" tooltip, disable Send button

### Flow 3 — Create a New Agent Session
1. User clicks "+ New Agent" button in the top bar
2. Modal opens with fields: Agent Name, Model (dropdown), Initial Prompt
3. User fills fields and clicks Create
4. App calls `client.session.create()` then `client.session.prompt()` with initial prompt
5. New card appears on dashboard with live stream active
- **Edge:** Server unreachable → toast error, modal stays open

### Flow 4 — Terminate an Agent Session
1. User clicks the Terminate (✕) button on an agent card
2. Confirmation dialog: "Stop this agent?"
3. On confirm, app calls abort/terminate on the session
4. Card fades out and is removed from the dashboard
- **Edge:** Session already done → button disabled, shows "Completed" badge

---

## 7. Technical Design

### 7.1 Stack & Platform

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14 (App Router) | Server Components + Client Components |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS + shadcn/ui | Dark mode, terminal-look components |
| opencode SDK | `@opencode-ai/sdk` | Type-safe client for opencode server |
| State Management | Zustand | `[Assumed]` session map store |
| Real-time | SSE via SDK event stream | Fallback: 2s polling |
| Server | Next.js API Routes | Proxy SDK calls server-side to avoid CORS |
| Hosting | Local / localhost:3000 | Dev-first; Docker optional |
| opencode server | localhost:4096 (default) | Must be running separately |

### 7.2 Data Model

Key types from `@opencode-ai/sdk` (generated from OpenAPI spec):

| Entity | Key Fields | Source |
|--------|-----------|--------|
| `Session` | `id`, `title`, `model`, `created` | SDK Session type |
| `Message` | `id`, `role` ('user'\|'assistant'), `parts: Part[]`, `info: MessageInfo` | SDK Message type |
| `Part` | `type` ('text'\|'tool-invocation'\|...), `text?: string` | SDK Part type |
| `AgentCard` (UI) | `sessionId`, `agentName`, `status`, `messages[]`, `isExpanded`, `isPinned` | Local UI state |
| `AppState` (UI) | `sessions: Map<id, AgentCard>`, `filter: string`, `isConnected: bool` | Zustand store |

### 7.3 Key Components / Modules

| File | Responsibility |
|------|---------------|
| `app/page.tsx` | Root dashboard — fetches session list, renders AgentGrid |
| `components/AgentGrid.tsx` | CSS grid layout for AgentCard components |
| `components/AgentCard.tsx` | Single agent panel: header, terminal pane, prompt input, controls |
| `components/TerminalPane.tsx` | Scrollable output with ANSI-aware text rendering |
| `components/PromptInput.tsx` | Textarea + Send button, calls `session.prompt()` |
| `components/NewSessionModal.tsx` | Modal: agent name, model dropdown, initial prompt |
| `components/StatusBadge.tsx` | Color-coded badge: Idle / Running / Error / Done |
| `lib/opencode.ts` | Singleton SDK client (`createOpencodeClient`) |
| `lib/store.ts` | Zustand store — session map, event subscription management |
| `app/api/sessions/route.ts` | Next.js API route — proxies SDK calls server-side |
| `hooks/useSessionStream.ts` | Custom hook — subscribes to event stream, updates store |

### 7.4 External Integrations

- **`@opencode-ai/sdk`** — official TypeScript SDK (`npm install @opencode-ai/sdk`)
- **opencode server** — must be running at `localhost:4096` before dashboard starts
- **shadcn/ui** — headless components: modal, badge, button, input
- **Zustand** — client-side state management `[Assumed]`
- **`ansi-to-html`** — render ANSI color codes in terminal pane `[Assumed]`

---

## 8. Out of Scope (v1)

- User authentication / login (local tool only)
- Multi-user / team collaboration features
- Managing opencode server config or models from the UI
- Deploying agents to remote machines
- CI/CD pipeline integration
- Mobile-responsive design (desktop-first)
- Persisting agent history beyond what opencode server stores

---

## 9. Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| Performance | Dashboard initial load < 1s; streaming output latency < 200ms from SDK event |
| Reliability | Auto-reconnect SSE stream on drop; max 3 retries with exponential backoff |
| Scalability | UI handles up to 10 concurrent agent cards without layout degradation |
| Security | No API keys stored in browser; SDK client runs server-side in API routes |
| Compatibility | Chromium-based browsers (Chrome 110+, Edge 110+) — developer audience |
| Accessibility | Keyboard navigable; ARIA labels on interactive controls (nice-to-have) |
| Developer UX | TypeScript strict mode; ESLint + Prettier; README with setup steps |

---

## 10. Implementation Plan

### Phase 1 — Foundation
1. `npx create-next-app` with TypeScript + Tailwind
2. Install `@opencode-ai/sdk`, `zustand`, `shadcn/ui`
3. Set up `lib/opencode.ts` (`createOpencodeClient`)
4. API route `GET /api/sessions` → `client.session.list()`
5. Verify opencode server connection (health check)

**Milestone:** Can fetch and print session list from a running opencode server

### Phase 2 — Core UI
1. Build `AgentGrid` + `AgentCard` shell layout
2. Implement `TerminalPane` with live SSE stream
3. `useSessionStream` hook for event subscription
4. Zustand store wiring (sessions map)
5. `StatusBadge` component
6. `PromptInput` → `session.prompt()` integration

**Milestone:** Can view running agents + send prompts in real time

### Phase 3 — Control & Polish
1. `NewSessionModal` (create + initial prompt)
2. Terminate session button + confirmation dialog
3. Collapse/expand cards
4. Filter/search bar
5. Dark mode toggle
6. Error states + SSE reconnect logic
7. README with setup instructions

**Milestone:** Full monitor + control flow working end-to-end

---

## 11. Assumptions & Open Questions

### Assumptions
- `[Assumed]` opencode server is already running at `localhost:4096` before dashboard starts
- `[Assumed]` Uses `createOpencodeClient` (client-only mode), not `createOpencode`, since connecting to an existing server
- `[Assumed]` Real-time updates use SDK event stream or 2s polling fallback
- `[Assumed]` Agent "name" is stored as the session `title` in opencode
- `[Assumed]` Zustand is used for client-side session state management
- `[Assumed]` Desktop-only for v1; mobile deferred
- `[Assumed]` No authentication required — single-user local tool

### Open Questions
- ❓ Does `@opencode-ai/sdk` support direct SSE streaming in a browser context, or must all SDK calls be proxied through Next.js API routes to avoid CORS?
- ❓ What is the exact SDK method to terminate/abort a running session? (`client.session.abort()`? `client.session.delete()`?)
- ❓ Is agent "name" a first-class field on `Session`, or is it derived from `title`?
- ❓ Should the dashboard support connecting to a remote opencode server (configurable base URL), or is localhost-only acceptable for v1?
- ❓ What models should appear in the "Create New Session" dropdown — fetch from `client.app.models()` or hardcode?

---

*Multi-Agent Dashboard — Implementation Spec v1.0 · Generated June 5, 2025*ctx7 library