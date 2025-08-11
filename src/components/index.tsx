import { countToThreeSquares } from "@/helpers/truco";
import { TeamKey, useTrucoStore } from "@/hooks/use-truco-store";

export function SquareSVG({
  sides,
  size = 50,
  stroke = 3,
}: {
  sides: {
    left: boolean;
    top: boolean;
    right: boolean;
    bottom: boolean;
    diag: boolean;
  };
  size?: number;
  stroke?: number;
}) {
  const pad = stroke;
  const x1 = pad,
    y1 = pad;
  const x2 = size - pad,
    y2 = size - pad;

  // Props comunes a todas las líneas (tipado para evitar typos)
  const base: React.SVGProps<SVGLineElement> = {
    strokeWidth: stroke,
    strokeLinecap: "round",
  };

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ display: "block", borderRadius: 5, background: "transparent" }}
    >
      {/* IZQUIERDA */}
      {sides.left && (
        <>
          <line
            x1={x1}
            y1={y1}
            x2={x1}
            y2={y2 - stroke * 0.7}
            stroke="#D9B25F"
            {...base}
          />
          <line
            x1={x1}
            y1={y2 - stroke * 0.7}
            x2={x1}
            y2={y2}
            stroke="#C62828"
            {...base}
          />
        </>
      )}

      {/* ARRIBA */}
      {sides.top && (
        <>
          <line
            x1={x1}
            y1={y1}
            x2={x2 - stroke * 0.7}
            y2={y1}
            stroke="#D9B25F"
            {...base}
          />
          <line
            x1={x2 - stroke * 0.7}
            y1={y1}
            x2={x2}
            y2={y1}
            stroke="#C62828"
            {...base}
          />
        </>
      )}

      {/* DERECHA */}
      {sides.right && (
        <>
          <line
            x1={x2}
            y1={y1}
            x2={x2}
            y2={y2 - stroke * 0.7}
            stroke="#D9B25F"
            {...base}
          />
          <line
            x1={x2}
            y1={y2 - stroke * 0.7}
            x2={x2}
            y2={y2}
            stroke="#C62828"
            {...base}
          />
        </>
      )}

      {/* ABAJO */}
      {sides.bottom && (
        <>
          <line
            x1={x1}
            y1={y2}
            x2={x2 - stroke * 0.7}
            y2={y2}
            stroke="#D9B25F"
            {...base}
          />
          <line
            x1={x2 - stroke * 0.7}
            y1={y2}
            x2={x2}
            y2={y2}
            stroke="#C62828"
            {...base}
          />
        </>
      )}

      {/* DIAGONAL ↗ */}
      {sides.diag && (
        <>
          <line
            x1={x1}
            y1={y2}
            x2={x2 - stroke * 0.7}
            y2={y1}
            stroke="#D9B25F"
            {...base}
          />
          <line
            x1={x2 - stroke * 0.7}
            y1={y1}
            x2={x2}
            y2={y1}
            stroke="#C62828"
            {...base}
          />
        </>
      )}
    </svg>
  );
}

export function SectionBoard({ count }: { count: number }) {
  const squares = countToThreeSquares(count);
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        background: "rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: 10,
        width: "10rem",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {squares.map((s, i) => (
          <SquareSVG sides={s} key={i} />
        ))}
      </div>
    </div>
  );
}

export function TeamColumn({
  label,
  teamKey,
}: {
  label: string;
  teamKey: TeamKey;
}) {
  const { teams, increment, decrement } = useTrucoStore();
  const t = teams[teamKey];
  const total = t.malas + t.buenas;

  return (
    <div
      style={{
        flex: 1,
        minWidth: 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          alignSelf: "center",
          background: "white",
          color: "#0f172a",
          padding: "6px 18px",
          borderRadius: 999,
          fontWeight: 700,
          boxShadow: "0 2px 0 rgba(0,0,0,0.25)",
        }}
      >
        {label} ({total})
      </div>

      <div
        className="items-center"
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <SectionBoard count={t.malas} />
        <SectionBoard count={t.buenas} />
      </div>

      <div
        className="items-center flex"
        style={{ display: "flex", gap: 10, marginTop: 6 }}
      >
        <button
          className="w-10 py-2 px-3 bg-blue-600 text-white rounded-sm"
          onClick={() => increment(teamKey)}
        >
          +
        </button>
        <button
          className="w-10 py-2 px-3 bg-red-600 rounded-sm text-white"
          onClick={() => decrement(teamKey)}
        >
          -
        </button>
      </div>
    </div>
  );
}
