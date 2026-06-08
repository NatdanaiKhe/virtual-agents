"use client";

import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import type { PartData } from "../../lib/store";

interface TerminalPaneProps { parts: PartData[]; className?: string }

export function TerminalPane({ parts, className }: TerminalPaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  useEffect(() => {
    if (autoScrollRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [parts]);

  if (parts.length === 0) {
    return <div className={cn("flex items-center justify-center h-full text-muted-foreground text-xs font-mono", className)}>AWAITING INPUT...</div>;
  }

  return (
    <div
      ref={scrollRef}
      onScroll={() => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 40;
      }}
      className={cn("overflow-y-auto p-3 font-mono text-xs leading-relaxed", className)}
    >
      {parts.map((part) => {
        switch (part.type) {
          case "text":
          case "reasoning":
            return <div key={part.id} className="text-foreground/90 whitespace-pre-wrap break-words mb-0.5">{part.text}</div>;
          case "tool":
            return (
              <div key={part.id} className="mb-1 rounded border border-primary/20 bg-primary/5 px-2 py-1">
                <span className={cn("text-[10px] uppercase tracking-wider",
                  part.status === "running" && "text-primary", part.status === "completed" && "text-green-400", part.status === "error" && "text-destructive",
                )}>[{part.tool}] {part.status}</span>
                {part.output && <pre className="mt-1 text-[11px] text-muted-foreground whitespace-pre-wrap">{part.output}</pre>}
              </div>
            );
          case "error": return <div key={part.id} className="text-destructive whitespace-pre-wrap mb-0.5">{part.text}</div>;
          case "step-start": case "step-finish":
            return <div key={part.id} className="text-[10px] text-muted-foreground italic mb-0.5">{part.type}</div>;
          default: return <div key={part.id} className="text-muted-foreground text-[11px] mb-0.5">[{part.type}] {part.text}</div>;
        }
      })}
      {!autoScrollRef.current && (
        <button onClick={() => { autoScrollRef.current = true; scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }}
          className="sticky bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-primary/20 px-3 py-1 text-[10px] text-primary hover:bg-primary/30">↓ SCROLL</button>
      )}
    </div>
  );
}
