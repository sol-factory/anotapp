"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { useDiezMilStore, getTotalDiezMil } from "@/hooks/use-diezmil-store";
import { victoryToast } from ".";

export default function WinConfettiDiezMil() {
  const players = useDiezMilStore((s) => s.players);
  const turns = useDiezMilStore((s) => s.turns);
  const reset = useDiezMilStore((s) => s.reset);

  const prevTotals = useRef<Record<string, number>>({});

  useEffect(() => {
    const totals = Object.fromEntries(
      players.map((p) => [p.id, getTotalDiezMil(turns, p.id)])
    );
    const winner = players.find(
      (p) => (prevTotals.current[p.id] ?? 0) < 10000 && totals[p.id] >= 10000
    );

    prevTotals.current = totals;

    if (!winner) return;

    fireConfettiSoft();
    victoryToast(`${winner.name}`, () => {
      reset();
      try {
        useDiezMilStore.persist?.clearStorage?.();

        useDiezMilStore.persist?.rehydrate?.();
      } catch {}
    });
  }, [players, turns, reset]);

  return null;
}

function fireConfettiSoft() {
  confetti({
    particleCount: 60,
    spread: 65,
    startVelocity: 45,
    gravity: 0.9,
    ticks: 170,
    origin: { x: 0.5, y: 0.7 },
    scalar: 0.9,
  });
  setTimeout(() => {
    confetti({
      particleCount: 22,
      angle: 60,
      spread: 55,
      origin: { x: 0.2, y: 0.8 },
      scalar: 0.8,
    });
  }, 140);
  setTimeout(() => {
    confetti({
      particleCount: 22,
      angle: 120,
      spread: 55,
      origin: { x: 0.8, y: 0.8 },
      scalar: 0.8,
    });
  }, 220);
}
