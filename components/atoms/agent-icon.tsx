"use client";

import { getAgentTheme } from "../../lib/agent-characters";

export function AgentIcon({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const theme = getAgentTheme(name);
  const sizeClass = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";

  return (
    <span className={`inline-flex items-center justify-center ${sizeClass}`} title={theme.label}>
      {theme.icon}
    </span>
  );
}
