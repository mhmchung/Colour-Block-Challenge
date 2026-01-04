import React from "react";

type Props = {
  grid: number;
  colours: string[];
  onPick: (index: number) => void;
};

export default function ColourGrid({ grid, colours, onPick }: Props) {
  return (
    <div className="mx-auto w-full max-w-[820px]">
      <div
        className="grid gap-3 sm:gap-4"
        style={{
          gridTemplateColumns: `repeat(${grid}, minmax(0, 1fr))`,
        }}
      >
        {colours.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPick(i)}
            className={[
              "aspect-square rounded-2xl",
              "ring-1 ring-white/15",
              "shadow-[0_12px_30px_rgba(0,0,0,0.25)]",
              "transition-transform active:scale-[0.98]",
            ].join(" ")}
            style={{ background: c }}
            aria-label={`Tile ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

