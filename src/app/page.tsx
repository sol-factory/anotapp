"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-dvh bg-slate-900 text-slate-100 flex justify-center pt-14">
      <div className="w-full max-w-[560px]">
        {/* Logo + nombre */}
        <div className="flex flex-col items-center gap-3 mb-8">
          {/* si tenés tu logo en /public/logo.svg se mostrará acá */}
          <Image
            src="/logo.png"
            alt="Anotapp"
            width={96}
            height={96}
            className="h-32 w-32 rounded-2xl"
            onError={(e) => {
              // fallback simple si no existe logo.svg
              (e.currentTarget as HTMLImageElement).style.display = "none";
              const fallback = document.getElementById("logo-fallback");
              if (fallback) fallback.style.display = "grid";
            }}
          />
          <div
            id="logo-fallback"
            style={{ display: "none" }}
            className="grid place-items-center -mt-10 h-24 w-24 rounded-2xl bg-white text-slate-900 font-extrabold text-xl shadow-[0_8px_30px_rgba(0,0,0,.25)]"
          >
            A
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Anotapp</h1>
          <p className="text-sm text-slate-400">Elegí un juego para empezar</p>
        </div>

        {/* Opciones de juego */}
        <div className="flex flex-col items-center gap-3">
          <GameCard
            href="/truco"
            title="Truco"
            subtitle="Anotador con fósforos"
            icon={"🗡️"}
          />
          <GameCard
            href="/generala"
            title="Generala"
            subtitle="Tabla de puntajes"
            icon={"🎲"}
          />
          <GameCard
            href="/diez-mil"
            title="10.000"
            subtitle="Tabla de puntajes"
            icon={"🎯"}
          />
          <GameCard
            href="/chinchon"
            title="Chinchón"
            subtitle="Tabla de puntajes"
            icon={"🃏"}
          />
        </div>

        {/* Espacio para más juegos a futuro */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Más juegos próximamente…
        </div>
      </div>
    </main>
  );
}

/* --------- Components --------- */

function GameCard({
  href,
  title,
  subtitle,
  icon,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group w-72 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 transition-shadow shadow-[inset_0_1px_0_rgba(255,255,255,.04)]
      flex items-center gap-4"
    >
      <div className="h-12 w-12 text-3xl rounded-xl text-slate-900 grid place-items-center shadow-md">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-extrabold">{title}</div>
        <div className="text-xs text-slate-400 truncate">{subtitle}</div>
      </div>
      <span className="ml-auto text-slate-400 group-hover:translate-x-0.5 transition-transform">
        ➜
      </span>
    </Link>
  );
}

/* --------- Inline icons (monocromo, 1:1) --------- */

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <rect x="5" y="3" width="12" height="18" rx="2" fill="currentColor" />
      <path
        d="M12 7c-1.05 0-1.9.83-1.9 1.86 0 1.77 2.63 3.26 3.15 3.77.52-.51 3.15-2 3.15-3.77 0-1.03-.85-1.86-1.9-1.86-.6 0-1.15.27-1.5.72-.35-.45-.9-.72-1.5-.72Z"
        fill="white"
      />
    </svg>
  );
}

function DiceIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" />
      {/* 1 arriba */}
      <circle cx="12" cy="7" r="1.2" fill="white" />
      {/* 3 izquierda (diagonal ↘) */}
      <circle cx="7" cy="9" r="1.2" fill="white" />
      <circle cx="9" cy="11" r="1.2" fill="white" />
      <circle cx="11" cy="13" r="1.2" fill="white" />
      {/* 5 derecha */}
      <circle cx="15" cy="9" r="1.2" fill="white" />
      <circle cx="17" cy="11" r="1.2" fill="white" />
      <circle cx="19" cy="13" r="1.2" fill="white" />
      <circle cx="15" cy="13" r="1.2" fill="white" />
      <circle cx="19" cy="9" r="1.2" fill="white" />
    </svg>
  );
}
