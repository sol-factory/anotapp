import { countToThreeSquares } from "@/helpers/truco";
import { TeamKey, useTrucoStore } from "@/hooks/use-truco-store";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";

export function SquareSVG({
  sides,
  size = 60,
  stroke = 4,
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

  const tipLen = stroke * 0.7;
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
          {/* palo (madera) desde debajo de la punta hasta abajo */}
          <line
            x1={x1}
            y1={y1 + tipLen}
            x2={x1}
            y2={y2}
            stroke="#D9B25F"
            {...base}
          />
          {/* punta roja arriba */}
          <line
            x1={x1}
            y1={y1}
            x2={x1}
            y2={y1 + tipLen}
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
          {/* punta roja a la izquierda */}
          <line
            x1={x1}
            y1={y2}
            x2={x1 + tipLen}
            y2={y2}
            stroke="#C62828"
            {...base}
          />
          {/* palo hacia la derecha */}
          <line
            x1={x1 + tipLen}
            y1={y2}
            x2={x2}
            y2={y2}
            stroke="#D9B25F"
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
        padding: 2,
        width: "10rem",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "1rem 0",
          gap: 10,
        }}
      >
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
        gap: 10,
      }}
    >
      <div className="flex flex-col text-lg items-center text-white -mb-1">
        <div
          style={{
            alignSelf: "center",
            fontWeight: 700,
          }}
          className="underline"
        >
          {label}
        </div>
      </div>

      <div
        className="items-center"
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
        onDoubleClick={() => increment(teamKey)}
      >
        <SectionBoard count={t.malas} />
        <hr className="w-full block px-10 text-gray-400" />
        <SectionBoard count={t.buenas} />
      </div>

      <div
        className="items-center flex"
        style={{ display: "flex", gap: 16, marginTop: 6 }}
      >
        <button
          className="w-14 cursor-pointer text-lg py-1 font-semibold bg-red-600 hover:bg-red-700 rounded-sm text-white"
          onClick={() => decrement(teamKey)}
        >
          -
        </button>
        <button
          className="w-14 cursor-pointer text-lg font-semibold py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-sm"
          onClick={() => increment(teamKey)}
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ------- menos confetti, en 1 ráfaga + 2 mini pulses ------- */

export function confirmWithToast(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    let handled = false;

    const cleanup = () => {
      try {
        document.documentElement.style.overflow = "";
      } catch {}
      window.removeEventListener("keydown", onKeyDown);
    };

    const close = (val: boolean) => {
      if (handled) return;
      handled = true;
      toast.remove(id); // cierra sin animación
      cleanup();
      resolve(val);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKeyDown, { once: true });

    // bloqueamos scroll del fondo
    try {
      document.documentElement.style.overflow = "hidden";
    } catch {}

    const id = toast.custom(
      () => (
        <>
          <div
            onClick={() => close(false)}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background: "rgba(0,0,0,.45)",
              backdropFilter: "blur(2px)",
              pointerEvents: "auto",
              marginTop: "-26px",
              marginLeft: "-16px",
              height: "3000px",
              width: "3000px",
            }}
          />
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "grid",
              placeItems: "center",
              zIndex: 9999,
              pointerEvents: "none",
              padding:
                "max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))",
            }}
            className="mt-10"
          >
            {/* overlay clickeable */}

            {/* card */}
            <div
              className="flex flex-col"
              style={{
                pointerEvents: "auto",
                background: "white",
                color: "#0f172a",
                borderRadius: 12,
                padding: 12,
                boxShadow: "0 10px 30px rgba(0,0,0,.15)",
                width: 280,
                gap: 10,
              }}
              role="dialog"
              aria-modal="true"
            >
              <div style={{ fontWeight: 700, textAlign: "center" }}>
                {message}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => close(true)}
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
                  onClick={() => close(false)}
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
          </div>
        </>
      ),
      { duration: Infinity }
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
