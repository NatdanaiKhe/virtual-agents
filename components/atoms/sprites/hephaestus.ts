import { fillRect } from "./helpers";

const SCALE = 10;

export const hephaestus = {
  name: "Hephaestus",
  color: "#993C1D",
  hat: "#712B13",
  skin: "#E8B98A",
  detail: "#F0997B",

  draw(ctx: CanvasRenderingContext2D, t: number) {
    const hammer = Math.abs(Math.sin(t * 0.08)) * 2;

    fillRect(ctx, 1, 4, 6, 4, "#993C1D"); // body
    fillRect(ctx, 2, 5, 4, 3, "#D3D1C7"); // apron
    fillRect(ctx, 2, 1, 4, 3, "#E8B98A"); // head
    fillRect(ctx, 1, 0, 6, 2, "#712B13"); // helmet
    fillRect(ctx, 2, 2, 4, 1, "#712B13");
    fillRect(ctx, 2, 1, 4, 1, "#F0997B"); // visor

    ctx.fillStyle = "#4A1B0C";
    ctx.fillRect(3 * SCALE, 2 * SCALE, SCALE, SCALE);
    ctx.fillRect(5 * SCALE, 2 * SCALE, SCALE, SCALE);

    fillRect(ctx, 2, 3, 4, 1, "#5F5E5A"); // beard

    ctx.save();
    ctx.translate(6 * SCALE, (5 + hammer) * SCALE);
    ctx.fillStyle = "#E8B98A";
    ctx.fillRect(0, 0, SCALE, SCALE * 2); // arm
    ctx.fillStyle = "#5F5E5A";
    ctx.fillRect(0, -SCALE, SCALE, SCALE); // hammer handle
    ctx.fillStyle = "#888780";
    ctx.fillRect(-SCALE, -SCALE * 2, SCALE * 3, SCALE); // hammer head
    ctx.restore();

    fillRect(ctx, 0, 5, 1, 2, "#E8B98A");

    ctx.fillStyle = `rgba(239,159,39,${0.3 + Math.sin(t * 0.1) * 0.2})`;
    ctx.fillRect(1 * SCALE, 7 * SCALE, SCALE * 6, SCALE); // fire glow
  },
};
