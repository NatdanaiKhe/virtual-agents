"use client";

import { useMemo, memo } from "react";
import { useAppStore } from "../../lib/store";
import { AgentCard } from "./agent-card";
import { cn } from "../../lib/utils";

function AgentGridInner() {
  const sessions = useAppStore((s) => s.sessions);
  const filter = useAppStore((s) => s.filter);
  const statusFilter = useAppStore((s) => s.statusFilter);

  const sessionArray = Array.from(sessions.values());

  // Build parent → children map
  const { parents, childMap } = useMemo(() => {
    const map = new Map<string, typeof sessionArray>();
    const tops: typeof sessionArray = [];
    for (const s of sessionArray) {
      if (s.parentID) {
        const list = map.get(s.parentID) || [];
        list.push(s);
        map.set(s.parentID, list);
      } else {
        tops.push(s);
      }
    }
    return { parents: tops, childMap: map };
  }, [sessionArray]);

  const filtered = parents
    .filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (!filter) return true;
      const q = filter.toLowerCase();
      return (s.title + s.agentName + s.sessionId).toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
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
      {filtered.map((parent) => (
        <div key={parent.sessionId} className={filtered.length === 1 ? "w-full" : "w-full lg:w-[calc(50%-0.5rem)]"}>
          <AgentCard session={parent} children={childMap.get(parent.sessionId) || []} />
        </div>
      ))}
    </div>
  );
}

export const AgentGrid = memo(AgentGridInner);
