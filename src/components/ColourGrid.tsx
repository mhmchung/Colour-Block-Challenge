type Props = {
  grid: number;
  colours: string[];
  onPick: (index: number) => void;
};

export default function ColourGrid({ grid, colours, onPick }: Props) {
  return (
    <div
      className="mt-8 grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${grid}, minmax(0, 1fr))`,
      }}
    >
      {colours.map((c, i) => (
        <button
          key={i}
          onClick={() => onPick(i)}
          className="aspect-square rounded-xl ring-1 ring-white/20"
          style={{ background: c }}
        />
      ))}
    </div>
  );
}


