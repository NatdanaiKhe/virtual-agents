"use client";

import { cn } from "../../lib/utils";

interface StatusDotProps {
  status: "connected" | "disconnected" | "busy";
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full",
        status === "connected" && "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]",
        status === "busy" && "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.5)] animate-pulse",
        status === "disconnected" && "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]",
        className
      )}
    />
  );
}
