"use client";

import { memo } from "react";
import { cn } from "../../lib/utils";
import { PixelSprite } from "../atoms/pixel-sprite";
import { StatusDot } from "../atoms/status-dot";
import type { SessionStatus } from "../../lib/store";

interface AgentCharacterPillProps {
  agentName: string;
  status: SessionStatus;
  isSelected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}

function AgentCharacterPillInner({
  agentName,
  status,
  isSelected,
  onClick,
  size = "md",
}: AgentCharacterPillProps) {
  const spriteSize = size === "sm" ? 32 : 48;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
        isSelected
          ? "border-primary/60 bg-primary/10 shadow-[0_0_10px_var(--primary)]"
          : "border-border/50 bg-card/40 hover:border-primary/30 hover:bg-card/60",
      )}
    >
      <div className="relative">
        <PixelSprite agentName={agentName} status={status} size={spriteSize} />
        <span className="absolute -bottom-0.5 -right-0.5">
          <StatusDot
            status={status === "busy" ? "busy" : status === "error" ? "disconnected" : "connected"}
          />
        </span>
      </div>
      <span className="text-[10px] font-mono uppercase tracking-wider text-foreground/80 truncate max-w-[64px]">
        {agentName}
      </span>
      <span
        className={cn(
          "text-[8px] font-mono uppercase tracking-widest",
          status === "busy" && "text-primary",
          status === "error" && "text-destructive",
          status === "done" && "text-green-400",
          status === "idle" && "text-muted-foreground",
          status === "retry" && "text-amber-400",
        )}
      >
        {status === "busy" ? "RUN" : status === "done" ? "DONE" : status === "error" ? "ERR" : "IDLE"}
      </span>
    </button>
  );
}

export const AgentCharacterPill = memo(AgentCharacterPillInner);
