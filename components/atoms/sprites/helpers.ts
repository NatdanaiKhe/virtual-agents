const SCALE = 10;

export function fillRect(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  gw: number,
  gh: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.fillRect(gx * SCALE, gy * SCALE, gw * SCALE, gh * SCALE);
}
