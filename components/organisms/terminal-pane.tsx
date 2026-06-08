"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "../../lib/utils";
import { remark } from "remark";
import remarkHtml from "remark-html";
import type { PartData } from "../../lib/store";

interface TerminalPaneProps {
  parts: PartData[];
  className?: string;
}

function markdownToHtml(text: string): string {
  if (!text) return "";
  const hasMd = /[#*`\->\[\]|]/.test(text);
  if (!hasMd) return text;
  try {
    const result = remark().use(remarkHtml).processSync(text);
    return String(result);
  } catch {
    return text;
  }
}

const mdCss = `
.tron-md,.tron-md p,.tron-md li,.tron-md td{color:var(--foreground);font-family:ui-monospace,monospace;font-size:12px;line-height:1.6}
.tron-md p{margin-bottom:6px}.tron-md p:last-child{margin-bottom:0}
.tron-md h1,.tron-md h2,.tron-md h3,.tron-md h4{color:var(--primary);font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin:10px 0 4px}
.tron-md h1{font-size:14px}.tron-md h2{font-size:13px}.tron-md h3{font-size:12px}
.tron-md ul,.tron-md ol{padding-left:16px;margin-bottom:6px}
.tron-md ul li{list-style-type:disc}.tron-md ol li{list-style-type:decimal}
.tron-md li{margin-bottom:1px}
.tron-md code{background:color-mix(in oklch,var(--primary)15%,transparent);color:var(--primary);padding:1px 4px;border-radius:3px;font-size:11px}
.tron-md pre{background:color-mix(in oklch,var(--muted)60%,transparent);border:1px solid var(--border);border-radius:6px;padding:10px 12px;margin:6px 0;overflow-x:auto}
.tron-md pre code{background:0 0;padding:0;color:var(--foreground);font-size:11px}
.tron-md blockquote{border-left:2px solid var(--primary);padding-left:10px;margin:6px 0;color:var(--muted-foreground);font-style:italic}
.tron-md a{color:var(--primary);text-decoration:underline}
.tron-md hr{border:0;border-top:1px solid var(--border);margin:8px 0}
.tron-md strong{font-weight:700;color:var(--foreground)}
.tron-md table{width:100%;border-collapse:collapse;margin:6px 0;font-size:11px}
.tron-md th{background:color-mix(in oklch,var(--primary)15%,transparent);color:var(--primary);padding:3px 6px;text-align:left;border:1px solid var(--border)}
.tron-md td{padding:3px 6px;border:1px solid var(--border)}
`;

export function TerminalPane({ parts, className }: Readonly<TerminalPaneProps>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const hasMarkdown = useMemo(
    () => parts.some((p) => (p.type === "text" || p.type === "reasoning") && /[#*`\->\[\]|]/.test(p.text ?? "")),
    [parts],
  );

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [parts, autoScroll]);

  const onScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 40);
  };

  const scrollToBottom = () => {
    setAutoScroll(true);
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  if (parts.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full text-muted-foreground text-xs font-mono uppercase tracking-wider", className)}>
        AWAITING INPUT...
      </div>
    );
  }

  return (
    <div ref={scrollRef} onScroll={onScroll} className={cn("overflow-y-auto p-3", className)}>
      {hasMarkdown && <style>{mdCss}</style>}
      {parts.map((part) => {
        switch (part.type) {
          case "text":
          case "reasoning": {
            const html = markdownToHtml(part.text ?? "");
            if (html.includes("<") && html !== part.text) {
              return <div key={part.id} className="tron-md mb-1" dangerouslySetInnerHTML={{ __html: html }} />;
            }
            return <div key={part.id} className="text-foreground/90 whitespace-pre-wrap break-words mb-0.5 font-mono text-xs">{part.text}</div>;
          }
          case "tool":
            return (
              <div key={part.id} className="mb-1 rounded border border-primary/20 bg-primary/5 px-2 py-1 font-mono text-xs">
                <span className={cn("text-[10px] uppercase tracking-wider", part.status === "running" && "text-primary", part.status === "completed" && "text-green-400", part.status === "error" && "text-destructive")}>
                  [{part.tool}] {part.status}
                </span>
                {part.output && <pre className="mt-1 text-[11px] text-muted-foreground whitespace-pre-wrap">{part.output}</pre>}
              </div>
            );
          case "error":
            return <div key={part.id} className="text-destructive whitespace-pre-wrap mb-0.5 font-mono text-xs">{part.text}</div>;
          case "step-start":
          case "step-finish":
            return <div key={part.id} className="text-[10px] text-muted-foreground italic mb-0.5 font-mono">── {part.type} ──</div>;
          default:
            return <div key={part.id} className="text-muted-foreground text-[11px] mb-0.5 font-mono">[{part.type}] {part.text ?? ""}</div>;
        }
      })}
      {!autoScroll && (
        <button onClick={scrollToBottom} className="sticky bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-primary/20 px-3 py-1 text-[10px] text-primary hover:bg-primary/30 font-mono uppercase">↓ SCROLL</button>
      )}
    </div>
  );
}
