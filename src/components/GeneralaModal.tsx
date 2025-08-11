"use client";

import { CategoryKey, scoringConfig } from "@/hooks/use-generala-store";

type Opt = { label: string; value: number | "X" | null };

function upperOptions(face: number): Opt[] {
  const opts: Opt[] = [];
  for (let k = 1; k <= 5; k++)
    opts.push({ label: String(k * face), value: k * face });
  opts.push({ label: "Tachar", value: "X" });
  opts.push({ label: "Borrar", value: null });
  return opts;
}

function fixedOptions(
  kind: Extract<
    CategoryKey,
    "escalera" | "full" | "poker" | "generala" | "doble"
  >
): Opt[] {
  const cfg = scoringConfig[kind];
  return [
    { label: String(cfg.normal), value: cfg.normal },
    { label: `${cfg.served}`, value: cfg.served },
    { label: "Tachar", value: "X" },
  ];
}

export function optionsForCategory(cat: CategoryKey): Opt[] {
  switch (cat) {
    case "ones":
      return upperOptions(1);
    case "twos":
      return upperOptions(2);
    case "threes":
      return upperOptions(3);
    case "fours":
      return upperOptions(4);
    case "fives":
      return upperOptions(5);
    case "sixes":
      return upperOptions(6);
    case "escalera":
    case "full":
    case "poker":
    case "generala":
    case "doble":
      return fixedOptions(cat);
  }
}

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  onPick: (value: number | "X") => void;
};

export default function GeneralaModal({ open, onClose, title, onPick }: Props) {
  if (!open) return null;
  // Este modal es un contenedor “dumb”; las opciones se renderizan desde la página.
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-[320px] rounded-xl bg-white p-4 shadow-2xl">
        <div className="mb-3 text-center text-slate-900 font-extrabold">
          {title}
        </div>
        {/* Contenido real lo arma la page (ver page.tsx) */}
        <button
          className="mt-3 w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
