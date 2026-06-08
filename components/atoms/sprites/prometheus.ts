import { fillRect } from "./helpers";

const SCALE = 10;

export const prometheus = {
  name: "Prometheus",
  color: "#185FA5",
  hat: "#0C447C",
  skin: "#F4D4A0",
  detail: "#378ADD",

  draw(ctx: CanvasRenderingContext2D, t: number) {
    const blink = t % 120 < 8 ? 0 : 1;
    const thinkBob = Math.sin(t * 0.03) * 0.4;
    ctx.save();
    ctx.translate(0, thinkBob);

    fillRect(ctx, 2, 5, 4, 3, "#185FA5"); // robe
    fillRect(ctx, 1, 5, 1, 3, "#0C447C");
    fillRect(ctx, 6, 5, 1, 3, "#0C447C");

    ctx.fillStyle = "#F1EFE8";
    ctx.fillRect(5 * SCALE, 5 * SCALE, SCALE * 2, SCALE * 3); // scroll

    fillRect(ctx, 2, 2, 4, 3, "#F4D4A0"); // head
    fillRect(ctx, 2, 0, 4, 2, "#0C447C"); // hat
    fillRect(ctx, 3, 0, 2, 1, "#378ADD");

    ctx.fillStyle = "#042C53";
    if (blink) {
      ctx.fillRect(3 * SCALE, 3 * SCALE, SCALE, SCALE);
      ctx.fillRect(5 * SCALE, 3 * SCALE, SCALE, SCALE);
    }

    const bubbleAlpha = 0.5 + Math.sin(t * 0.04) * 0.5;
    ctx.fillStyle = `rgba(55,138,221,${bubbleAlpha * 0.3})`;
    ctx.beginPath();
    ctx.arc(5 * SCALE, 1 * SCALE, SCALE * 0.8, 0, Math.PI * 2);
    ctx.fill();

    fillRect(ctx, 1, 5, 1, 2, "#F4D4A0"); // arm
    ctx.restore();
  },
};
