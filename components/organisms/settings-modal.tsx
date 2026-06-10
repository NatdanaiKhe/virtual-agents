"use client";

import { useState, useEffect } from "react";
import { Modal, ModalButton } from "../thegridcn/modal";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { StatusDot } from "../atoms/status-dot";
import { useAppStore } from "../../lib/store";
import { client } from "../../lib/api";
import { isDemoMode, disableDemoMode } from "../../lib/demo-data";
import { Settings, Server, Plug, Globe, Bot, Cpu } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServerUrlChanged?: () => void;
}

export function SettingsModal({ isOpen, onClose, onServerUrlChanged }: SettingsModalProps) {
  const { agents, models, defaultModel, defaultAgent, setDefaultModel, setDefaultAgent } = useAppStore();
  const [serverUrl, setServerUrl] = useState("http://localhost:4096");
  const [pendingUrl, setPendingUrl] = useState("http://localhost:4096");
  const [connected, setConnected] = useState<boolean | null>(null);
  const [serverDefaultModel, setServerDefaultModel] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(defaultModel || "__none__");
  const [selectedAgent, setSelectedAgent] = useState<string>(defaultAgent || "__none__");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setSelectedModel(defaultModel || "__none__");
    setSelectedAgent(defaultAgent || "__none__");

    client.settings.serverUrl.get().then((data) => {
      if (data.serverUrl) {
        setServerUrl(data.serverUrl);
        setPendingUrl(data.serverUrl);
      }
    });

    client.config.get().then((data) => {
      setConnected(data.connected ?? false);
      setServerDefaultModel(data.defaultModel);
    }).catch(() => {
      setConnected(false);
    });
  }, [isOpen, defaultModel, defaultAgent]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    setDefaultModel(selectedModel === "__none__" || !selectedModel ? null : selectedModel);
    setDefaultAgent(selectedAgent === "__none__" || !selectedAgent ? null : selectedAgent);

    if (pendingUrl !== serverUrl) {
      try {
        const result = await client.settings.serverUrl.set(pendingUrl);
        if (result.error) {
          setSaveError(result.error);
          setIsSaving(false);
          return;
        }
        setServerUrl(result.serverUrl);
      } catch {
        setSaveError("Failed to update server URL");
        setIsSaving(false);
        return;
      }
    }

    if (isDemoMode()) {
      disableDemoMode();
      window.location.reload();
      return;
    }

    onServerUrlChanged?.();
    onClose();
  };

  const handleReset = () => {
    setPendingUrl("http://localhost:4096");
    setSaveError(null);
  };

  const footer = (
    <>
      <ModalButton variant="default" onClick={handleReset} disabled={isSaving}>
        Reset Default
      </ModalButton>
      <ModalButton variant="default" onClick={onClose} disabled={isSaving}>
        Cancel
      </ModalButton>
      <ModalButton variant="primary" onClick={handleSave} disabled={isSaving}>
        {isSaving ? "SAVING..." : "SAVE & CONNECT"}
      </ModalButton>
    </>
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="SETTINGS"
      description="OpenCode SDK connection & server configuration"
      size="md"
      footer={footer}
    >
      <div className="space-y-6">
        {isDemoMode() && (
          <div className="rounded border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-[10px] text-amber-400/80 font-mono leading-relaxed">
            <strong className="text-amber-400 uppercase tracking-wider">Demo Active</strong> — Enter your
            opencode server URL below and save to connect to a live server.
          </div>
        )}

        {/* Server URL */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/60">
              OpenCode Server URL
            </span>
          </div>
          <Input
            value={pendingUrl}
            onChange={(e) => {
              setPendingUrl(e.target.value);
              setSaveError(null);
            }}
            placeholder="http://localhost:4096"
            className="font-mono text-xs"
          />
          {saveError && (
            <p className="text-[10px] text-red-400">{saveError}</p>
          )}
          <p className="text-[9px] text-foreground/30">
            Opencode server address. Changed via env OPENCODE_SERVER_URL on server restart.
          </p>
        </div>

        {/* Server Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Server className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/60">
              Server Status
            </span>
          </div>
          <div className="rounded border border-primary/20 bg-card/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-foreground/50 font-mono uppercase tracking-wider">
                Connection
              </span>
              {connected === null ? (
                <Badge variant="outline" className="text-[9px] gap-1">
                  <StatusDot status="busy" /> CHECKING...
                </Badge>
              ) : connected ? (
                <Badge variant="secondary" className="text-[9px] gap-1 bg-green-500/10 text-green-400 border-green-500/20">
                  <StatusDot status="connected" /> CONNECTED
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-[9px] gap-1">
                  <StatusDot status="disconnected" /> UNREACHABLE
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-foreground/50 font-mono uppercase tracking-wider">
                Current URL
              </span>
              <code className="text-[10px] text-primary font-mono">{serverUrl}</code>
            </div>

            {serverDefaultModel && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-foreground/50 font-mono uppercase tracking-wider">
                  Server Default Model
                </span>
                <code className="text-[10px] text-foreground/70 font-mono">{serverDefaultModel}</code>
              </div>
            )}
          </div>
        </div>

        {/* Defaults */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/60">
              Default Model & Agent
            </span>
          </div>
          <div className="rounded border border-primary/20 bg-card/50 p-3 space-y-3">
            {agents.length > 0 && (
              <div className="space-y-1">
                <label className="text-[10px] text-foreground/50 font-mono uppercase tracking-wider">
                  Default Agent
                </label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="w-full h-8 text-xs font-mono">
                    <SelectValue placeholder="No default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {agents.map((a) => (
                      <SelectItem key={a.name} value={a.name} className="text-xs">
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {models.length > 0 && (
              <div className="space-y-1">
                <label className="text-[10px] text-foreground/50 font-mono uppercase tracking-wider">
                  Default Model
                </label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-full h-8 text-xs font-mono">
                    <SelectValue placeholder="No default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {models.map((m) => (
                      <SelectItem key={`${m.providerID}/${m.id}`} value={`${m.providerID}/${m.id}`} className="text-xs">
                        {m.providerID}/{m.name || m.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* SDK Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Plug className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/60">
              OpenCode SDK
            </span>
          </div>
          <div className="rounded border border-primary/20 bg-card/50 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-foreground/50 font-mono uppercase tracking-wider">
                Package
              </span>
              <code className="text-[10px] text-foreground/70 font-mono">@opencode-ai/sdk</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-foreground/50 font-mono uppercase tracking-wider">
                Proxy
              </span>
              <code className="text-[10px] text-foreground/70 font-mono">Next.js API Routes</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-foreground/50 font-mono uppercase tracking-wider">
                Protocol
              </span>
              <code className="text-[10px] text-foreground/70 font-mono">SSE + HTTP REST</code>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
