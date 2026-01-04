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
    const v = localStorage.getItem(PB_KEY);
    return v ? Number(v) : 0;
  });

  const rank = useMemo(() => rankFromScore(score), [score]);
  const pbRank = useMemo(() => rankFromScore(pb), [pb]);

  /* ---------- Game Logic ---------- */

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

  const resetGame = () => {
    setGameState("idle");
    setScore(0);
    setLevel(1);
    setTimeLeft(30);
    setColours([]); // 🔑 ensures NO grid on info page
  };

  /* ---------- Timer ---------- */

  useEffect(() => {
    if (gameState !== "playing") return;

    const id = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [gameState]);

  useEffect(() => {
    if (gameState === "playing" && timeLeft === 0) {
      setGameState("finished");
      setPb((p) => {
        const next = Math.max(p, score);
        localStorage.setItem(PB_KEY, String(next));
        return next;
      });
    }
  }, [timeLeft, gameState, score]);

  const onPick = (index: number) => {
    if (gameState !== "playing") return;
    if (index === targetIndexRef.current) {
      setScore((s) => s + 1);
      setLevel((lv) => {
        const next = lv + 1;
        generateLevel(next);
        return next;
      });
    }
  };

  /* ---------- UI ---------- */

  return (
    <div className="min-h-screen bg-[#0b1020] text-white px-5 py-10">
      <h1 className="text-5xl font-extrabold">The Color Challenge</h1>

      <p className="mt-3 text-white/80 max-w-xl">
        Find the odd one out. One tile is slightly different in brightness.
        Score as many as you can before time runs out.
      </p>

      <div className="mt-6 flex gap-4">
        <div>Time: {formatTime(timeLeft)}</div>
        <div>Score: {score}</div>
        <div>Rank: {rank}</div>
      </div>

      <div className="mt-6 flex gap-3">
        {gameState !== "playing" ? (
          <button
            onClick={startGame}
            className="rounded-xl bg-white/10 px-6 py-3"
          >
            START MISSION
          </button>
        ) : (
          <button
            onClick={resetGame}
            className="rounded-xl bg-white/10 px-6 py-3"
          >
            RESET
          </button>
        )}
      </div>

      {/* 🔥 THIS is the important change */}
      {gameState === "playing" && (
        <div className="mt-10 animate-fadeIn">
          <ColourGrid
            grid={grid}
            colours={colours}
            onPick={onPick}
          />
        </div>
      )}
    </div>
  );
}

