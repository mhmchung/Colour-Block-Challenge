export function levelToSpec(level: number) {
  const grid = Math.min(2 + Math.floor((level - 1) / 4), 8);
  const deltaL = Math.max(12 - level * 0.8, 2);
  return { grid, deltaL: Math.round(deltaL) };
}

export function buildLevelColours(grid: number, deltaL: number) {
  const total = grid * grid;
  const targetIndex = Math.floor(Math.random() * total);

  const h = Math.floor(Math.random() * 360);
  const s = 80;
  const l = 50;

  const base = `hsl(${h} ${s}% ${l}%)`;
  const target = `hsl(${h} ${s}% ${l + deltaL}%)`;

  const colours = Array.from({ length: total }, (_, i) =>
    i === targetIndex ? target : base
  );

  return { colours, targetIndex };
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

