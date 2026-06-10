"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { cn } from "../../lib/utils";
import {
  useAppStore,
  type AgentCardData,
  type PartData,
  type MessageData,
} from "../../lib/store";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { StatusIndicator } from "../molecules/status-indicator";
import { AgentCharacterPill } from "../molecules/agent-character-pill";
import { PromptGroup } from "../molecules/prompt-group";
import { TerminalPane } from "./terminal-pane";
import { client } from "../../lib/api";
import {
  X,
  ChevronUp,
  Maximize2,
  Minimize2,
  Copy,
  Pin,
  PinOff,
  ChevronDown,
} from "lucide-react";

interface AgentCardProps {
  session: AgentCardData;
  children: AgentCardData[];
}

export function AgentCardInner({ session, children }: AgentCardProps) {
  const {
    updateSession,
    removeSession,
    deleteSession,
    addMessage,
    setStatus,
    toggleExpand,
    togglePin,
    agents,
    models,
  } = useAppStore();

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(true);

  // Combine parent + children for character pane
  const allAgents = useMemo(() => [session, ...children], [session, children]);

  // Read-only sessions (sub-agents with denied write/edit permissions are read-only)
  const selectedAgent = useMemo(
    () => allAgents.find((a) => a.sessionId === selectedAgentId) ?? session,
    [allAgents, selectedAgentId, session],
  );

  const selectedParts = useCallback(
    (): PartData[] => selectedAgent.messages.flatMap((m) => m.parts),
    [selectedAgent.messages],
  );

  const outputText = useCallback(
    () =>
      selectedParts()
        .map((p) => p.text ?? p.output ?? "")
        .filter(Boolean)
        .join("\n"),
    [selectedParts],
  );

  const handleSendPrompt = useCallback(
    async (
      text: string,
      agent?: string,
      model?: { providerID: string; modelID: string },
    ) => {
      const targetId = session.sessionId; // Always prompt the parent session
      const userMsg: MessageData = {
        id: `user-${Date.now()}`,
        role: "user",
        parts: [{ id: `${Date.now()}-part`, type: "text", text }],
        createdAt: Date.now(),
      };
      addMessage(targetId, userMsg);
      setStatus(targetId, "busy");
      setTerminalOpen(true);
      try {
        const data = await client.session.prompt(targetId, {
          parts: [{ type: "text", text }],
          agent: agent ?? undefined,
          model: model ?? undefined,
        });
        if (data?.info) {
          const { info, parts } = data;
          addMessage(targetId, {
            id: info.id,
            role: "assistant",
            parts: parts.map((p: PartData) => ({
              id: p.id,
              type: p.type,
              text: p.text,
              tool: p.tool,
              status: p.status,
              output: p.output,
              title: p.title,
            })),
            tokens: info.tokens,
            cost: info.cost,
            createdAt: info.time?.created,
            completedAt: info.time?.completed,
          });
          updateSession(targetId, {
            tokens: info.tokens ?? session.tokens,
            cost: info.cost ?? session.cost,
          });
        }
        setStatus(targetId, "done");
      } catch {
        setStatus(targetId, "error");
      }
    },
    [
      session.sessionId,
      session.tokens,
      session.cost,
      addMessage,
      updateSession,
      setStatus,
    ],
  );

  const handleDelete = useCallback(async () => {
    deleteSession(session.sessionId);
    for (const c of children) deleteSession(c.sessionId);
  }, [session.sessionId, children, removeSession]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div
      data-slot="tron-agent-card"
      className={cn(
        "relative flex flex-col overflow-hidden rounded-lg border bg-card/80 backdrop-blur-sm transition-all duration-300 animate-fade-in",
        session.status === "error"
          ? "border-destructive/50"
          : "border-primary/30",
        session.isPinned && "border-primary/60",
      )}
    >
      {/* Scanline + corners */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,var(--primary)_2px,var(--primary)_4px)]" />
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="truncate text-xs font-bold uppercase tracking-wider text-foreground">
            {session.title || session.agentName || "UNTITLED"}
          </h3>
          <Badge
            variant="outline"
            className="font-mono text-[9px] text-primary/80 border-primary/30"
          >
            {session.agentName || "unknown"}
          </Badge>
          {session.model && (
            <Badge variant="secondary" className="font-mono text-[9px]">
              {session.model}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <StatusIndicator status={session.status} />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => togglePin(session.sessionId)}
            className={session.isPinned ? "text-primary" : ""}
          >
            {session.isPinned ? (
              <Pin className="h-3 w-3" />
            ) : (
              <PinOff className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigator.clipboard.writeText(session.sessionId)}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigator.clipboard.writeText(outputText())}
            className="text-[10px]"
          >
            📋
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-4 bg-border/50 mx-0.5" />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => toggleExpand(session.sessionId)}
          >
            {session.isExpanded ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      {session.isExpanded && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Character pane */}
          <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto border-b border-border/30">
            {allAgents.map((agent) => (
              <AgentCharacterPill
                key={agent.sessionId}
                agentName={agent.agentName}
                status={agent.status}
                isSelected={selectedAgent.sessionId === agent.sessionId}
                onClick={() =>
                  setSelectedAgentId(
                    agent.sessionId === session.sessionId
                      ? null
                      : agent.sessionId,
                  )
                }
                size={allAgents.length > 3 ? "sm" : "md"}
              />
            ))}
          </div>

          {/* Terminal section */}
          <div className="flex flex-col min-h-0 flex-1">
            {terminalOpen ? (
              <>
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-border/30">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    TERMINAL · {selectedAgent.agentName || "OUTPUT"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setTerminalOpen(false)}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                </div>
                <div
                  className="bg-background rounded-md m-3 border border-border/50"
                  style={{ height: 300 }}
                >
                  <TerminalPane parts={selectedParts()} className="h-full" />
                </div>
              </>
            ) : (
              <div className="flex justify-end px-4 py-1.5 border-b border-border/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTerminalOpen(true)}
                  className="text-[10px] font-mono text-muted-foreground h-6"
                >
                  TERMINAL ({selectedParts().length} lines)
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Token stats */}
          {(session.tokens.input > 0 || session.tokens.output > 0) && (
            <div className="flex items-center gap-3 px-4 py-1.5 text-[10px] text-muted-foreground font-mono uppercase tracking-wider border-t border-border/30">
              <span className="text-primary">|</span>
              <span>IN:{session.tokens.input.toLocaleString()}</span>
              <span>OUT:{session.tokens.output.toLocaleString()}</span>
              {session.cost > 0 && (
                <span className="text-primary/80">
                  ${session.cost.toFixed(4)}
                </span>
              )}
            </div>
          )}

          {/* Prompt */}
          <div className="px-3 pb-3 pt-2 border-t border-border/30">
            <PromptGroup
              agents={agents}
              models={models}
              defaultAgent={session.agentName}
              defaultModel={session.model}
              disabled={session.status === "busy"}
              onSubmit={handleSendPrompt}
            />
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative rounded-lg border border-border/50 bg-card p-6 shadow-2xl max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">
              DELETE SESSION
            </div>
            <div className="text-[11px] text-muted-foreground font-mono mb-4">
              Delete "{session.title || session.agentName}"
              {children.length > 0
                ? ` and ${children.length} sub-agent(s)`
                : ""}
              ?
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                CANCEL
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                DELETE
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const AgentCard = memo(AgentCardInner, (prev, next) =>
  prev.session === next.session && prev.children === next.children
);

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const cls = {
    tl: "left-0 top-0 border-l-2 border-t-2",
    tr: "right-0 top-0 border-r-2 border-t-2",
    bl: "left-0 bottom-0 border-l-2 border-b-2",
    br: "right-0 bottom-0 border-r-2 border-b-2",
  };
  return (
    <div
      className={cn(
        "pointer-events-none absolute h-3 w-3 border-primary/40",
        cls[pos],
      )}
    />
  );
}
