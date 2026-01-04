export function levelToSpec(level: number) {
  const grid = Math.min(2 + Math.floor((level - 1) / 4), 8);
  const deltaL = Math.max(12 - level * 0.8, 2);
  return { grid, deltaL: Math.round(deltaL) };
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function buildLevelColours(grid: number, deltaL: number) {
  const total = grid * grid;
  const targetIndex = Math.floor(Math.random() * total);

  const h = Math.floor(Math.random() * 360);
  const s = 80;

  // keep base lightness away from edges so +/- delta stays in range
  const baseL = clamp(50 + Math.floor(Math.random() * 11) - 5, 20, 80);

  const sign = Math.random() < 0.5 ? -1 : 1;
  const targetL = clamp(baseL + sign * deltaL, 5, 95);

  const base = `hsl(${h} ${s}% ${baseL}%)`;
  const target = `hsl(${h} ${s}% ${targetL}%)`;

  const colours = Array.from({ length: total }, (_, i) =>
    i === targetIndex ? target : base
  );

  // ✅ include these so App.tsx can read them
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

