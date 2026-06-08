"use client";

import { Badge } from "../ui/badge";
import { StatusDot } from "../atoms/status-dot";
import type { SessionStatus } from "../../lib/store";

const labels: Record<SessionStatus, string> = { idle: "IDLE", busy: "RUNNING", error: "ERROR", done: "DONE", retry: "RETRYING" };
const variants: Record<SessionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  idle: "outline", busy: "default", error: "destructive", done: "secondary", retry: "outline",
};

export function StatusIndicator({ status }: { status: SessionStatus }) {
  return (
    <Badge variant={variants[status]} className="gap-1.5 font-mono text-[10px] tracking-widest">
      <StatusDot status={status === "busy" ? "busy" : status === "error" ? "disconnected" : "connected"} />
      {labels[status]}
    </Badge>
  );
}
