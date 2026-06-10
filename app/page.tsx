"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "../lib/store";
import { useSessionStream } from "../hooks/useSessionStream";
import { client } from "../lib/api";
import { isDemoMode, DEMO_AGENTS, DEMO_MODELS, DEMO_DEFAULT_MODEL } from "../lib/demo-data";
import { DashboardLayout } from "../components/templates/dashboard-layout";
import { DashboardHeader } from "../components/organisms/dashboard-header";
import { FilterBar } from "../components/organisms/filter-bar";
import { AgentGrid } from "../components/organisms/agent-grid";
import { NewSessionModal } from "../components/organisms/new-session-modal";
import { SettingsModal } from "../components/organisms/settings-modal";
import { DemoModal } from "../components/organisms/demo-modal";
import { Bot, Plus, FlaskConical, X } from "lucide-react";

export default function Home() {
  const demo = isDemoMode();
  const { isConnected, isLoading, error, setDefaultModel, setAgents, setModels, sessions } = useAppStore();

  const { refresh } = useSessionStream();

  const [showNewModal, setShowNewModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(true);

  useEffect(() => {
    if (!demo) return;
    const dismissed = sessionStorage.getItem("demo-banner-dismissed");
    setDemoBannerDismissed(dismissed === "true");
  }, [demo]);

  useEffect(() => {
    if (demo) {
      setAgents(DEMO_AGENTS);
      setModels(DEMO_MODELS);
      setDefaultModel(DEMO_DEFAULT_MODEL);
      return;
    }

    Promise.all([
      client.config.get(),
      client.app.agents(),
      client.provider.list(),
    ]).then(([config, agentsData, modelsData]) => {
      if (config?.defaultModel) setDefaultModel(config.defaultModel);
      setAgents(agentsData);
      setModels(modelsData);
    });
  }, [demo, setDefaultModel, setAgents, setModels]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", dark);
    }
  }, []);

  // Keyboard: R = refresh sessions
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "r" && !e.ctrlKey && !e.metaKey && document.activeElement === document.body) {
        refresh();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [refresh]);

  if (!mounted) return null;

  return (
    <DashboardLayout
      header={<DashboardHeader onNewSession={() => setShowNewModal(true)} onRefresh={refresh} onOpenSettings={() => setShowSettings(true)} />}
      filterBar={<FilterBar />}
    >
      {/* Demo banner */}
      {demo && !demoBannerDismissed && (
        <div className="mb-4 rounded border border-amber-500/40 bg-amber-500/5 px-4 py-3 flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-amber-400" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                DEMO PREVIEW
              </span>
              <span className="text-[10px] text-amber-400/60 ml-2 font-mono">
                — Sample data. Set NEXT_PUBLIC_DEMO_MODE=false to connect to opencode server.
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              sessionStorage.setItem("demo-banner-dismissed", "true");
              setDemoBannerDismissed(true);
            }}
            className="flex-shrink-0 ml-3 text-amber-400/50 hover:text-amber-400 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error banner */}
      {error && !demo && (
        <div className="mb-4 rounded border border-red-500/30 bg-red-500/5 px-4 py-3 text-xs text-red-400 font-mono">
          {error}
          <span className="text-red-500/60 ml-1">— ENSURE OPENCODE IS RUNNING ON PORT 4096</span>
        </div>
      )}

      {/* Loading */}
      {isLoading && !demo && (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Bot className="h-5 w-5 animate-pulse text-primary" />
            <span className="text-xs font-mono uppercase tracking-widest">CONNECTING TO GRID...</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && sessions.size === 0 && !demo && (
        <div className="flex flex-col items-center justify-center py-20">
          <Bot className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
            NO ACTIVE SESSIONS
          </h2>
          <p className="text-xs text-muted-foreground/60 mb-6 text-center max-w-sm font-mono">
            INITIALIZE A NEW AGENT SESSION OR ENSURE OPENCODE IS RUNNING WITH ACTIVE SESSIONS ON PORT 4096.
          </p>
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 rounded border border-primary/50 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            INITIALIZE SESSION
          </button>
        </div>
      )}

      {/* Session grid */}
      {!isLoading && !error && sessions.size > 0 && <AgentGrid />}

      <NewSessionModal isOpen={showNewModal} onClose={() => setShowNewModal(false)} />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onServerUrlChanged={refresh}
      />
      {demo && <DemoModal />}
    </DashboardLayout>
  );
}
