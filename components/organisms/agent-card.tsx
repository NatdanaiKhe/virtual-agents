"use client";

import { useState, useCallback } from "react";
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
import { PromptGroup } from "../molecules/prompt-group";
import { TerminalPane } from "./terminal-pane";
import { PixelSprite } from "../atoms/pixel-sprite";
import { client } from "../../lib/api";
import {
  X,
  ChevronUp,
  ChevronDown,
  Copy,
  Pin,
  PinOff,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Modal } from "../thegridcn/modal";

interface AgentCardProps {
  session: AgentCardData;
}

export function AgentCard({ session }: Readonly<AgentCardProps>) {
  const {
    updateSession,
    removeSession,
    addMessage,
    setStatus,
    toggleExpand,
    togglePin,
    agents,
    models,
  } = useAppStore();
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [charExpanded, setCharExpanded] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getAllParts = useCallback(
    (): PartData[] => session.messages.flatMap((m) => m.parts),
    [session.messages],
  );
  const outputText = useCallback(
    () =>
      getAllParts()
        .map((p) => p.text ?? p.output ?? "")
        .filter(Boolean)
        .join("\n"),
    [getAllParts],
  );

  const handleSendPrompt = useCallback(
    async (
      text: string,
      agent?: string,
      model?: { providerID: string; modelID: string },
    ) => {
      const userMsg: MessageData = {
        id: `user-${Date.now()}`,
        role: "user",
        parts: [{ id: `${Date.now()}-part`, type: "text", text }],
        createdAt: Date.now(),
      };
      addMessage(session.sessionId, userMsg);
      setStatus(session.sessionId, "busy");
      setTerminalOpen(true);
      try {
        const data = await client.session.prompt(session.sessionId, {
          parts: [{ type: "text", text }],
          agent: agent ?? undefined,
          model: model ?? undefined,
        });
        if (data?.info) {
          const { info, parts } = data;
          addMessage(session.sessionId, {
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
          updateSession(session.sessionId, {
            tokens: info.tokens ?? session.tokens,
            cost: info.cost ?? session.cost,
          });
        }
        setStatus(session.sessionId, "done");
      } catch {
        setStatus(session.sessionId, "error");
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(session.sessionId);
  };

  const handleDeleteSession = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    if (session.status === "busy") {
      try {
        await client.session.abort(session.sessionId);
      } catch {}
    }
    try {
      await client.session.delete(session.sessionId);
    } catch {}
    removeSession(session.sessionId);
  };

  const getAgentStatus = () => {
    let statusText: string;

    switch (session.status) {
      case "busy":
        statusText = "PROCESSING";
        break;
      case "error":
        statusText = "ERROR";
        break;
      case "done":
        statusText = "COMPLETE";
        break;
      default:
        statusText = "IDLE";
    }

    return statusText;
  };

  return (
    <div
      data-slot="tron-agent-card"
      className={cn(
        "relative flex flex-col overflow-hidden rounded-lg border bg-card/80 backdrop-blur-sm",
        "transition-all duration-300 animate-fade-in",
        session.status === "error"
          ? "border-destructive/50"
          : "border-primary/30",
        session.isPinned && "border-primary/60",
      )}
    >
      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,var(--primary)_2px,var(--primary)_4px)]" />
      {/* Corner brackets */}
      <CornerBracket pos="tl" /> <CornerBracket pos="tr" />{" "}
      <CornerBracket pos="bl" /> <CornerBracket pos="br" />
      {/* ── Header (always visible, slim) ── */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0 border border-red-500">
          <h3 className="truncate text-xs font-bold uppercase tracking-wider text-foreground">
            {session.title || session.agentName || "UNTITLED"}
          </h3>
          <Badge
            variant="outline"
            className="font-mono text-[9px] text-primary/80 border-primary/30"
          >
            {session.agentName || "unknown"}
          </Badge>
          {session.parentID && (
            <Badge
              variant="outline"
              className="font-mono text-[9px] text-muted-foreground border-muted-foreground/30"
            >
              SUB
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
          <Button variant="ghost" size="icon-sm" onClick={copyToClipboard}>
            <Copy className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDeleteSession}
            className="hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-4 bg-border/50 mx-0.5" />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => toggleExpand(session.sessionId)}
            title={session.isExpanded ? "Collapse Card" : "Expand Card"}
          >
            {session.isExpanded ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        <div>
          {session.model && (
            <Badge variant="secondary" className="font-mono text-[9px]">
              {session.model}
            </Badge>
          )}
          <p className="hidden sm:block truncate text-[10px] text-muted-foreground font-mono">
            {session.sessionId.slice(0, 10)}…
          </p>
        </div>
      </div>
      {/* ── Body (visible when card expanded) ── */}
      {session.isExpanded && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Character info row */}
          {charExpanded && (
            <div className="relative flex flex-col items-center gap-2 px-4 py-4 border-b border-border/30">
              <PixelSprite
                agentName={session.agentName || ""}
                status={session.status}
                size={64}
              />
              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {session.agentName || "AGENT"}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">
                  {getAgentStatus()}
                </div>
                {(session.tokens.input > 0 || session.tokens.output > 0) && (
                  <div className="flex items-center justify-center gap-2 mt-1.5 text-[10px] text-muted-foreground font-mono">
                    <span className="text-primary/60">
                      IN:{session.tokens.input.toLocaleString()}
                    </span>
                    <span className="text-primary/60">
                      OUT:{session.tokens.output.toLocaleString()}
                    </span>
                    {session.cost > 0 && (
                      <span className="text-primary/80">
                        ${session.cost.toFixed(4)}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setCharExpanded(false)}
                title="Hide character"
                className="absolute top-2 right-2"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
            </div>
          )}

          {!charExpanded && (
            <div className="px-4 py-1.5 border-b border-border/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCharExpanded(true)}
                className="text-[10px] font-mono text-muted-foreground h-6"
              >
                <ChevronDown className="h-3 w-3 mr-1" /> CHARACTER
              </Button>
            </div>
          )}

          {/* Terminal section with its own collapse */}
          <div className="flex flex-col min-h-0 flex-1">
            {terminalOpen ? (
              <>
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-border/30">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    TERMINAL
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
                  style={{ height: 200, overflow: "hidden" }}
                >
                  <TerminalPane parts={getAllParts()} className="h-full" />
                </div>
              </>
            ) : (
              <div className="px-4 py-1.5 border-b border-border/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTerminalOpen(true)}
                  className="text-[10px] font-mono text-muted-foreground h-6"
                >
                  <ChevronDown className="h-3 w-3 mr-1" /> TERMINAL (
                  {getAllParts().length} lines)
                </Button>
              </div>
            )}
          </div>

          {/* Prompt input */}
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
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="DELETE SESSION"
        description={`Are you sure you want to delete "${session.title || session.agentName || "UNTITLED"}"? ${session.status === "busy" ? "This will abort the running agent first." : "This action cannot be undone."}`}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              CANCEL
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmDelete}>
              DELETE
            </Button>
          </div>
        }
      />
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
  return (
    <div
      className={cn(
        "pointer-events-none absolute h-3 w-3 border-primary/40",
        cls[pos],
      )}
    />
  );
}
