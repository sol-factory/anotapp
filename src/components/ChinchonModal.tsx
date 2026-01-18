"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  onPick: (value: number) => void;
  initialValue?: number;
  sumBefore?: number; // total antes de este turno
  targetScore?: number; // default 100
};

export default function ChinchonModal({
  open,
  onClose,
  title = "Puntaje",
  onPick,
  initialValue = 0,
}: Props) {
  const [value, setValue] = useState<number>(initialValue ?? 0);

  useEffect(() => {
    if (open) setValue(initialValue ?? 0);
  }, [open, initialValue]);

  const quick = useMemo(
    () => [
      -10, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
      20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    ],
    []
  );

  const clamp = (n: number) => {
    if (Number.isNaN(n)) return 0;
    // en chinchón normalmente 0..100 por mano (pero si querés permitir más, cambialo)
    return Math.min(100, Math.max(0, n));
  };

  const submit = () => onPick(clamp(Number(value)));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full sm:w-[420px] rounded-t-2xl sm:rounded-2xl border border-white/10 bg-slate-900 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="min-w-0">
            <div className="text-xs text-white/60">Chinchón</div>
            <div className="truncate text-sm font-extrabold">{title}</div>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              value={value}
              onChange={(e) => setValue(clamp(Number(e.target.value)))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-base font-semibold outline-none focus:ring-2 focus:ring-white/10"
              placeholder="0"
            />
            <button
              onClick={submit}
              className="rounded-xl bg-white text-slate-900 px-4 py-2 text-sm font-extrabold"
            >
              OK
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {quick.map((n) => (
              <button
                key={n}
                onClick={() => onPick(n)}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20"
              >
                {n}
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"
            >
              Cancelar
            </button>
            <button
              onClick={submit}
              className="w-full rounded-xl bg-white text-slate-900 px-4 py-2 text-sm font-extrabold"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
