"use client";

import { useState, useEffect, type KeyboardEvent } from "react";
import { cn } from "../../lib/utils";
import { getAgentTheme } from "../../lib/agent-characters";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { AgentOption, ModelOption } from "../../lib/store";

interface PromptGroupProps {
  agents: AgentOption[];
  models: ModelOption[];
  defaultAgent?: string;
  defaultModel?: string;
  disabled?: boolean;
  onSubmit: (text: string, agent?: string, model?: { providerID: string; modelID: string }) => void;
  className?: string;
}

export function PromptGroup({
  agents, models, defaultAgent, defaultModel, disabled, onSubmit, className,
}: PromptGroupProps) {
  const baseAgent = process.env.NEXT_PUBLIC_DEFAULT_AGENT
  const [text, setText] = useState("");
  const [agent, setAgent] = useState(baseAgent);
  console.log("🚀 ~ PromptGroup ~ defaultAgent:", defaultAgent)
  const [model, setModel] = useState(defaultModel ?? "");

  // Sync defaults when session data loads (messages arrive async)
  useEffect(() => { if (defaultAgent && !agent) setAgent(defaultAgent); }, [defaultAgent]);
  useEffect(() => { if (defaultModel && !model) setModel(defaultModel); }, [defaultModel]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    let modelObj: { providerID: string; modelID: string } | undefined;
    if (model) {
      const [providerID, ...rest] = model.split("/");
      modelObj = { providerID, modelID: rest.join("/") };
    }
    onSubmit(trimmed, agent || undefined, modelObj);
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {(agents.length > 0 || models.length > 0) && (
        <div className="flex items-center gap-2">
          {agents.length > 0 && (
            <Select value={agent} onValueChange={setAgent} disabled={disabled}>
              <SelectTrigger size="sm" className="w-fit gap-1 font-mono text-[11px] uppercase tracking-wider">
                <SelectValue placeholder="AGENT" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((a) => (
                  <SelectItem key={a.name} value={a.name}>{getAgentTheme(a.name).icon} {a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {models.length > 0 && (
            <Select value={model} onValueChange={setModel} disabled={disabled}>
              <SelectTrigger size="sm" className="w-fit gap-1 font-mono text-[11px]">
                <SelectValue placeholder="MODEL" />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={`${m.providerID}/${m.id}`} value={`${m.providerID}/${m.id}`}>
                    {m.providerID}/{m.name || m.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
      <div className="flex items-end gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "AGENT BUSY..." : "SEND FOLLOW-UP PROMPT..."}
          className="flex-1 font-mono text-xs uppercase tracking-wider"
        />
        <Button onClick={handleSubmit} disabled={disabled || !text.trim()} variant="outline" size="sm">SEND</Button>
      </div>
    </div>
  );
}
