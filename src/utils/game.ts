export function levelToSpec(level: number) {
  // Grid scaling: 2x2 up to 8x8, increases every 4 levels
  const grid = Math.min(2 + Math.floor((level - 1) / 4), 8);

  /**
   * Smooth slow decay (exponential):
   * deltaL = 2 + 10 * exp(-(level-1)/35)
   *
   * Examples:
   * level 1  -> 12.0
   * level 15 -> ~8.0
   * level 30 -> ~5.6
   * level 50 -> ~3.5
   * level 70 -> ~2.7
   * (never hits 2 early; it approaches 2 gradually)
   */
  const deltaL = 2 + 10 * Math.exp(-(level - 1) / 35);

  return { grid, deltaL };
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function buildLevelColours(grid: number, deltaL: number) {
  const total = grid * grid;
  const targetIndex = Math.floor(Math.random() * total);

  const h = Math.floor(Math.random() * 360);
  const s = 80;

  // Keep base lightness away from edges so +/- delta stays in range
  const baseL = clamp(50 + Math.floor(Math.random() * 11) - 5, 20, 80);

  const sign = Math.random() < 0.5 ? -1 : 1;
  const targetL = clamp(baseL + sign * deltaL, 5, 95);

  const base = `hsl(${h} ${s}% ${baseL}%)`;
  const target = `hsl(${h} ${s}% ${targetL}%)`;

  const colours = Array.from({ length: total }, (_, i) =>
    i === targetIndex ? target : base
  );

  return { colours, targetIndex, grid, deltaL };
}

export function rankFromScore(score: number) {
  if (score >= 40) return "Elite";
  if (score >= 30) return "Master";
  if (score >= 20) return "Veteran";
  if (score >= 10) return "Rookie";
  return "Cadet";
}

export function formatTime(t: number) {
  return `00:${String(t).padStart(2, "0")}`;
}

