"use client";

import { useEffect, useState } from "react";

export type PlayerRef = { id: string; name: string };

export default function PlayerEditModal({
  open,
  player,
  onClose,
  onRename,
  onRemove,
}: {
  open: boolean;
  player: PlayerRef | null;
  onClose: () => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}) {
  const [val, setVal] = useState("");

  useEffect(() => {
    if (open && player) setVal(player.name);
  }, [open, player]);

  if (!open || !player) return null;

  const save = () => {
    const name = val.trim();
    if (name && name !== player.name) onRename(player.id, name);
    onClose();
  };

  const remove = () => {
    onRemove(player.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid justify-items-center items-start pt-20">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative  z-10 w-[320px] rounded-xl bg-white p-4 shadow-2xl">
        <div className="mb-3 text-center text-slate-900 font-extrabold">
          Editar jugador
        </div>

        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Nombre
        </label>
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value.slice(0, 16))}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") onClose();
          }}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none"
          placeholder="Nombre"
          maxLength={16}
        />

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            className="rounded-md bg-slate-900 px-3 py-2 font-extrabold text-white"
          >
            Guardar
          </button>
        </div>

        <button
          onClick={remove}
          className="mt-3 w-full rounded-md border border-red-200 bg-white px-3 py-2 font-semibold text-red-600 hover:bg-red-50"
        >
          Eliminar jugador
        </button>

        <p className="mt-1 text-[11px] text-slate-500 text-center">
          (No se puede deshacer)
        </p>
      </div>
    </div>
  );
}
