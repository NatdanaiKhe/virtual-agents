"use client";

import { useAppStore, type SessionStatus } from "../../lib/store";
import { StatusBar } from "../thegridcn/status-bar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search } from "lucide-react";

const STATUSES: Array<{ value: SessionStatus | "all"; label: string }> = [
  { value: "all", label: "ALL" }, { value: "idle", label: "IDLE" }, { value: "busy", label: "RUN" }, { value: "done", label: "DONE" }, { value: "error", label: "ERR" },
];

export function FilterBar() {
  const { filter, statusFilter, setFilter, setStatusFilter } = useAppStore();

  return (
    <div className="px-4 sm:px-6 lg:px-8">
    <StatusBar
      variant={statusFilter === "error" ? "alert" : "default"}
      leftContent={
        <div className="relative w-48">
          <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="FILTER..." className="pl-8 h-7 text-[10px] font-mono uppercase tracking-wider border-0 bg-transparent focus-visible:ring-0" />
        </div>
      }
      rightContent={
        <div className="flex items-center gap-0.5">
          {STATUSES.map((s) => (
            <Button key={s.value} variant={statusFilter === s.value ? "default" : "ghost"} size="sm" onClick={() => setStatusFilter(s.value)} className="font-mono text-[10px] tracking-widest h-6 px-2">
              {s.label}
            </Button>
          ))}
        </div>
      }
    />
    </div>
  );
}
