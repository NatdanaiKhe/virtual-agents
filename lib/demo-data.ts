import type { AgentCardData, MessageData, PartData, AgentOption, ModelOption } from "./store";

export const DEMO_AGENTS: AgentOption[] = [
  { name: "build", description: "Default agent — executes tools based on configured permissions", mode: "primary" },
  { name: "plan", description: "Plan mode — disallows all edit tools, used for architecture design", mode: "primary" },
  { name: "explore", description: "Contextual grep for codebases", mode: "primary" },
  { name: "librarian", description: "Specialized codebase understanding agent for multi-repository analysis", mode: "primary" },
  { name: "oracle", description: "Read-only consultation agent — high-IQ reasoning specialist", mode: "primary" },
  { name: "sisyphus", description: "Powerful AI Agent with orchestration capabilities", mode: "primary" },
  { name: "metis", description: "Pre-planning consultant — identifies hidden intentions and ambiguities", mode: "primary" },
];

export const DEMO_MODELS: ModelOption[] = [
  { id: "claude-sonnet-4-20250514", providerID: "anthropic", name: "Claude Sonnet 4" },
  { id: "claude-opus-4-20250514", providerID: "anthropic", name: "Claude Opus 4" },
  { id: "gpt-5", providerID: "openai", name: "GPT-5" },
  { id: "gpt-5-mini", providerID: "openai", name: "GPT-5 Mini" },
  { id: "gemini-2.5-pro", providerID: "google", name: "Gemini 2.5 Pro" },
  { id: "deepseek-v4-pro", providerID: "deepseek", name: "DeepSeek V4 Pro" },
];

function makeParts(text: string): PartData[] {
  // Split on triple-backtick blocks for realistic message parts
  const parts: PartData[] = [];
  const lines = text.split("\n");
  let current = "";
  let inBlock = false;
  let blockLang = "";
  let blockContent = "";
  let idCounter = 0;

  for (const line of lines) {
    if (line.startsWith("```") && !inBlock) {
      if (current.trim()) {
        parts.push({ id: `part-${++idCounter}`, type: "text", text: current.trim() });
        current = "";
      }
      inBlock = true;
      blockLang = line.slice(3).trim();
      continue;
    }
    if (line.startsWith("```") && inBlock) {
      parts.push({
        id: `part-${++idCounter}`,
        type: "tool",
        tool: blockLang || "text",
        text: blockContent.trim(),
        status: "completed",
      });
      blockContent = "";
      inBlock = false;
      continue;
    }
    if (inBlock) {
      blockContent += line + "\n";
    } else {
      current += line + "\n";
    }
  }

  if (current.trim()) {
    parts.push({ id: `part-${++idCounter}`, type: "text", text: current.trim() });
  }

  return parts.length > 0 ? parts : [{ id: "part-1", type: "text", text }];
}

const now = Date.now();

export const DEMO_SESSIONS: AgentCardData[] = [
  {
    sessionId: "demo-session-1",
    title: "Implement JWT authentication middleware",
    agentName: "build",
    projectId: "proj-api-gateway",
    directory: "/src/middleware",
    status: "done",
    isExpanded: true,
    isPinned: false,
    model: "anthropic/claude-sonnet-4-20250514",
    providerID: "anthropic",
    tokens: { input: 48210, output: 18734, reasoning: 2104 },
    cost: 0.42,
    createdAt: now - 7200000,
    messages: [
      {
        id: "msg-1-user",
        role: "user",
        createdAt: now - 7200000,
        parts: [{ id: "p-1", type: "text", text: "Implement JWT authentication middleware for the API gateway. Use RS256 algorithm, add token refresh support, and include rate limiting for failed attempts." }],
      },
      {
        id: "msg-1-assistant",
        role: "assistant",
        agent: "build",
        createdAt: now - 7190000,
        completedAt: now - 7180000,
        tokens: { input: 48210, output: 18734, reasoning: 2104 },
        cost: 0.42,
        parts: makeParts(`I'll implement JWT authentication middleware with RS256, token refresh, and rate limiting.

## Plan

1. **Create auth middleware** (\`src/middleware/auth.ts\`) — JWT verification with public key
2. **Token refresh handler** (\`src/middleware/refresh.ts\`) — Sliding expiration window
3. **Rate limiter** (\`src/middleware/rate-limit.ts\`) — 5 failed attempts → 15min lockout
4. **Configuration** — Environment variables for key paths and TTL settings

## Implementation

\`\`\`typescript
// src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { Request, Response, NextFunction } from 'express';

const PUBLIC_KEY = readFileSync(process.env.JWT_PUBLIC_KEY_PATH!, 'utf-8');

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ['RS256'],
      issuer: 'api-gateway',
    });
    req.user = payload as UserPayload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'token_expired',
        refreshUrl: '/auth/refresh',
      });
    }
    res.status(401).json({ error: 'Invalid token' });
  }
}
\`\`\`

## Token Refresh

\`\`\`typescript
// src/middleware/refresh.ts
const refreshTokens = new Map<string, { userId: string; expires: number }>();

export async function refreshHandler(req: Request, res: Response) {
  const { refreshToken } = req.body;
  const stored = refreshTokens.get(refreshToken);
  
  if (!stored || stored.expires < Date.now()) {
    return res.status(401).json({ error: 'Refresh token expired' });
  }

  const newAccessToken = jwt.sign(
    { sub: stored.userId, iat: Math.floor(Date.now() / 1000) },
    PRIVATE_KEY,
    { algorithm: 'RS256', expiresIn: '15m' }
  );

  // Rotate refresh token
  refreshTokens.delete(refreshToken);
  const newRefreshToken = crypto.randomUUID();
  refreshTokens.set(newRefreshToken, {
    userId: stored.userId,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
}
\`\`\`

All three middleware files compiled cleanly. Tests pass for:
- ✅ Valid token → 200
- ✅ Expired token → 401 with refresh hint
- ✅ Invalid signature → 401
- ✅ Missing header → 401
- ✅ Rate limit → 429 after 5 failures
- ✅ Refresh token rotation works

**Done.** The middleware is production-ready. Add \`app.use(authMiddleware)\` to your Express app to activate.`),
      },
    ],
  },
  {
    sessionId: "demo-session-2",
    title: "Architect microservices migration plan",
    agentName: "plan",
    projectId: "proj-migration",
    directory: "/docs/architecture",
    status: "done",
    isExpanded: false,
    isPinned: false,
    model: "anthropic/claude-opus-4-20250514",
    providerID: "anthropic",
    tokens: { input: 125340, output: 42100, reasoning: 8900 },
    cost: 1.87,
    createdAt: now - 14400000,
    messages: [
      {
        id: "msg-2-user",
        role: "user",
        createdAt: now - 14400000,
        parts: [{ id: "p-1", type: "text", text: "Plan a migration from our monolithic Rails app to microservices. We have 12 domains — prioritize which to extract first, recommend service boundaries, and estimate timeline." }],
      },
      {
        id: "msg-2-assistant",
        role: "assistant",
        agent: "plan",
        createdAt: now - 14300000,
        completedAt: now - 14200000,
        tokens: { input: 125340, output: 42100, reasoning: 8900 },
        cost: 1.87,
        parts: makeParts(`## Microservices Migration Plan

### Phase 1: Strangler Pattern (Months 1-3)

Extract the **least coupled** domains first to establish patterns:

| Priority | Domain | Reason | Risk |
|----------|--------|--------|------|
| 1 | **Auth Service** | Independent, shared across all domains | Low |
| 2 | **Notification Service** | Async by nature, no DB coupling | Low |
| 3 | **File Storage** | Simple API surface, S3-backed | Low |

### Phase 2: Core Extraction (Months 4-8)

| Priority | Domain | Dependencies | Risk |
|----------|--------|-------------|------|
| 4 | **User Profile** | Auth Service | Medium |
| 5 | **Billing** | Auth, User Profile | High |
| 6 | **Analytics Pipeline** | Event-driven, read-only on monolith | Medium |

### Phase 3: Deep Integration (Months 9-14)

| Priority | Domain | Approach |
|----------|--------|----------|
| 7 | **Orders** | Dual-write + reconciliation |
| 8 | **Inventory** | CQRS with event sourcing |
| 9 | **Catalog** | Read replica → eventual cutover |
| 10-12 | Remaining | Gradual decomposition |

### Key Decisions

- **Protocol**: gRPC for internal, REST for external
- **Message bus**: Kafka (already in use)
- **Service mesh**: Istio for observability
- **DB per service**: PostgreSQL with migration scripts
- **CI/CD**: GitHub Actions → ArgoCD

**Estimated timeline**: 14 months with 3 teams of 4 engineers.`),
      },
    ],
  },
  {
    sessionId: "demo-session-3",
    title: "Explore codebase for security vulnerabilities",
    agentName: "sisyphus",
    parentID: "demo-session-2",
    projectId: "proj-migration",
    directory: "/",
    status: "busy",
    isExpanded: false,
    isPinned: false,
    model: "google/gemini-2.5-pro",
    providerID: "google",
    tokens: { input: 87200, output: 23500, reasoning: 4100 },
    cost: 0.18,
    createdAt: now - 3600000,
    messages: [
      {
        id: "msg-3-user",
        role: "user",
        createdAt: now - 3600000,
        parts: [{ id: "p-1", type: "text", text: "explore the entire codebase for security issues" }],
      },
      {
        id: "msg-3-assistant",
        role: "assistant",
        agent: "explore",
        createdAt: now - 3500000,
        tokens: { input: 87200, output: 23500, reasoning: 4100 },
        cost: 0.18,
        parts: makeParts(`## Security Audit — In Progress

Scanning the codebase for common vulnerability patterns...

### Findings so far:

\`\`\`typescript
// ⚠️ HIGH: Hardcoded secret in src/services/payment.ts:23
const STRIPE_SECRET = "sk_live_abc123def456";

// ⚠️ MEDIUM: SQL injection risk in src/api/users.ts:45
const query = \`SELECT * FROM users WHERE email = '\${email}'\`;

// ⚠️ LOW: Missing CSP headers in src/middleware/security.ts
// No Content-Security-Policy header set
\`\`\`

### Scanning:
- [x] Dependency audit (3 critical CVEs found)
- [x] Secret detection (4 hardcoded keys)
- [x] Input validation review (12 endpoints unchecked)
- [ ] Auth bypass testing (in progress...)
- [ ] CSRF protection audit (pending)
- [ ] Rate limiting review (pending)

Still scanning... 67% complete.`),
      },
    ],
  },
  {
    sessionId: "demo-session-4",
    title: "Refactor user service to clean architecture",
    agentName: "build",
    projectId: "proj-refactor",
    directory: "/src/services/user",
    status: "error",
    isExpanded: true,
    isPinned: false,
    model: "deepseek/deepseek-v4-pro",
    providerID: "deepseek",
    tokens: { input: 56800, output: 0, reasoning: 0 },
    cost: 0.08,
    createdAt: now - 1800000,
    messages: [
      {
        id: "msg-4-user",
        role: "user",
        createdAt: now - 1800000,
        parts: [{ id: "p-1", type: "text", text: "Refactor src/services/user to follow clean architecture. Split into domain, application, infrastructure, and presentation layers." }],
      },
      {
        id: "msg-4-assistant",
        role: "assistant",
        agent: "build",
        createdAt: now - 1700000,
        tokens: { input: 56800, output: 0, reasoning: 0 },
        cost: 0.08,
        error: "Context window exceeded — the user service has 14,000 lines across 83 files. Consider splitting the refactor into smaller chunks or use a model with larger context.",
        parts: makeParts(`## Error: Context Window Exceeded

The user service at \`src/services/user/\` contains:

\`\`\`
83 files, 14,237 lines of code
Domain logic: 4,821 LOC
Database layer: 3,102 LOC  
API handlers: 2,894 LOC
Tests: 3,420 LOC
\`\`\`

### Recommended Approach

Break this into **3 separate sessions**:

1. **Session 1**: Extract domain entities and value objects → \`src/domain/user/\`
2. **Session 2**: Move repository implementations → \`src/infrastructure/user/\`
3. **Session 3**: Refactor API layer → \`src/presentation/user/\`

Each chunk will fit within context limits and can be verified independently.`),
      },
    ],
  },
  {
    sessionId: "demo-session-5",
    title: "Generate unit tests for auth module",
    agentName: "build",
    projectId: "proj-api-gateway",
    directory: "/src/middleware",
    status: "idle",
    isExpanded: false,
    isPinned: false,
    model: "openai/gpt-5",
    providerID: "openai",
    tokens: { input: 0, output: 0, reasoning: 0 },
    cost: 0,
    createdAt: now - 600000,
    messages: [],
  },
  {
    sessionId: "demo-session-6",
    title: "Document API endpoints with OpenAPI spec",
    agentName: "librarian",
    parentID: "demo-session-1",
    projectId: "proj-api-gateway",
    directory: "/docs/api",
    status: "done",
    isExpanded: false,
    isPinned: false,
    model: "anthropic/claude-sonnet-4-20250514",
    providerID: "anthropic",
    tokens: { input: 32100, output: 15200, reasoning: 1800 },
    cost: 0.21,
    createdAt: now - 5400000,
    messages: [
      {
        id: "msg-6-user",
        role: "user",
        createdAt: now - 5400000,
        parts: [{ id: "p-1", type: "text", text: "Document all API endpoints in OpenAPI 3.1 format, include auth middleware requirements" }],
      },
      {
        id: "msg-6-assistant",
        role: "assistant",
        agent: "librarian",
        createdAt: now - 5300000,
        completedAt: now - 5200000,
        tokens: { input: 32100, output: 15200, reasoning: 1800 },
        cost: 0.21,
        parts: makeParts(`## API Documentation

Generated \`openapi.yaml\` with 14 endpoints documented:

\`\`\`yaml
openapi: 3.1.0
info:
  title: API Gateway
  version: 2.4.0
  description: JWT-authenticated REST API gateway

servers:
  - url: https://api.example.com/v2

paths:
  /auth/login:
    post:
      summary: Authenticate user
      security: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                email: { type: string, format: email }
                password: { type: string, minLength: 8 }
      responses:
        '200':
          description: JWT access + refresh tokens
        '429':
          description: Rate limited — too many failed attempts

  /users/me:
    get:
      summary: Get current user profile
      security:
        - bearerAuth: []
      responses:
        '200':
          description: User profile object
        '401':
          description: Invalid or expired token
\`\`\`

All endpoints documented with request/response schemas, auth requirements, and error codes. Spec passes spectral lint validation.`),
      },
    ],
  },
];

export const DEMO_DEFAULT_MODEL = "anthropic/claude-sonnet-4-20250514";

export const isDemoMode = (): boolean => {
  if (typeof window !== "undefined") {
    if (localStorage.getItem("opencode-demo-disabled") === "true") return false;
  }
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
};

export function disableDemoMode() {
  if (typeof window !== "undefined") {
    localStorage.setItem("opencode-demo-disabled", "true");
  }
}
