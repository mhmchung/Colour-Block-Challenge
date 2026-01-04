import React from "react";

type Props = {
  grid: number;
  colours: string[];
  onPick: (index: number) => void;
};

export default function ColourGrid({ grid, colours, onPick }: Props) {
  // cap overall grid size so tiles don't become massive
  // (min(92vw, 720px) works well for 2x2 through 8x8)
  const gridMaxWidth = "min(92vw, 720px)";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: gridMaxWidth,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${grid}, minmax(0, 1fr))`,
          gap: grid <= 3 ? 14 : 10,
        }}
      >
        {colours.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPick(i)}
            aria-label={`Tile ${i + 1}`}
            style={{
              background: c,
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );
}

