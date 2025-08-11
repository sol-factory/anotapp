"use client";

import { useRouter } from "next/navigation";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* ========== STORE ========== */

type TeamKey = "us" | "them";
type Team = { malas: number; buenas: number };

type State = {
  teams: Record<TeamKey, Team>;
  increment: (team: TeamKey) => void;
  decrement: (team: TeamKey) => void;
  reset: () => void;
};

const initialTeam: Team = { malas: 0, buenas: 0 };

export const useTrucoStore = create<State>()(
  persist(
    (set, get) => ({
      teams: { us: { ...initialTeam }, them: { ...initialTeam } },

      increment: (team) => {
        set((state) => {
          const t = { ...state.teams[team] };
          if (t.malas < 15) t.malas++;
          else if (t.buenas < 15) t.buenas++;
          return { teams: { ...state.teams, [team]: t } };
        });
        const { malas, buenas } = get().teams[team];
        if (malas === 15 && buenas === 15) {
          setTimeout(() => {
            if (
              confirm(
                `${
                  team === "us" ? "¡Nosotros" : "¡Ellos"
                } ganaron! ¿Empezar una nueva partida?`
              )
            ) {
              get().reset();
            }
          }, 0);
        }
      },

      decrement: (team) => {
        set((state) => {
          const t = { ...state.teams[team] };
          if (t.buenas > 0) t.buenas--;
          else if (t.malas > 0) t.malas--;
          return { teams: { ...state.teams, [team]: t } };
        });
      },

      // 👇 antes: reset: () => ({ teams: ... })
      reset: () =>
        set({
          teams: { us: { ...initialTeam }, them: { ...initialTeam } },
        }),
    }),
    {
      name: "have-fun:truco",
      storage: createJSONStorage(() => localStorage),
      // opcional: guardar solo 'teams'
      partialize: (s) => ({ teams: s.teams }),
    }
  )
);

/* ========== DIBUJO ========== */

type Sides5 = {
  left: boolean;
  top: boolean;
  right: boolean;
  bottom: boolean;
  diag: boolean; // ↗ desde (abajo-izquierda) a (arriba-derecha)
};

/** Transforma 0..15 en 3 cuadros (5 palitos c/u). */
function countToThreeSquares(n: number): Sides5[] {
  const total = Math.max(0, Math.min(15, n));
  const out: Sides5[] = [];
  for (let i = 0; i < 3; i++) {
    const local = Math.max(0, Math.min(5, total - i * 5));
    out.push({
      left: local >= 1,
      top: local >= 2,
      right: local >= 3,
      bottom: local >= 4,
      diag: local >= 5,
    });
  }
  return out;
}

/** Un cuadrado de fósforos hecho con SVG */
function SquareSVG({
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

/** Panel Malas/Buenas: 3 cuadrados verticales */
function SectionBoard({ count, title }: { count: number; title: string }) {
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
      <div style={{ color: "#cbd5e1", fontSize: 12, margin: "0 4px 8px" }}>
        {title}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {squares.map((s, i) => (
          <SquareSVG sides={s} key={i} />
        ))}
      </div>
    </div>
  );
}

/* ========== UI ========== */

function TeamColumn({ label, teamKey }: { label: string; teamKey: TeamKey }) {
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
        <SectionBoard title="Malas" count={t.malas} />
        <SectionBoard title="Buenas" count={t.buenas} />
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

export default function TrucoPage() {
  const { reset } = useTrucoStore();
  const router = useRouter();
  const onReset = () => {
    if (confirm("¿Seguro que querés reiniciar la partida?")) {
      reset(); // estado en memoria
      // limpiar persistencia
      try {
        // opción A (API oficial de zustand/persist):
        useTrucoStore.persist?.clearStorage?.();
        // rehidratar para dejar el storage en blanco con el estado actual
        useTrucoStore.persist?.rehydrate?.();
        router.refresh();
      } catch {}
      // opción B (equivalente y directa):
      // localStorage.removeItem("have-fun:truco");
    }
  };
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        padding: 20,
        background: "#0b1220",
      }}
    >
      <div className="flex gap-3">
        <TeamColumn teamKey="us" label="Nosotros" />
        <TeamColumn teamKey="them" label="Ellos" />
      </div>

      <div style={{ marginTop: 8 }}>
        <button onClick={onReset} style={resetBtn}>
          Reiniciar
        </button>
      </div>

      <footer
        style={{ textAlign: "center", color: "#94a3b8", marginTop: "auto" }}
      >
        have-fun • truco
      </footer>
    </main>
  );
}

/* ========== styles helpers ========== */

function btn(primary = false): React.CSSProperties {
  return {
    flex: 1,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: primary ? "white" : "transparent",
    color: primary ? "#0f172a" : "white",
    fontWeight: 700,
    cursor: "pointer",
  };
}

const resetBtn: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "white",
  color: "#0f172a",
  fontWeight: 800,
  cursor: "pointer",
};
