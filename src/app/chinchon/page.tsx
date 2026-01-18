"use client";

import { useState } from "react";
import {
  useChinchonStore,
  getTotalChinchon,
  TARGET_CHINCHON,
} from "@/hooks/use-chinchon-store";
import { Toaster } from "react-hot-toast";
import { confirmWithToast } from "@/components";
import PlayerEditModal, { PlayerRef } from "@/components/PlayerEditModal";
import WinConfettiDiezMil from "@/components/WinConfettiDiezMil";
import ChinchonEvolutionChart from "@/components/ChinchonEvolutionChart";
import ChinchonModal from "@/components/ChinchonModal";

/* Editable header name (angostito) */

type Target = { playerId: string; turnIndex: number } | null;

export default function ChinchonPage() {
  const {
    players,
    turns,
    addPlayer,
    removePlayer,
    setScoreAt,
    reset,
    renamePlayer,
  } = useChinchonStore();

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
      "¿Seguro que querés reiniciar la partida de Chinchón?"
    );
    if (!ok) return;
    reset();
    try {
      useChinchonStore.persist?.clearStorage?.();
      useChinchonStore.persist?.rehydrate?.();
    } catch {}
  };

  const current = target ? turns[target.playerId]?.[target.turnIndex] ?? 0 : 0;
  const total = target ? getTotalChinchon(turns, target.playerId) : 0;
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
            🃏 Chinchón
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

                {players.map((p) => {
                  const t = getTotalChinchon(turns, p.id);
                  const remaining = TARGET_CHINCHON - t;

                  return (
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
                          <span
                            className={`text-sm ${
                              t <= 0
                                ? "text-emerald-400"
                                : t <= TARGET_CHINCHON
                                ? "text-blue-400"
                                : "text-red-400"
                            } font-semibold`}
                          >
                            {t}
                          </span>

                          {/* si está cerca de 100, mostramos lo que falta */}
                          {remaining <= 25 && remaining > 0 && (
                            <span className="text-[8px] text-red-400 font-extralight">
                              {remaining}
                            </span>
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {(() => {
                const maxTurns = Math.max(
                  0,
                  ...players.map((p) => turns[p.id]?.length ?? 0)
                );
                const rows = Math.max(1, maxTurns + 1);

                // nuevo → viejo
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
                                ? "font-bold text-emerald-400"
                                : val === 0
                                ? "text-blue-400 font-semibold"
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
        </div>
      </div>

      {/* Modal */}
      <ChinchonModal
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
        sumBefore={sumBefore}
        targetScore={TARGET_CHINCHON} // opcional
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
          <ChinchonEvolutionChart players={players} turns={turns} />
        </div>
      </div>
    </main>
  );
}
