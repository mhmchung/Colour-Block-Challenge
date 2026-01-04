export type Round = {
  size: number
  tiles: string[] // CSS colour strings
  targetIndex: number
  baseColour: { h: number; s: number; l: number }
  deltaL: number
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function hsl(h: number, s: number, l: number) {
  return `hsl(${h} ${s}% ${l}%)`
}

/**
 * Difficulty curve:
 * - Grid grows from 2x2 to 8x8.
 * - Lightness delta shrinks toward 2%.
 */
export function computeDifficulty(score: number) {
  const size = clamp(2 + Math.floor(score / 3), 2, 8)

  // Start noticeable, then shrink quickly; never below 2.
  // A gentle curve that still gets brutal in the 20+ score range.
  const raw = 18 - score * 0.55
  const deltaL = clamp(Math.round(raw), 2, 18)

  return { size, deltaL }
}

export function newRound(score: number): Round {
  const { size, deltaL } = computeDifficulty(score)

  const h = randInt(0, 359)
  const s = randInt(70, 95)
  const l = randInt(35, 65)

  const direction = Math.random() < 0.5 ? -1 : 1
  const targetL = clamp(l + direction * deltaL, 5, 95)

  const total = size * size
  const targetIndex = randInt(0, total - 1)

  const base = hsl(h, s, l)
  const target = hsl(h, s, targetL)

  const tiles = Array.from({ length: total }, (_, i) => (i === targetIndex ? target : base))

  return { size, tiles, targetIndex, baseColour: { h, s, l }, deltaL }
}

export function rankForScore(score: number) {
  if (score >= 40) return "Elite"
  if (score >= 30) return "Master"
  if (score >= 22) return "Veteran"
  if (score >= 15) return "Skilled"
  if (score >= 8) return "Rising"
  return "Rookie"
}

export function formatShare(score: number) {
  // Simple share block: filled squares = score bucket.
  // Not Wordle-like per-round, since this is timed / infinite rounds.
  const blocks = Math.min(10, Math.max(1, Math.ceil(score / 4)))
  const line = "🟪".repeat(blocks) + "⬛".repeat(10 - blocks)
  return `ChromaQuest — ${score} pts\n${line}`
}
