export interface AgentTheme {
  icon: string;
  label: string;
  color: string;
  glow: string;
  theme: string;
}

const agentThemes: Record<string, AgentTheme> = {
  build:    { icon: "⚔️", label: "Ares · Builder",   color: "#ff3333", glow: "0 0 12px rgba(255,51,51,0.3)",   theme: "ares" },
  plan:     { icon: "🦉", label: "Athena · Planner",  color: "#ffd700", glow: "0 0 12px rgba(255,215,0,0.3)",   theme: "athena" },
  explore:  { icon: "🔍", label: "Tron · Explorer",   color: "#00d4ff", glow: "0 0 12px rgba(0,212,255,0.3)",   theme: "tron" },
  oracle:   { icon: "🔮", label: "Oracle · Seer",     color: "#bb9af7", glow: "0 0 12px rgba(187,154,247,0.3)",  theme: "tron" },
  librarian:{ icon: "📚", label: "Athena · Librarian",color: "#ffd700", glow: "0 0 12px rgba(255,215,0,0.3)",   theme: "athena" },
  metis:    { icon: "💡", label: "Metis · Counselor", color: "#ff9e64", glow: "0 0 12px rgba(255,158,100,0.3)",  theme: "athena" },
  momus:    { icon: "🌊", label: "Poseidon · Critic", color: "#0066ff", glow: "0 0 12px rgba(0,102,255,0.3)",   theme: "poseidon" },
  general:  { icon: "🤖", label: "Clu · General",     color: "#ff6600", glow: "0 0 12px rgba(255,102,0,0.3)",   theme: "clu" },
  sisyphus: { icon: "🪨", label: "Ares · Sisyphus",   color: "#ff3333", glow: "0 0 12px rgba(255,51,51,0.3)",   theme: "ares" },
  prometheus:{ icon: "🔥", label: "Prometheus · Fire", color: "#ff6600", glow: "0 0 12px rgba(255,102,0,0.3)",   theme: "clu" },
};

const defaultTheme: AgentTheme = {
  icon: "💠", label: "Program", color: "#00d4ff", glow: "0 0 12px rgba(0,212,255,0.2)", theme: "tron",
};

export function getAgentTheme(agentName: string): AgentTheme {
  const lower = agentName.toLowerCase();
  return agentThemes[lower] ?? { ...defaultTheme, label: agentName || defaultTheme.label };
}

export function getAgentCharacter(agentName: string): AgentTheme {
  return getAgentTheme(agentName);
}

export { agentThemes, defaultTheme };
