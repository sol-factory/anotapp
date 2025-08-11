"use client";

import { confirmWithToast, TeamColumn, WinConfetti } from "@/components";
import { useTrucoStore } from "@/hooks/use-truco-store";
import { Toaster } from "react-hot-toast";

export default function TrucoPage() {
  const { reset } = useTrucoStore();

  return (
    <main
      className="safe-pad"
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
      <Toaster position="top-center" />
      <WinConfetti />
      <div className="flex flex-col items-center max-w-72">
        <header className="w-full flex items-center justify-center mb-6">
          <h1
            onClick={() => window.history.back()}
            className="text-base sm:text-lg font-extrabold text-white cursor-pointer"
          >
            🗡️ Truco
          </h1>
        </header>
        <div className="flex gap-3">
          <TeamColumn teamKey="us" label="Nosotros" />
          <TeamColumn teamKey="them" label="Ellos" />
        </div>
        <button
          onClick={async () => {
            const result = await confirmWithToast("¿Seguro quiere reiniciar?");
            if (result) {
              reset();
            }
          }}
          style={resetBtn}
          className="text-sm mt-5"
        >
          Reiniciar
        </button>
      </div>
    </main>
  );
}

const resetBtn: React.CSSProperties = {
  width: "6rem",
  padding: "2px 3px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "white",
  color: "#0f172a",
  fontWeight: 800,
  cursor: "pointer",
};
