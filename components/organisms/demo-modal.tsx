"use client";

import { useState, useEffect } from "react";
import { Modal, ModalButton } from "../thegridcn/modal";
import { FlaskConical, Bot, Globe, Terminal, Server } from "lucide-react";

export function DemoModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("demo-modal-dismissed");
    if (dismissed !== "true") setOpen(true);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("demo-modal-dismissed", "true");
    setOpen(false);
  };

  const footer = (
    <ModalButton variant="primary" onClick={handleDismiss}>
      GOT IT — EXPLORE DEMO
    </ModalButton>
  );

  return (
    <Modal
      open={open}
      onClose={handleDismiss}
      title="WELCOME TO THE DEMO"
      description="Multi-Agent Dashboard — live portfolio preview"
      size="md"
      footer={footer}
    >
      <div className="space-y-4">
        <div className="rounded border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2.5">
          <FlaskConical className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-[11px] text-amber-400 font-mono font-bold uppercase tracking-wider">
              Demo Mode Active
            </p>
            <p className="text-[10px] text-foreground/60 font-mono leading-relaxed">
              This dashboard is showing <strong>simulated agent sessions</strong> with realistic
              terminal output, token counts, and costs. No opencode server is required.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Bot className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">
              What You See
            </span>
          </div>
          <ul className="space-y-1.5 text-[10px] text-foreground/50 font-mono ml-5">
            <li className="flex items-center gap-1.5">
              <span className="text-primary">▸</span> 6 sessions across 5 agent types (build, plan, explore, sisyphus, librarian)
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-primary">▸</span> Live terminal output with code blocks and markdown rendering
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-primary">▸</span> Sub-agent relationships (parent → child grouping)
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-primary">▸</span> Session statuses: done, busy, idle, error
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-primary">▸</span> Server config: agents, models, default model selection
            </li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Server className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">
              Connect to Real Server
            </span>
          </div>
          <div className="rounded border border-primary/20 bg-card/50 p-2.5 font-mono text-[10px] text-foreground/60 leading-relaxed">
            <p className="text-foreground/80 font-bold mb-1">For end users:</p>
            <p>Click the <code className="text-primary/80 bg-primary/5 px-1 rounded">⚙ Settings</code> gear in the header, enter your opencode server URL, and save. The dashboard will reload and connect to your live sessions.</p>
            <p className="mt-2 text-foreground/80 font-bold mb-1">For developers:</p>
            <p>Set <code className="text-primary/80 bg-primary/5 px-1 rounded">NEXT_PUBLIC_DEMO_MODE=false</code> in <code className="text-primary/80 bg-primary/5 px-1 rounded">.env.local</code></p>
            <p className="mt-1">Start server: <code className="text-primary/80 bg-primary/5 px-1 rounded">opencode serve</code> (port 4096)</p>
            <p className="mt-1">Restart: <code className="text-primary/80 bg-primary/5 px-1 rounded">npm run dev</code></p>
          </div>
        </div>

        <p className="text-[9px] text-foreground/25 text-center font-mono">
          This modal appears once per browser session. Clear sessionStorage to reset.
        </p>
      </div>
    </Modal>
  );
}
