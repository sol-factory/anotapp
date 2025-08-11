"use client";

import { useMemo, useState } from "react";
import {
  useGeneralaStore,
  CATEGORY_DEFS,
  CategoryKey,
  getTotal,
  ScoreCell,
} from "@/hooks/use-generala-store";
import GeneralaModal, { optionsForCategory } from "@/components/GeneralaModal";

/* --- celda de nombre editable --- */
function EditablePlayerName({ id, name }: { id: string; name: string }) {
  const renamePlayer = useGeneralaStore((s) => s.renamePlayer);
  const removePlayer = useGeneralaStore((s) => s.removePlayer);

  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(name);

  // si cambió por otro lado (persist / reset), sync
  if (!editing && val !== name) setVal(name);

  const save = () => {
    if (val.trim() && val !== name) renamePlayer(id, val);
    setEditing(false);
  };
  const cancel = () => {
    setVal(name);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2 text-center justify-center">
      {editing ? (
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value.slice(0, 10))}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          className="w-[56px] rounded-sm border border-white/20 bg-white/10 px-1 py-0.5 text-xs font-semibold text-white focus:outline-none"
          maxLength={10}
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-fit truncate text-left text-xs font-bold text-white/90 hover:text-white"
          title="Editar nombre"
        >
          {name}
        </button>
      )}
      <button
        onClick={() => removePlayer(id)}
        className="text-[10px] text-red-300 hover:text-red-400 cursor-pointer"
        title="Quitar jugador"
      >
        ✕
      </button>
    </div>
  );
}

type CellTarget = { playerId: string; category: CategoryKey } | null;

export default function GeneralaPage() {
  const { players, scores, addPlayer, setScore, reset } = useGeneralaStore();
  const [target, setTarget] = useState<CellTarget>(null);

  const openCell = (playerId: string, category: CategoryKey) => {
    const already = scores[playerId]?.[category];
    if (already !== null) return;
    setTarget({ playerId, category });
  };
  const closeModal = () => setTarget(null);
  const onPick = (v: number | "X") => {
    if (!target) return;
    setScore(target.playerId, target.category, v as ScoreCell);
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
    <main className="min-h-dvh bg-slate-900 text-slate-100 p-3 sm:p-4">
      <div className="mx-auto w-fit">
        <header className="mb-3 flex items-center justify-between">
          <h1 className="text-base sm:text-md font-extrabold">🎲 Generala</h1>
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
              Reset
            </button>
          </div>
        </header>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-800 px-3 py-1">
          <table className="table-fixed border-collapse w-16">
            {/* columnas: jugada ancha + jugadores ultra finitos */}
            <colgroup>
              <col style={{ width: 90 }} />
              {players.map((p) => (
                <col key={p.id} style={{ width: 74 }} />
              ))}
            </colgroup>

            <thead>
              <tr className="bg-slate-800/60">
                <th className="sticky left-0 z-10 bg-slate-800/60 px-3 py-2 text-left text-xs">
                  Jugada
                </th>
                {players.map((p) => (
                  <th key={p.id} className="px-1.5 py-1 text-left">
                    <EditablePlayerName id={p.id} name={p.name} />
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
                          "px-1 py-1 text-center cursor-pointer select-none text-sm",
                          val !== null ? "cursor-default" : "hover:bg-white/5",
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
              <tr>
                <td className="sticky left-0 z-10 bg-slate-900 px-3 py-2 text-sm font-extrabold">
                  Total
                </td>
                {players.map((p) => (
                  <td
                    key={p.id}
                    className="px-1 py-1 text-center text-sm font-extrabold"
                  >
                    {getTotal(scores, p.id)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de opciones */}
      <GeneralaModal
        open={!!target}
        onClose={closeModal}
        title={modalTitle}
        onPick={onPick}
      />
      {target && (
        <div className="fixed inset-0 z-[60] grid place-items-center pointer-events-none">
          <div className="pointer-events-auto w-[320px] rounded-xl bg-white p-4 shadow-2xl">
            <div className="mb-3 text-center text-slate-900 font-extrabold">
              {modalTitle}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {optionsForCategory(target.category).map((opt) => (
                <button
                  key={opt.label}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 font-bold text-slate-900 hover:bg-slate-50"
                  onClick={() => onPick(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              className="mt-3 w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              onClick={closeModal}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
