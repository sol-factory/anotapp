"use client";

import { useMemo, useState } from "react";
import {
  useGeneralaStore,
  CATEGORY_DEFS,
  CategoryKey,
  getTotal,
} from "@/hooks/use-generala-store";
import { optionsForCategory } from "@/components/GeneralaModal";
import PlayerEditModal, { PlayerRef } from "@/components/PlayerEditModal";

type CellTarget = { playerId: string; category: CategoryKey } | null;

export default function GeneralaPage() {
  const {
    players,
    scores,
    addPlayer,
    setScore,
    reset,
    renamePlayer,
    removePlayer,
  } = useGeneralaStore();

  const [target, setTarget] = useState<CellTarget>(null);
  const [showTotals, setShowTotals] = useState(false); // 👈 oculto por defecto
  const [editingPlayer, setEditingPlayer] = useState<PlayerRef | null>(null);

  const openCell = (playerId: string, category: CategoryKey) => {
    setTarget({ playerId, category });
  };
  const closeModal = () => setTarget(null);

  const onPick = (v: number | "X" | null) => {
    if (!target) return;
    setScore(target.playerId, target.category, v); // ✔️ sin cast
    setTarget(null);
  };

  const modalTitle = useMemo(() => {
    if (!target) return "";
    const rowLabel =
      CATEGORY_DEFS.find((c) => c.key === target.category)?.label ?? "";
    const playerName =
      players.find((p) => p.id === target.playerId)?.name ?? "";
    return `${rowLabel} — ${playerName}`;
  }, [target, players]);

  const canAdd = players.length < 6;

  return (
    <main className="safe-pad min-h-dvh bg-slate-900 text-slate-100 p-3 sm:p-4">
      <div className="mx-auto w-fit min-w-72">
        <header className="mb-3 flex items-center justify-between">
          <h1
            className="text-base sm:text-md font-extrabold cursor-pointer"
            onClick={() => window.history.back()}
          >
            🎲 Generala
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => canAdd && addPlayer()}
              className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-bold hover:bg-white/20 disabled:opacity-40"
              disabled={!canAdd}
            >
              + 🙋🏻‍♂️
            </button>
            <button
              onClick={reset}
              className="rounded-md bg-white text-slate-900 px-2.5 py-1 text-xs font-extrabold"
            >
              Reiniciar
            </button>
          </div>
        </header>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-800 px-3 py-3">
          <table className="table-fixed border-collapse w-16">
            {/* columnas: jugada ancha + jugadores ultra finitos */}
            <colgroup>
              <col style={{ width: 80 }} />
              {players.map((p) => (
                <col key={p.id} style={{ width: 74 }} />
              ))}
            </colgroup>

            <thead>
              <tr className="bg-slate-800/60">
                <th className="sticky left-0 z-10 bg-slate-800/60 px-3 text-left text-xs">
                  Jugada
                </th>
                {players.map((p) => (
                  <th key={p.id} className="px-1.5 py-0 text-left">
                    <button
                      onClick={() => setEditingPlayer(p)}
                      className="mx-auto cursor-pointer block w-[66px] truncate text-center text-xs font-bold text-white/90 hover:text-white"
                      title="Editar jugador"
                    >
                      {p.name}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {CATEGORY_DEFS.map((cat) => (
                <tr key={cat.key} className="even:bg-slate-800/40">
                  <td className="sticky left-0 z-10 bg-slate-800/60 px-3 py-2 text-sm font-semibold">
                    {cat.label}
                  </td>
                  {players.map((p) => {
                    const val = scores[p.id]?.[cat.key];
                    const content =
                      val === null ? (
                        <span className="opacity-50">—</span>
                      ) : val === "X" ? (
                        <span className="text-red-400 font-bold">X</span>
                      ) : (
                        <span className="font-bold">{val}</span>
                      );
                    return (
                      <td
                        key={p.id}
                        className={[
                          "px-1 py-1 text-center cursor-pointer select-none text-sm hover:bg-white/5",
                        ].join(" ")}
                        onClick={() => openCell(p.id, cat.key)}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Totales */}

              <tr
                onClick={() => setShowTotals(!showTotals)}
                className="cursor-pointer"
              >
                <td
                  className="sticky left-0 z-10 px-3 py-2 text-sm font-extrabold select-none border-t-1 border-slate-700"
                  onClick={() => setShowTotals(!showTotals)}
                >
                  {showTotals ? "👁️" : ""} Total
                </td>
                {players.map((p) => (
                  <td
                    key={p.id}
                    className="px-1 py-1 text-center text-sm font-extrabold border-t-1 border-slate-700 select-none"
                  >
                    {showTotals ? getTotal(scores, p.id) : "🫣"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de opciones */}
      {target && (
        <div className="fixed inset-0 z-[60] grid justify-items-center items-start pt-20 pointer-events-none">
          <div className="pointer-events-auto w-[320px] rounded-xl bg-white p-4 shadow-2xl">
            <div className="mb-3 text-center text-slate-900 font-extrabold">
              {modalTitle}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {optionsForCategory(target.category).map((opt) => (
                <button
                  key={opt.label}
                  className={`rounded-md border border-slate-200 bg-white px-3 py-2 font-bold ${
                    opt.value === "X" ? "text-red-600" : "text-slate-900"
                  } hover:bg-slate-50`}
                  onClick={() => onPick(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              className="mt-5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-semibold text-red-600 hover:bg-slate-50"
              onClick={() => onPick(null)}
            >
              Borrar
            </button>
            <button
              className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              onClick={closeModal}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      <PlayerEditModal
        open={!!editingPlayer}
        player={editingPlayer}
        onClose={() => setEditingPlayer(null)}
        onRename={renamePlayer}
        onRemove={removePlayer}
      />
    </main>
  );
}
