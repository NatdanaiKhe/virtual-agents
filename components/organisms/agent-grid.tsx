"use client";

import { useAppStore } from "../../lib/store";
import { AgentCard } from "./agent-card";
import { cn } from "../../lib/utils";

export function AgentGrid() {
  const sessions = useAppStore((s) => s.sessions);
  const filter = useAppStore((s) => s.filter);
  const statusFilter = useAppStore((s) => s.statusFilter);

  const filtered = Array.from(sessions.values())
    .filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (!filter) return true;
      const q = filter.toLowerCase();
      return s.agentName.toLowerCase().includes(q) || s.sessionId.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      // Children grouped under parents
      if (a.parentID === b.sessionId) return 1;
      if (b.parentID === a.sessionId) return -1;
      if (a.parentID && b.parentID && a.parentID === b.parentID) return (a.createdAt ?? 0) - (b.createdAt ?? 0);
      return (b.createdAt ?? 0) - (a.createdAt ?? 0);
    });

  if (sessions.size === 0) return null;

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-xs font-mono uppercase tracking-widest">
        NO SESSIONS MATCH FILTER
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-4", filtered.length === 1 ? "max-w-3xl mx-auto" : "")}>
      {filtered.map((s) => (
        <div key={s.sessionId} className={cn(filtered.length === 1 ? "w-full" : "w-full lg:w-[calc(50%-0.5rem)]", s.parentID && "ml-6 border-l-2 border-primary/20 pl-4")}>
          <AgentCard session={s} />
        </div>
      ))}
    </div>
  );
}
