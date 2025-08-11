"use client";

import { confirmWithToast, TeamColumn, WinConfetti } from "@/components";
import { useTrucoStore } from "@/hooks/use-truco-store";
import { Toaster } from "react-hot-toast";

export default function TrucoPage() {
  const { reset } = useTrucoStore();

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
      <Toaster position="top-center" />
      <WinConfetti />
      <div className="flex gap-3">
        <TeamColumn teamKey="us" label="Nosotros" />
        <TeamColumn teamKey="them" label="Ellos" />
      </div>

      <div style={{ marginTop: 8 }}>
        <button
          onClick={async () => {
            const result = await confirmWithToast("¿Seguro quiere reiniciar?");
            console.log({ result });
            if (result) {
              reset();
            }
          }}
          style={resetBtn}
        >
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

const resetBtn: React.CSSProperties = {
  width: "100%",
  padding: "6px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "white",
  color: "#0f172a",
  fontWeight: 800,
  cursor: "pointer",
};
