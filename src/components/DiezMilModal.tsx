"use client";
import { useEffect, useRef, useState } from "react";

const QUICK: number[] = [
  -100, 0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 750, 800,
  900, 1000, 1200, 1500,
];

export default function TenMilModal({
  open,
  title,
  onPick,
  onClose,
  initialValue,
  sumBefore, // 👈 suma del jugador sin esta celda
}: {
  open: boolean;
  title: string;
  onPick: (value: number) => void;
  onClose: () => void;
  initialValue?: number | null;
  sumBefore: number; // 👈 NUEVO
}) {
  const [val, setVal] = useState<string>(
    initialValue != null ? String(initialValue) : ""
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setVal(initialValue != null ? String(initialValue) : "");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, initialValue]);

  if (!open) return null;

  const maxNew = 10000 - sumBefore; // valor máximo que puedo guardar en esta celda
  const num = +val > 0 ? Number(val) : null;
  const isNum = Number.isFinite(num);
  const exceeds = isNum && Number(num) > maxNew; // ¿me paso?
  const canSave = isNum && !exceeds; // guardo solo si no me paso
  const helper = isNum
    ? exceeds
      ? `Te pasás por ${Number(num) - maxNew}`
      : maxNew >= 0
      ? `Te faltan ${maxNew - Number(num)}`
      : `Ya superaste 10.000, solo podés restar`
    : "";

  return (
    <div className="fixed inset-0 z-50 grid justify-items-center items-start pt-20">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-[320px] rounded-xl bg-white p-4 shadow-2xl">
        <div className="mb-3 text-center text-slate-900 font-extrabold">
          {title}
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {QUICK.map((q) => {
            const disabled = q > maxNew; // negativos siempre ok; positivos > maxNew, bloqueados
            return (
              <button
                key={q}
                disabled={disabled}
                className={[
                  "rounded-md border px-2 py-1.5 text-sm font-bold",
                  q < 0
                    ? "border-red-300 text-red-600 bg-white"
                    : "border-slate-200 text-slate-900 bg-white",
                  disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-slate-50",
                ].join(" ")}
                onClick={() => onPick(q)}
                title={disabled ? "Supera 10.000" : undefined}
              >
                {q}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="number"
            step={50}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className={[
              "flex-1 !w-52 rounded-md border px-3 py-2 text-slate-900 outline-none",
              exceeds ? "border-red-400" : "border-slate-300",
            ].join(" ")}
            placeholder={maxNew >= 0 ? `Máx ${maxNew}` : "Solo negativos"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSave) onPick(Number(num));
              if (e.key === "Escape") onClose();
            }}
          />
          <button
            disabled={!canSave}
            onClick={() => onPick(Number(num))}
            className="rounded-md bg-slate-900 px-3 py-2 text-white font-extrabold disabled:opacity-40"
          >
            Guardar
          </button>
        </div>

        <div className="mt-2 text-xs text-center">
          {helper && (
            <span
              className={
                exceeds ? "text-red-600 font-semibold" : "text-green-600"
              }
            >
              {helper}
            </span>
          )}
        </div>

        <button
          className="mt-3 w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
