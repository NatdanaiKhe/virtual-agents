"use client";

import { useEffect, useRef } from "react";
import type { SessionStatus } from "../../lib/store";
import { sprites } from "./sprites";

const SCALE = 10;
const W = 8, H = 8;
const SIZE = W * SCALE;

const agentSpriteMap: Record<string, string> = {
  build: "hephaestus",
  plan: "prometheus",
  explore: "atlas",
  oracle: "prometheus",
  librarian: "atlas",
  metis: "prometheus",
  momus: "atlas",
  general: "sisyphus",
  sisyphus: "sisyphus",
  prometheus: "prometheus",
};

function getSpriteKey(agentName: string): string {
  return agentSpriteMap[agentName.toLowerCase()] ?? "sisyphus";
}

interface PixelSpriteProps {
  agentName: string;
  status?: SessionStatus;
  size?: number;
  className?: string;
}

const statusSpeed: Record<SessionStatus, number> = {
  idle: 0.3,
  busy: 1,
  error: 0,
  done: 0.1,
  retry: 0.6,
};

export function PixelSprite({ agentName, status = "idle", size = 80, className }: PixelSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const spriteKey = getSpriteKey(agentName) as keyof typeof sprites;
    const sprite = sprites[spriteKey];
    if (!sprite) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    let animId: number;
    function animate() {
      if (!ctx) return;
      const s = statusRef.current;
      const spd = statusSpeed[s] ?? 1;
      frameRef.current += spd;
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Status-based visual effects
      if (s === "error") {
        ctx.globalAlpha = 0.3;
        sprite.draw(ctx, frameRef.current);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgba(220,38,38,0.4)";
        ctx.fillRect(0, 0, SIZE, SIZE);
        ctx.fillStyle = "#f87171";
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("ERR", SIZE / 2, SIZE / 2 + 4);
      } else if (s === "done") {
        sprite.draw(ctx, frameRef.current);
        ctx.fillStyle = "rgba(34,197,94,0.15)";
        ctx.fillRect(0, 0, SIZE, SIZE);
      } else if (s === "busy") {
        sprite.draw(ctx, frameRef.current);
        const glowAlpha = 0.15 + Math.sin(frameRef.current * 0.05) * 0.08;
        ctx.fillStyle = `rgba(0,132,227,${glowAlpha})`;
        ctx.fillRect(0, 0, SIZE, SIZE);
      } else {
        sprite.draw(ctx, frameRef.current);
      }

      animId = requestAnimationFrame(animate);
    }
    animate();

    return () => cancelAnimationFrame(animId);
  }, [agentName, size]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={SIZE}
      height={SIZE}
      style={{ imageRendering: "pixelated", width: size, height: size }}
    />
  );
}
