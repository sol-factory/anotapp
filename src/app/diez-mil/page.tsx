"use client";

import { useState } from "react";
import { useDiezMilStore, getTotalDiezMil } from "@/hooks/use-diezmil-store";
import DiezMilModal from "@/components/DiezMilModal";
import { Toaster } from "react-hot-toast";
import { confirmWithToast } from "@/components";
import WinConfettiDiezMil from "@/components/WinConfettiDiezMil";
import PlayerEditModal, { PlayerRef } from "@/components/PlayerEditModal";
import DiezMilEvolutionChart from "@/components/DiezMilEvolutionChart";

/* Editable header name (angostito) */

type Target = { playerId: string; turnIndex: number } | null;

export default function DiezMilPage() {
  const {
    players,
    turns,
    addPlayer,
    removePlayer,
    setScoreAt,
    reset,
    renamePlayer,
  } = useDiezMilStore();

  const [target, setTarget] = useState<Target>(null);
  const [editingPlayer, setEditingPlayer] = useState<PlayerRef | null>(null);

  const closeModal = () => setTarget(null);

  const onPick = (value: number) => {
    if (!target) return;
    setScoreAt(target.playerId, target.turnIndex, value);
    setTarget(null);
  };

  const canAdd = players.length < 6;

  const onReset = async () => {
    const ok = await confirmWithToast(
      "¿Seguro que querés reiniciar la partida de 10.000?"
    );
    if (!ok) return;
    reset();
    try {
      useDiezMilStore.persist?.clearStorage?.();

      useDiezMilStore.persist?.rehydrate?.();
    } catch {}
  };

  const current = target ? turns[target.playerId]?.[target.turnIndex] ?? 0 : 0;
  const total = target ? getTotalDiezMil(turns, target.playerId) : 0;
  const sumBefore = total - current;

  return (
    <main className="min-h-dvh bg-slate-900 text-slate-100 safe-pad">
      <Toaster position="top-center" />
      <WinConfettiDiezMil />

      <div className="mx-auto w-fit min-w-72">
        <header className="mb-3 flex items-center justify-between gap-3">
          <h1
            className="text-base sm:text-md font-extrabold cursor-pointer"
            onClick={() => window.history.back()}
          >
            🎯 10.000
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => canAdd && addPlayer()}
              className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-bold hover:bg-white/20 disabled:opacity-40"
              disabled={!canAdd}
            >
              + 🙋🏻‍♂️
            </button>
            <button
              onClick={onReset}
              className="rounded-md bg-white text-slate-900 px-2.5 py-1 text-xs font-extrabold"
            >
              Reiniciar
            </button>
          </div>
        </header>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-800 px-3 py-1 max-h-96 no-scrollbar">
          <table className="table-fixed border-collapse w-16">
            <colgroup>
              <col style={{ width: 70 }} />
              {players.map((p) => (
                <col key={p.id} style={{ width: 90 }} />
              ))}
            </colgroup>

            <thead>
              <tr className="bg-slate-800/60">
                <th className="sticky left-0 z-10 bg-slate-800/60 px-3 py-2 text-left text-sm">
                  Turno
                </th>
                {players.map((p) => (
                  <th
                    key={p.id}
                    className="px-1.5 py-1 text-left align-text-top"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => setEditingPlayer(p)}
                        className="mx-auto cursor-pointer block w-[66px] truncate text-center text-sm font-bold text-white/90 hover:text-white"
                        title="Editar jugador"
                      >
                        {p.name}
                      </button>

                      <div className="flex flex-col items-center">
                        <span className="text-sm text-blue-400 font-semibold">
                          {getTotalDiezMil(turns, p.id)}
                        </span>
                        {10000 - getTotalDiezMil(turns, p.id) <= 1500 && (
                          <span className="text-[8px] text-green-400 font-extralight">
                            {10000 - getTotalDiezMil(turns, p.id)}
                          </span>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {(() => {
                // filas = maxTurns + 1 (como ya tenías)
                const maxTurns = Math.max(
                  0,
                  ...players.map((p) => turns[p.id]?.length ?? 0)
                );
                const rows = Math.max(1, maxTurns + 1);

                // 🔁 índices de fila en orden inverso: nuevo → viejo
                const rowIndexes = Array.from(
                  { length: rows },
                  (_, i) => rows - 1 - i
                );

                return rowIndexes.map((rowIndex) => (
                  <tr key={rowIndex} className="even:bg-slate-800/40">
                    <td className="sticky left-0 z-10 bg-slate-800/60 px-3 py-2 text-sm font-semibold">
                      {`T${rowIndex + 1}`}
                    </td>

                    {players.map((p) => {
                      const val = turns[p.id]?.[rowIndex];
                      const content =
                        val != null ? (
                          <span
                            className={
                              val < 0
                                ? "font-bold text-red-400"
                                : val === 0
                                ? "text-gray-600"
                                : "font-semibold"
                            }
                          >
                            {val}
                          </span>
                        ) : (
                          <span className="opacity-50">—</span>
                        );

                      return (
                        <td
                          key={p.id}
                          className={[
                            "px-1 py-1 text-center cursor-pointer select-none text-sm",
                            val != null ? "cursor-default" : "hover:bg-white/5",
                          ].join(" ")}
                          onClick={() =>
                            setTarget({ playerId: p.id, turnIndex: rowIndex })
                          }
                          title="Agregar puntaje"
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })()}
            </tbody>
          </table>

          {/* acciones por jugador (undo) */}
          {/* <div className="mt-2 flex gap-2 justify-end">
            {players.map((p) => (
              <button
                key={p.id}
                onClick={() => undoLast(p.id)}
                className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold hover:bg-white/20"
                title={`Deshacer último de ${p.name}`}
              >
                ⟲ {p.name}
              </button>
            ))}
          </div> */}
        </div>
      </div>

      {/* Modal */}
      <DiezMilModal
        open={!!target}
        onClose={closeModal}
        title={
          target
            ? `Puntaje — ${
                players.find((p) => p.id === target.playerId)?.name ?? ""
              } (T${target.turnIndex + 1})`
            : ""
        }
        onPick={onPick}
        initialValue={current}
        sumBefore={sumBefore} // 👈 NUEVO
      />
      <PlayerEditModal
        open={!!editingPlayer}
        player={editingPlayer}
        onClose={() => setEditingPlayer(null)}
        onRename={renamePlayer}
        onRemove={removePlayer}
      />

      <div className="mx-auto w-fit min-w-72 mt-5 max-w-full">
        <div className="mb-3">
          <DiezMilEvolutionChart players={players} turns={turns} />
        </div>
      </div>
    </main>
  );
}
