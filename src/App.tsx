import { useEffect, useMemo, useRef, useState } from 'react'
import { formatShare, newRound, rankForScore, Round } from './game'

const TOTAL_SECONDS = 30
const BEST_KEY = "chromaquest:best:v1"

type GameState = "idle" | "running" | "ended"

function pad2(n: number) {
  return n.toString().padStart(2, "0")
}

export default function App() {
  const [state, setState] = useState<GameState>("idle")
  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL_SECONDS)
  const [score, setScore] = useState<number>(0)
  const [best, setBest] = useState<number>(() => {
    const raw = localStorage.getItem(BEST_KEY)
    const v = raw ? Number(raw) : 0
    return Number.isFinite(v) ? v : 0
  })

  const [round, setRound] = useState<Round>(() => newRound(0))
  const [shake, setShake] = useState(false)
  const tickRef = useRef<number | null>(null)

  const rank = useMemo(() => rankForScore(score), [score])
  const bestRank = useMemo(() => rankForScore(best), [best])

  useEffect(() => {
    if (state !== "running") return

    const start = Date.now()
    const endAt = start + TOTAL_SECONDS * 1000

    const tick = () => {
      const now = Date.now()
      const msLeft = Math.max(0, endAt - now)
      const s = Math.ceil(msLeft / 1000)
      setSecondsLeft(s)

      if (msLeft <= 0) {
        setState("ended")
        return
      }
      tickRef.current = window.setTimeout(tick, 120)
    }

    tick()
    return () => {
      if (tickRef.current) window.clearTimeout(tickRef.current)
      tickRef.current = null
    }
  }, [state])

  useEffect(() => {
    if (state === "ended") {
      if (score > best) {
        setBest(score)
        localStorage.setItem(BEST_KEY, String(score))
      }
    }
  }, [state, score, best])

  const startGame = () => {
    setScore(0)
    setSecondsLeft(TOTAL_SECONDS)
    setRound(newRound(0))
    setState("running")
  }

  const resetToIdle = () => {
    setState("idle")
    setScore(0)
    setSecondsLeft(TOTAL_SECONDS)
    setRound(newRound(0))
  }

  const onTileClick = (idx: number) => {
    if (state !== "running") return

    if (idx === round.targetIndex) {
      const nextScore = score + 1
      setScore(nextScore)
      setRound(newRound(nextScore))
    } else {
      // No penalty, but give quick feedback so misclicks feel real.
      setShake(true)
      window.setTimeout(() => setShake(false), 180)
    }
  }

  const share = async () => {
    const text = formatShare(score)
    try {
      if (navigator.share) {
        await navigator.share({ text })
        return
      }
    } catch {
      // ignore
    }
    await navigator.clipboard.writeText(text)
    alert("Copied results to clipboard.")
  }

  const timeDisplay = `${pad2(Math.floor(secondsLeft / 60))}:${pad2(secondsLeft % 60)}`

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-3xl glass rounded-3xl p-6 md:p-10">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge">ChromaQuest</span>
              <span className="badge">30s</span>
              <span className="badge">{state === "running" ? "Mission Live" : state === "ended" ? "Mission Complete" : "Ready"}</span>
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
              The Color Challenge
            </h1>
            <p className="mt-2 text-sm md:text-base text-slate-200/80 max-w-xl">
              Find the odd one out. One tile is slightly different in brightness. Score as many as you can before time runs out.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="glass rounded-2xl px-4 py-3 border border-white/10">
              <div className="text-xs text-slate-200/70">Time</div>
              <div className="text-2xl font-bold tabular-nums">{timeDisplay}</div>
            </div>

            <div className="glass rounded-2xl px-4 py-3 border border-white/10">
              <div className="text-xs text-slate-200/70">Score</div>
              <div className="text-2xl font-bold tabular-nums">{score}</div>
            </div>

            <div className="glass rounded-2xl px-4 py-3 border border-white/10">
              <div className="text-xs text-slate-200/70">Rank</div>
              <div className="text-2xl font-bold">{rank}</div>
            </div>
          </div>
        </header>

        <main className="mt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="badge">Grid: {round.size}×{round.size}</span>
              <span className="badge">ΔL: {round.deltaL}%</span>
              <span className="badge">PB: {best} ({bestRank})</span>
            </div>

            <div className="flex items-center gap-3">
              {state !== "running" ? (
                <button className="button" onClick={startGame}>
                  START MISSION
                </button>
              ) : (
                <button className="button" onClick={() => setState("ended")}>
                  END
                </button>
              )}

              {state === "ended" && (
                <>
                  <button className="button" onClick={share}>SHARE</button>
                  <button className="button" onClick={resetToIdle}>RESET</button>
                </>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div
              className={[
                "mx-auto",
                "grid gap-2 md:gap-3",
                shake ? "animate-[shake_0.18s_linear]" : "",
              ].join(" ")}
              style={{
                gridTemplateColumns: `repeat(${round.size}, minmax(0, 1fr))`,
              }}
            >
              {round.tiles.map((c, i) => (
                <button
                  key={i}
                  className="tile aspect-square w-full"
                  style={{ background: c }}
                  onClick={() => onTileClick(i)}
                  aria-label={i === round.targetIndex ? "Target tile" : "Tile"}
                />
              ))}
            </div>
          </div>

          {state === "ended" && (
            <section className="mt-8 glass rounded-3xl p-6 border border-white/10">
              <h2 className="text-xl font-bold">Mission Summary</h2>
              <div className="mt-3 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <div className="text-sm text-slate-200/70">Final Score</div>
                  <div className="text-4xl font-extrabold tabular-nums">{score}</div>
                  <div className="mt-1 text-sm text-slate-200/80">Rank: <span className="font-semibold">{rank}</span></div>
                </div>
                <div className="text-sm text-slate-200/80">
                  Personal Best: <span className="font-semibold">{best}</span> ({bestRank})
                </div>
              </div>
            </section>
          )}
        </main>

        <footer className="mt-10 text-xs text-slate-200/60">
          Tip: At higher levels, the brightness difference can be as low as 2%. On mobile, try maximum screen brightness.
        </footer>
      </div>

      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
