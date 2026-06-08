import { fillRect } from "./helpers";

const SCALE = 10;

export const sisyphus = {
  name: "Sisyphus",
  color: "#534AB7",
  hat: "#3C3489",
  skin: "#F4C89A",
  detail: "#7F77DD",

  draw(ctx: CanvasRenderingContext2D, t: number) {
    const bob = Math.sin(t * 0.05) * 0.8;
    ctx.save();
    ctx.translate(0, bob);

    fillRect(ctx, 2, 5, 4, 3, "#534AB7"); // robe
    fillRect(ctx, 3, 5, 2, 1, "#7F77DD"); // collar
    fillRect(ctx, 2, 2, 4, 3, "#F4C89A"); // head
    fillRect(ctx, 2, 1, 4, 1, "#3C3489"); // crown base
    fillRect(ctx, 3, 0, 2, 1, "#3C3489"); // crown top

    ctx.fillStyle = "#FAC775";
    ctx.fillRect(2 * SCALE, 1 * SCALE, SCALE, SCALE); // gem L
    ctx.fillRect(5 * SCALE, 1 * SCALE, SCALE, SCALE); // gem R

    ctx.fillStyle = "#26215C";
    ctx.fillRect(3 * SCALE, 3 * SCALE, SCALE, SCALE); // eye L
    ctx.fillRect(5 * SCALE, 3 * SCALE, SCALE, SCALE); // eye R

    const armSwing = Math.sin(t * 0.05) * 0.5;
    fillRect(ctx, 1, 5 + armSwing, 1, 2, "#F4C89A");
    fillRect(ctx, 6, 5 - armSwing, 1, 2, "#F4C89A");

    const bx = 3 + Math.sin(t * 0.03) * 1;
    ctx.fillStyle = "#888780";
    ctx.fillRect(Math.round(bx * SCALE), 7 * SCALE, SCALE * 2, SCALE); // boulder

    ctx.restore();
  },
};
