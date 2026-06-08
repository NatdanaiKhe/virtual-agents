"use client";

import { useState, useCallback, useEffect } from "react";
import { useAppStore } from "../../lib/store";
import { getAgentTheme } from "../../lib/agent-characters";
import { client } from "../../lib/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { X, Plus } from "lucide-react";
import { cn } from "../../lib/utils";

interface NewSessionModalProps { isOpen: boolean; onClose: () => void }

export function NewSessionModal({ isOpen, onClose }: NewSessionModalProps) {
  const { agents, models, defaultModel, addSession, setLoading } = useAppStore();
  const [title, setTitle] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [initialPrompt, setInitialPrompt] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([
        client.app.agents(),
        client.provider.list(),
        client.config.get(),
      ]).then(([a, m, c]) => {
        useAppStore.getState().setAgents(a);
        useAppStore.getState().setModels(m);
        if (c?.defaultModel) { useAppStore.getState().setDefaultModel(c.defaultModel); setSelectedModel(c.defaultModel); }
        setLoading(false);
      });
    }
  }, [isOpen, setLoading]);

  const handleCreate = useCallback(async () => {
    if (!title.trim()) { setError("SESSION TITLE REQUIRED"); return; }
    setIsCreating(true); setError(null);
    try {
      const session = await client.session.create({ title: title.trim() });
      const model = selectedModel || defaultModel;
      let providerID: string | undefined, modelID: string | undefined;
      if (model) { const p = model.split("/"); providerID = p[0]; modelID = p.slice(1).join("/"); }
      addSession({ sessionId: session.id, agentName: title.trim(), projectId: session.projectID || "", directory: session.directory || "", status: "idle", messages: [], isExpanded: true, isPinned: false, model: model ?? undefined, providerID, tokens: { input: 0, output: 0, reasoning: 0 }, cost: 0, createdAt: session.time?.created || Date.now() });
      if (initialPrompt.trim()) {
        try { await client.session.prompt(session.id, { parts: [{ type: "text", text: initialPrompt.trim() }], agent: selectedAgent || undefined, model: model ? { providerID: providerID!, modelID: modelID! } : undefined }); } catch {}
        window.location.reload();
      }
      setTitle(""); setSelectedAgent(""); setSelectedModel(""); setInitialPrompt(""); onClose();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed"); setIsCreating(false); }
  }, [title, selectedAgent, selectedModel, defaultModel, initialPrompt, addSession, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-lg border border-border/50 bg-card p-6 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-5 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-primary">|</span>
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">NEW AGENT SESSION</h2>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">SESSION TITLE</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., CODE REVIEW AGENT" className="font-mono" autoFocus />
          </div>
          {agents.length > 0 && (
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">AGENT</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="w-full"><SelectValue placeholder="DEFAULT" /></SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.name} value={a.name}>{getAgentTheme(a.name).icon} {a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {models.length > 0 && (
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                MODEL {defaultModel && <Badge variant="secondary" className="ml-1 text-[9px]">{defaultModel}</Badge>}
              </label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full"><SelectValue placeholder="SERVER DEFAULT" /></SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={`${m.providerID}/${m.id}`} value={`${m.providerID}/${m.id}`}>{m.providerID}/{m.name || m.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">INITIAL PROMPT</label>
            <Input value={initialPrompt} onChange={(e) => setInitialPrompt(e.target.value)} placeholder="WHAT SHOULD THE AGENT DO FIRST?" className="font-mono" />
          </div>
        </div>

        {error && <div className="mt-4 rounded border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive font-mono">{error}</div>}

        <div className="flex items-center justify-end gap-3 mt-5 pt-3 border-t border-border/50">
          <Button variant="ghost" size="sm" onClick={onClose}>CANCEL</Button>
          <Button variant="default" size="sm" onClick={handleCreate} disabled={isCreating || !title.trim()}>
            <Plus className="h-3.5 w-3.5" /> {isCreating ? "CREATING..." : "INITIALIZE"}
          </Button>
        </div>
      </div>
    </div>
  );
}
