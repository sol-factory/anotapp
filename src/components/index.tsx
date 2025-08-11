import { countToThreeSquares } from "@/helpers/truco";
import { TeamKey, useTrucoStore } from "@/hooks/use-truco-store";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";

export function WinConfetti() {
  const teams = useTrucoStore((s) => s.teams);

  const prevTotals = useRef({ us: 0, them: 0 });
  const lastFire = useRef<{ winner: "us" | "them" | null; ts: number }>({
    winner: null,
    ts: 0,
  });

  useEffect(() => {
    const usTotal = teams.us.malas + teams.us.buenas;
    const themTotal = teams.them.malas + teams.them.buenas;

    let winner: "us" | "them" | null = null;
    if (prevTotals.current.us < 30 && usTotal === 30) winner = "us";
    else if (prevTotals.current.them < 30 && themTotal === 30) winner = "them";

    prevTotals.current = { us: usTotal, them: themTotal };
    if (!winner) return;

    const now = Date.now();
    if (
      lastFire.current.winner === winner &&
      now - lastFire.current.ts < 2000
    ) {
      return; // anti-doble-disparo
    }
    lastFire.current = { winner, ts: now };

    fireConfettiSoft();

    // Toast de victoria con CTA para reiniciar
    const label = winner === "us" ? "Nosotros" : "Ellos";
    victoryToast(label, () => {
      const { reset } = useTrucoStore.getState();
      reset();
      try {
        useTrucoStore.persist?.clearStorage?.();
        useTrucoStore.persist?.rehydrate?.();
      } catch {}
    });
  }, [teams]);

  return null;
}

function fireConfettiSoft() {
  confetti({
    particleCount: 60,
    spread: 65,
    startVelocity: 45,
    gravity: 0.9,
    ticks: 170,
    origin: { x: 0.5, y: 0.7 },
    scalar: 0.9,
  });
  setTimeout(() => {
    confetti({
      particleCount: 22,
      angle: 60,
      spread: 55,
      origin: { x: 0.2, y: 0.8 },
      scalar: 0.8,
    });
  }, 140);
  setTimeout(() => {
    confetti({
      particleCount: 22,
      angle: 120,
      spread: 55,
      origin: { x: 0.8, y: 0.8 },
      scalar: 0.8,
    });
  }, 220);
}

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
          color: "white",
          fontWeight: 700,
        }}
      >
        {label}
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
          className="w-14 py-2 bg-blue-600 text-white rounded-sm"
          onClick={() => increment(teamKey)}
        >
          +
        </button>
        <button
          className="w-14 py-2 bg-red-600 rounded-sm text-white"
          onClick={() => decrement(teamKey)}
        >
          -
        </button>
      </div>
    </div>
  );
}

/* ------- menos confetti, en 1 ráfaga + 2 mini pulses ------- */
export function confirmWithToast(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const id = toast.custom(
      (t) => (
        <div
          className="flex flex-col"
          style={{
            background: "white",
            color: "#0f172a",
            borderRadius: 12,
            padding: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,.15)",
            width: 280,
            gap: 10,
          }}
        >
          <div style={{ fontWeight: 700, textAlign: "center" }}>{message}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => {
                toast.remove(id);
                resolve(true);
              }}
              style={{
                flex: 1,
                background: "#0f172a",
                color: "white",
                borderRadius: 8,
                padding: "8px 10px",
                fontWeight: 700,
              }}
            >
              Sí, reiniciar
            </button>
            <button
              onClick={() => {
                toast.remove(id);
                resolve(false);
              }}
              style={{
                flex: 1,
                background: "transparent",
                color: "#0f172a",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                padding: "8px 10px",
                fontWeight: 700,
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ),
      { duration: 1000 * 60 } // queda hasta que respondas
    );
  });
}

export function victoryToast(teamLabel: string, onRestart?: () => void) {
  const id = toast.custom(
    (t) => (
      <div
        className="flex flex-col items-center"
        style={{
          background: "white",
          color: "#0f172a",
          borderRadius: 12,
          padding: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,.15)",
          width: 300,
          gap: 8,
        }}
      >
        <div style={{ fontWeight: 800 }}>🏆 ¡{teamLabel} ganaron 30!</div>
        <div style={{ fontSize: 13, color: "#334155" }}>
          ¿Querés empezar una nueva partida?
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          <button
            onClick={() => {
              toast.remove(id);
              onRestart?.();
            }}
            className="w-[10rem]"
            style={{
              background: "#0f172a",
              color: "white",
              borderRadius: 8,
              padding: "8px 10px",
              fontWeight: 700,
            }}
          >
            Nueva partida
          </button>
          <button
            onClick={() => toast.remove(id)}
            style={{
              flex: 1,
              background: "transparent",
              color: "#0f172a",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              padding: "8px 10px",
              fontWeight: 700,
              width: "6rem",
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    ),
    { duration: 6000 }
  );
}
