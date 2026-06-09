"use client";

import { useAppStore } from "../../lib/store";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { StatusDot } from "../atoms/status-dot";
import { StatusBar } from "../thegridcn/status-bar";
import { Plus, Moon, Sun, Bot, RefreshCw } from "lucide-react";

export function DashboardHeader({
  onNewSession,
  onRefresh,
}: {
  onNewSession: () => void;
  onRefresh: () => void;
}) {
  const { isConnected, darkMode, toggleDarkMode, sessions } = useAppStore();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/50 bg-card/80 backdrop-blur-md">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-2">
              <Bot
                className="h-4 w-4 text-primary"
                style={{ filter: "drop-shadow(0 0 6px var(--primary))" }}
              />
              <h1 className="text-xs font-bold uppercase tracking-widest text-foreground">
                MULTI-AGENT DASHBOARD
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon-sm" onClick={toggleDarkMode}>
                {darkMode ? (
                  <Sun className="h-3.5 w-3.5" />
                ) : (
                  <Moon className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={onRefresh} title="Refresh sessions (R)">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="sm" onClick={onNewSession}>
                <Plus className="h-3 w-3" /> New Session
              </Button>
            </div>
          </div>
        </div>
      </header>
      <div className="px-4 sm:px-6 lg:px-8">
        <StatusBar
          variant={!isConnected ? "alert" : "default"}
          leftContent={
            <div className="flex items-center gap-3">
              <span className="text-primary">|</span>
              <span className="text-foreground/60">SYSTEM</span>
              {isConnected ? (
                <Badge
                  variant="secondary"
                  className="gap-1 bg-green-500/10 text-green-400 border-green-500/20 text-[9px]"
                >
                  <StatusDot status="connected" /> ONLINE
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1 text-[9px]">
                  <StatusDot status="disconnected" /> OFFLINE
                </Badge>
              )}
            </div>
          }
          rightContent={
            <div className="flex items-center gap-3">
              {sessions.size > 0 && (
                <Badge variant="outline" className="text-[9px]">
                  {sessions.size} AGENT{sessions.size !== 1 ? "S" : ""}
                </Badge>
              )}
              <span className="text-muted-foreground">opencode :4096</span>
            </div>
          }
        />
      </div>
    </>
  );
}
