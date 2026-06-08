import { fillRect } from "./helpers";

const SCALE = 10;

export const atlas = {
  name: "Atlas",
  color: "#0F6E56",
  hat: "#085041",
  skin: "#E8C99A",
  detail: "#1D9E75",

  draw(ctx: CanvasRenderingContext2D, t: number) {
    const run = Math.sin(t * 0.1);

    ctx.fillStyle = "#085041";
    ctx.fillRect(2 * SCALE, (6 + run * 1.5) * SCALE, SCALE, SCALE * 2); // legs
    ctx.fillRect(4 * SCALE, (6 - run * 1.5) * SCALE, SCALE, SCALE * 2);

    fillRect(ctx, 1, 4, 6, 3, "#0F6E56"); // body
    fillRect(ctx, 2, 4, 4, 2, "#1D9E75"); // chest
    fillRect(ctx, 2, 1, 4, 3, "#E8C99A"); // head
    fillRect(ctx, 2, 0, 4, 2, "#085041"); // helmet
    fillRect(ctx, 2, 1, 4, 1, "#1D9E75"); // visor

    ctx.fillStyle = "#04342C";
    ctx.fillRect(3 * SCALE, 2 * SCALE, SCALE, SCALE);
    ctx.fillRect(5 * SCALE, 2 * SCALE, SCALE, SCALE);

    ctx.fillStyle = "rgba(29,158,117,0.8)";
    ctx.fillRect(3 * SCALE + 2, 2 * SCALE + 2, SCALE - 4, SCALE - 4); // eye glow L
    ctx.fillRect(5 * SCALE + 2, 2 * SCALE + 2, SCALE - 4, SCALE - 4); // eye glow R

    ctx.fillStyle = "#E8C99A";
    ctx.fillRect(1 * SCALE, (6 - run) * SCALE, SCALE, SCALE * 2); // arms
    ctx.fillRect(6 * SCALE, (6 + run) * SCALE, SCALE, SCALE * 2);
  },
};
