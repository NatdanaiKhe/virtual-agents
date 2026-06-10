# Graph Report - .  (2026-06-10)

## Corpus Check
- Corpus is ~24,929 words - fits in a single context window. You may not need a graph.

## Summary
- 390 nodes · 705 edges · 22 communities (19 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_UI Atoms & Store Types|UI Atoms & Store Types]]
- [[_COMMUNITY_App Root & Streaming|App Root & Streaming]]
- [[_COMMUNITY_API Route Handlers|API Route Handlers]]
- [[_COMMUNITY_Documentation & Config|Documentation & Config]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_API Proxy Layer|API Proxy Layer]]
- [[_COMMUNITY_Component Aliases|Component Aliases]]
- [[_COMMUNITY_Agent Characters & Icons|Agent Characters & Icons]]
- [[_COMMUNITY_Design System Theme|Design System Theme]]
- [[_COMMUNITY_Session API Routes|Session API Routes]]
- [[_COMMUNITY_Data Flow & Architecture|Data Flow & Architecture]]
- [[_COMMUNITY_User Flows|User Flows]]
- [[_COMMUNITY_UI Components Core|UI Components Core]]
- [[_COMMUNITY_Requirements & Specs|Requirements & Specs]]
- [[_COMMUNITY_Hooks & State|Hooks & State]]
- [[_COMMUNITY_Subagent Extraction|Subagent Extraction]]
- [[_COMMUNITY_Modal & Terminal UI|Modal & Terminal UI]]
- [[_COMMUNITY_Gridcn Components|Gridcn Components]]
- [[_COMMUNITY_Implementation Phases|Implementation Phases]]
- [[_COMMUNITY_Data Models|Data Models]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 48 edges
2. `compilerOptions` - 16 edges
3. `getOpencodeClient()` - 15 edges
4. `useAppStore` - 15 edges
5. `Button()` - 9 edges
6. `Badge()` - 8 edges
7. `SessionStatus` - 8 edges
8. `tailwind` - 6 edges
9. `aliases` - 6 edges
10. `fillRect()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `PixelSpriteProps` --references--> `SessionStatus`  [EXTRACTED]
  components/atoms/pixel-sprite.tsx → lib/store.ts
- `Corner()` --calls--> `cn()`  [EXTRACTED]
  components/organisms/agent-card.tsx → lib/utils.ts
- `Terminal()` --calls--> `cn()`  [EXTRACTED]
  components/thegridcn/terminal.tsx → lib/utils.ts
- `AgentIcon()` --calls--> `getAgentTheme()`  [EXTRACTED]
  components/atoms/agent-icon.tsx → lib/agent-characters.tsx
- `AgentCharacterPillProps` --references--> `SessionStatus`  [EXTRACTED]
  components/molecules/agent-character-pill.tsx → lib/store.ts

## Import Cycles
- None detected.

## Communities (22 total, 3 thin omitted)

### Community 0 - "UI Atoms & Store Types"
Cohesion: 0.08
Nodes (42): StatusDot(), StatusDotProps, AgentOption, ModelOption, cn(), AgentCharacterPill(), PromptGroup(), PromptGroupProps (+34 more)

### Community 1 - "App Root & Streaming"
Cohesion: 0.12
Nodes (28): Home(), useSessionStream(), client, SessionPromptParams, AgentCardData, AppState, MessageData, PartData (+20 more)

### Community 2 - "API Route Handlers"
Cohesion: 0.11
Nodes (25): POST(), GET(), GET(), DELETE(), GET(), abortSession(), createSession(), deleteSession() (+17 more)

### Community 3 - "Documentation & Config"
Cohesion: 0.07
Nodes (34): AGENTS.md, app/, CLAUDE.md, components.json, components/ui/, Context7, Context7 Documentation Workflow, CORS Avoidance Pattern (+26 more)

### Community 4 - "Package Dependencies"
Cohesion: 0.07
Nodes (28): dependencies, autoprefixer, class-variance-authority, clsx, lucide-react, next, postcss, radix-ui (+20 more)

### Community 5 - "API Proxy Layer"
Cohesion: 0.14
Nodes (24): app/api/agents/, lib/api.ts, app/api/, app/api/config/, Connected Models Filter, app/api/events/, hooks/, Phase 1: Foundation (+16 more)

### Community 6 - "Component Aliases"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 7 - "Agent Characters & Icons"
Cohesion: 0.14
Nodes (20): lib/agent-characters.tsx, Ares (Greek God), Athena (Greek God), Atlas (Runner) Pixel Character, build Agent, Clu (Greek God), explore Agent, general Agent (+12 more)

### Community 8 - "Design System Theme"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 9 - "Session API Routes"
Cohesion: 0.20
Nodes (10): agentSpriteMap, PixelSprite(), PixelSpriteProps, statusSpeed, atlas, fillRect(), hephaestus, sprites (+2 more)

### Community 10 - "Data Flow & Architecture"
Cohesion: 0.14
Nodes (13): author, description, devDependencies, typescript, license, name, private, scripts (+5 more)

### Community 11 - "User Flows"
Cohesion: 0.22
Nodes (13): components/organisms/agent-grid.tsx, components/organisms/, Dark Mode, components/organisms/dashboard-header.tsx, components/organisms/filter-bar.tsx, Phase 3: Control & Polish, components/organisms/new-session-modal.tsx, app/page.tsx (+5 more)

### Community 12 - "UI Components Core"
Cohesion: 0.21
Nodes (12): components/atoms/agent-icon.tsx, components/atoms/, components/, components/molecules/, components/templates/, components/thegridcn/, components/templates/dashboard-layout.tsx, Gridcn Components (+4 more)

### Community 13 - "Requirements & Specs"
Cohesion: 0.24
Nodes (11): components/organisms/agent-card.tsx, Phase 2: Core UI, Markdown Rendering in Terminal, components/molecules/prompt-group.tsx, R-02: Card Metadata Display, R-04: Send Prompt Input, R-05: Terminate Session, Session Deletion Confirmation (+3 more)

### Community 14 - "Hooks & State"
Cohesion: 0.24
Nodes (10): AgentCard UI Model, AppState UI Model, Immutable Map Pattern, Message Data Model, Part Data Model, Session Data Model, Session Model/Agent Extraction, lib/store.ts (+2 more)

### Community 15 - "Subagent Extraction"
Cohesion: 0.36
Nodes (6): AgentIcon(), AgentTheme, agentThemes, defaultTheme, getAgentCharacter(), getAgentTheme()

### Community 16 - "Modal & Terminal UI"
Cohesion: 0.25
Nodes (7): lineColor, linePrefix, Terminal(), TerminalLine, TerminalProps, variantBorder, variantHeader

## Knowledge Gaps
- **97 isolated node(s):** `plugin`, `metadata`, `$schema`, `style`, `rsc` (+92 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Package Dependencies` to `Data Flow & Architecture`, `API Proxy Layer`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Why does `cn()` connect `UI Atoms & Store Types` to `Modal & Terminal UI`, `App Root & Streaming`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `Package Dependencies` to `App Root & Streaming`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **What connects `plugin`, `metadata`, `$schema` to the rest of the system?**
  _97 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Atoms & Store Types` be split into smaller, more focused modules?**
  _Cohesion score 0.07597895967270601 - nodes in this community are weakly interconnected._
- **Should `App Root & Streaming` be split into smaller, more focused modules?**
  _Cohesion score 0.11707317073170732 - nodes in this community are weakly interconnected._
- **Should `API Route Handlers` be split into smaller, more focused modules?**
  _Cohesion score 0.10810810810810811 - nodes in this community are weakly interconnected._