"use client";

import { useCallback, useMemo } from "react";
import { cn } from "../../lib/utils";
import { useAppStore, type AgentCardData, type PartData, type MessageData } from "../../lib/store";
import { getAgentTheme } from "../../lib/agent-characters";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { StatusIndicator } from "../molecules/status-indicator";
import { PromptGroup } from "../molecules/prompt-group";
import { TerminalPane } from "./terminal-pane";
import { client } from "../../lib/api";
import { X, ChevronDown, ChevronUp, Copy, Pin, PinOff } from "lucide-react";

interface AgentCardProps { session: AgentCardData }

export function AgentCard({ session }: AgentCardProps) {
  const { updateSession, removeSession, addMessage, setStatus, toggleExpand, togglePin, agents, models } = useAppStore();
  const agentTheme = useMemo(() => getAgentTheme(session.agentName || ""), [session.agentName]);

  const getAllParts = useCallback((): PartData[] => session.messages.flatMap((m) => m.parts), [session.messages]);
  const outputText = useCallback(() => getAllParts().map((p) => p.text ?? p.output ?? "").filter(Boolean).join("\n"), [getAllParts]);

  const handleSendPrompt = useCallback(async (text: string, agent?: string, model?: { providerID: string; modelID: string }) => {
    const userMsg: MessageData = { id: `user-${Date.now()}`, role: "user", parts: [{ id: `${Date.now()}-part`, type: "text", text }], createdAt: Date.now() };
    addMessage(session.sessionId, userMsg);
    setStatus(session.sessionId, "busy");
    try {
      const data = await client.session.prompt(session.sessionId, { parts: [{ type: "text", text }], agent: agent ?? undefined, model: model ?? undefined });
      if (data?.info) {
        const { info, parts } = data;
        addMessage(session.sessionId, { id: info.id, role: "assistant", parts: parts.map((p: PartData) => ({ id: p.id, type: p.type, text: p.text, tool: p.tool, status: p.status, output: p.output, title: p.title })), tokens: info.tokens, cost: info.cost, createdAt: info.time?.created, completedAt: info.time?.completed });
        updateSession(session.sessionId, { tokens: info.tokens ?? session.tokens, cost: info.cost ?? session.cost });
      }
      setStatus(session.sessionId, "done");
    } catch { setStatus(session.sessionId, "error"); }
  }, [session.sessionId, session.tokens, session.cost, addMessage, updateSession, setStatus]);

  const handleAbort = useCallback(async () => {
    try { await client.session.abort(session.sessionId); } catch {}
    removeSession(session.sessionId);
  }, [session.sessionId, removeSession]);

  return (
    <div
      data-slot="tron-agent-card"
      data-status={session.status === "error" ? "alert" : "active"}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-lg border bg-card/80 backdrop-blur-sm",
        "transition-all duration-300 animate-fade-in",
        session.status === "error" ? "border-destructive/50" : "border-primary/30",
        session.isPinned && "border-primary/60 shadow-[0_0_20px_var(--primary)]",
      )}
    >
      {/* Scanline overlay (Gridcn DataCard pattern) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,var(--primary)_2px,var(--primary)_4px)]" />

      {/* Corner brackets (Gridcn HUD style) */}
      <CornerBracket pos="tl" />
      <CornerBracket pos="tr" />
      <CornerBracket pos="bl" />
      <CornerBracket pos="br" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon-sm" onClick={() => toggleExpand(session.sessionId)}>
            {session.isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-base drop-shadow-[0_0_6px_var(--primary)]">{agentTheme.icon}</span>
              <h3 className="truncate text-sm font-bold uppercase tracking-wider text-foreground">{session.agentName || "UNTITLED"}</h3>
              {session.model && <Badge variant="secondary" className="font-mono text-[10px]">{session.model}</Badge>}
            </div>
            <p className="truncate text-[11px] text-muted-foreground font-mono">{session.sessionId.slice(0, 12)}…</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <StatusIndicator status={session.status} />
          <div className="flex items-center ml-1">
            <Button variant="ghost" size="icon-sm" onClick={() => togglePin(session.sessionId)} className={session.isPinned ? "text-primary" : ""}>{session.isPinned ? <Pin className="h-3.5 w-3.5" /> : <PinOff className="h-3.5 w-3.5" />}</Button>
            <Button variant="ghost" size="icon-sm" onClick={() => navigator.clipboard.writeText(session.sessionId)}><Copy className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon-sm" onClick={() => navigator.clipboard.writeText(outputText())}>📋</Button>
            <Button variant="ghost" size="icon-sm" onClick={() => session.status === "done" || session.status === "idle" ? removeSession(session.sessionId) : handleAbort()} className="hover:text-destructive"><X className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      {/* Body */}
      {session.isExpanded && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-[200px] max-h-[500px] overflow-hidden bg-background rounded-md m-3 border border-border/50">
            <TerminalPane parts={getAllParts()} className="h-full" />
          </div>
          {(session.tokens.input > 0 || session.tokens.output > 0) && (
            <div className="flex items-center gap-3 px-4 py-1.5 text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
              <span className="text-primary">|</span>
              <span>IN:{session.tokens.input.toLocaleString()}</span>
              <span>OUT:{session.tokens.output.toLocaleString()}</span>
              {session.tokens.reasoning > 0 && <span>RSN:{session.tokens.reasoning.toLocaleString()}</span>}
              {session.cost > 0 && <span className="text-primary/80">${session.cost.toFixed(4)}</span>}
            </div>
          )}
          <div className="px-3 pb-3 pt-1">
            <PromptGroup agents={agents} models={models} defaultAgent={session.agentName} defaultModel={session.model} disabled={session.status === "busy"} onSubmit={handleSendPrompt} />
          </div>
        </div>
      )}
    </div>
  );
}

function CornerBracket({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const cls = {
    tl: "left-0 top-0 border-l-2 border-t-2 rounded-tl",
    tr: "right-0 top-0 border-r-2 border-t-2 rounded-tr",
    bl: "left-0 bottom-0 border-l-2 border-b-2 rounded-bl",
    br: "right-0 bottom-0 border-r-2 border-b-2 rounded-br",
  };
  return <div className={cn("pointer-events-none absolute h-3 w-3 border-primary/40", cls[pos])} />;
}
