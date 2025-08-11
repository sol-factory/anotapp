"use client";

import { TeamColumn } from "@/components";
import { useTrucoStore } from "@/hooks/use-truco-store";
import { useRouter } from "next/navigation";

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
