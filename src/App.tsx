import React, { useEffect, useMemo, useRef, useState } from "react";
import ColourGrid from "./components/ColourGrid";
import {
  buildLevelColours,
  formatTime,
  levelToSpec,
  rankFromScore,
} from "./utils/game";

type GameState = "idle" | "playing" | "finished";

const PB_KEY = "chromaquest_pb_v1";

export default function App() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const [grid, setGrid] = useState(2);
  const [deltaL, setDeltaL] = useState(12);
  const [colours, setColours] = useState<string[]>([]);
  const targetIndexRef = useRef(0);

  const [pb, setPb] = useState<number>(() => {
    const raw = localStorage.getItem(PB_KEY);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  });

  const rank = useMemo(() => rankFromScore(score), [score]);
  const pbRank = useMemo(() => rankFromScore(pb), [pb]);

  const generateLevel = (lv: number) => {
    const spec = levelToSpec(lv);
    const built = buildLevelColours(spec.grid, spec.deltaL);
    setGrid(built.grid);
    setDeltaL(built.deltaL);
    setColours(built.colours);
    targetIndexRef.current = built.targetIndex;
  };

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setTimeLeft(30);
    setGameState("playing");
    generateLevel(1);
  };

  const backToBriefing = () => {
    setGameState("idle");
    setTimeLeft(30);
    setScore(0);
    setLevel(1);
    setColours([]); // 🔑 ensures NO grid is visible on info page
  };

  const playAgain = () => {
    startGame();
  };

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;

    const id = window.setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [gameState]);

  // End mission
  useEffect(() => {
    if (gameState === "playing" && timeLeft === 0) {
      setGameState("finished");
      setPb((current) => {
        const next = Math.max(current, score);
        localStorage.setItem(PB_KEY, String(next));
        return next;
      });
    }
  }, [gameState, timeLeft, score]);

  const onPick = (index: number) => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) return;

    if (index === targetIndexRef.current) {
      setScore((s) => s + 1);
      setLevel((lv) => {
        const next = lv + 1;
        generateLevel(next);
        return next;
      });
    } else {
      // No penalty by spec — optional tiny feedback could be added later
    }
  };

  const share = async () => {
    const text = [
      `ChromaQuest — ${score} (${rank})`,
      `Personal Best — ${pb} (${pbRank})`,
      `Last Grid — ${grid}×${grid}, ΔL ${deltaL}%`,
      `#ChromaQuest`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch {
      prompt("Copy this:", text);
    }
  };

  return (
    <div className="min-h-screen text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[#070A16]" />
      <div className="fixed inset-0 -z-10 opacity-80">
        <div className="absolute -top-40 -left-48 h-[520px] w-[520px] rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="absolute top-10 right-[-120px] h-[460px] w-[460px] rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-[-160px] left-1/3 h-[520px] w-[520px] rounded-full bg-indigo-400/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1100px] px-5 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge">ChromaQuest</span>
              <span className="badge">The Color Challenge</span>
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
              Find the <span className="text-white/90">odd one out</span>
            </h1>
            <p className="mt-3 max-w-[72ch] text-white/75">
              One tile is slightly different in brightness. You have exactly{" "}
              <span className="font-semibold text-white/90">30 seconds</span> to
              score as many points as possible. No penalties — just speed and
              perception.
            </p>
          </div>

          {/* HUD */}
          <div className="glass shadow-glass rounded-3xl p-4 md:p-5 min-w-[270px]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/70">Time</div>
              <div className="text-lg font-bold tabular-nums">
                {formatTime(timeLeft)}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3">
                <div className="text-xs text-white/60">Score</div>
                <div className="mt-1 text-xl font-extrabold">{score}</div>
              </div>
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3">
                <div className="text-xs text-white/60">PB</div>
                <div className="mt-1 text-xl font-extrabold">{pb}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-white/70">Rank</span>
              <span className="font-semibold">{gameState === "playing" ? rank : pbRank}</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="mt-8 glass shadow-glass rounded-3xl p-6 md:p-8">
          {/* Meta row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="badge">
                Grid <span className="ml-1 text-white/90">{grid}×{grid}</span>
              </span>
              <span className="badge">
                ΔL <span className="ml-1 text-white/90">{deltaL}%</span>
              </span>
              <span className="badge">
                Status{" "}
                <span className="ml-1 text-white/90">
                  {gameState === "idle"
                    ? "Briefing"
                    : gameState === "playing"
                    ? "Mission"
                    : "Complete"}
                </span>
              </span>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-2">
              {gameState === "idle" && (
                <button className="btn btn-primary" onClick={startGame}>
                  START MISSION
                </button>
              )}
              {gameState === "playing" && (
                <button className="btn" onClick={backToBriefing}>
                  Abort
                </button>
              )}
              {gameState === "finished" && (
                <>
                  <button className="btn btn-primary" onClick={playAgain}>
                    PLAY AGAIN
                  </button>
                  <button className="btn" onClick={backToBriefing}>
                    Back to Briefing
                  </button>
                  <button className="btn" onClick={share}>
                    Share
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Briefing */}
          {gameState === "idle" && (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
                <h2 className="text-xl font-bold">How to play</h2>
                <ol className="mt-3 space-y-2 text-white/75">
                  <li>1) Click <span className="font-semibold text-white/90">START MISSION</span>.</li>
                  <li>2) Find the tile that’s slightly lighter or darker.</li>
                  <li>3) Tap it to score and advance. Wrong clicks don’t penalise time.</li>
                  <li>4) Repeat until the timer hits zero.</li>
                </ol>
              </div>
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
                <h2 className="text-xl font-bold">Difficulty curve</h2>
                <p className="mt-3 text-white/75">
                  Grid scales up from 2×2 to 8×8. As you progress, the brightness
                  difference (ΔL) shrinks — down to as low as 2%.
                </p>
                <p className="mt-3 text-white/60 text-sm">
                  Tip: scan patterns, not tiles — your eyes catch anomalies faster that way.
                </p>
              </div>
            </div>
          )}

          {/* ✅ Gameplay Grid (ONLY shows while playing) */}
          {gameState === "playing" && (
            <div className="mt-8 animate-fadeIn">
              <ColourGrid grid={grid} colours={colours} onPick={onPick} />
            </div>
          )}

          {/* Results */}
          {gameState === "finished" && (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
                <h2 className="text-xl font-bold">Mission Complete</h2>
                <div className="mt-4 space-y-2 text-white/75">
                  <div className="flex justify-between">
                    <span>Score</span>
                    <span className="font-semibold text-white/90">{score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rank</span>
                    <span className="font-semibold text-white/90">{rank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Personal Best</span>
                    <span className="font-semibold text-white/90">{pb}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
                <h2 className="text-xl font-bold">Next steps</h2>
                <p className="mt-3 text-white/75">
                  Try to beat your PB. Faster correct clicks matter more than hunting
                  the “perfect” tile.
                </p>
                <p className="mt-3 text-white/60 text-sm">
                  If you want: I can add a “Daily Challenge” seed so everyone gets the same board per day.
                </p>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-8 text-center text-xs text-white/50">
          Built with React + Vite + Tailwind. No distractions — just colour perception.
        </footer>
      </div>
    </div>
  );
}

// Small shared styles
function Badge({ children }: { children: React.ReactNode }) {
  return <span className="badge">{children}</span>;
}

