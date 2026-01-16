"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CategoryKey =
  | "ones"
  | "twos"
  | "threes"
  | "fours"
  | "fives"
  | "sixes"
  | "escalera"
  | "full"
  | "poker"
  | "generala"
  | "doble";

export const CATEGORY_DEFS: { key: CategoryKey; label: string }[] = [
  { key: "ones", label: "1" },
  { key: "twos", label: "2" },
  { key: "threes", label: "3" },
  { key: "fours", label: "4" },
  { key: "fives", label: "5" },
  { key: "sixes", label: "6" },
  { key: "escalera", label: "Escalera" },
  { key: "full", label: "Full" },
  { key: "poker", label: "Poker" },
  { key: "generala", label: "Generala" },
  { key: "doble", label: "Doble" },
];

export type ScoreCell = number | "X" | null;

export type GeneralaHistoryEvent = {
  id: string; // uuid
  at: number; // Date.now()
  playerId: string;
  category: CategoryKey;
  value: ScoreCell;
  prev: ScoreCell;
};

export type Player = { id: string; name: string };

export type ScoreRow = Record<CategoryKey, ScoreCell>;
type Scores = Record<string, ScoreRow>;

type GeneralaState = {
  players: Player[];
  scores: Scores;

  // ✅ NUEVO: historial de cargas (steps reales)
  history: GeneralaHistoryEvent[];

  addPlayer: (name?: string) => void;
  removePlayer: (id: string) => void;
  renamePlayer: (id: string, name: string) => void;
  setScore: (playerId: string, category: CategoryKey, value: ScoreCell) => void;
  reset: () => void;
};

const emptyRow = (): ScoreRow => {
  const row = {} as ScoreRow;
  for (const { key } of CATEGORY_DEFS) row[key] = null;
  return row;
};

const initialPlayers: Player[] = [
  { id: "p1", name: "Jugador 1" },
  { id: "p2", name: "Jugador 2" },
];

const initialScores: Scores = initialPlayers.reduce<Scores>((acc, p) => {
  acc[p.id] = emptyRow();
  return acc;
}, {});

type FixedKind = Extract<
  CategoryKey,
  "escalera" | "full" | "poker" | "generala" | "doble"
>;
type ScoringConfig = { [K in FixedKind]: { normal: number; served: number } };

export const scoringConfig: ScoringConfig = {
  escalera: { normal: 20, served: 25 },
  full: { normal: 30, served: 35 },
  poker: { normal: 40, served: 45 },
  generala: { normal: 50, served: 100 },
  doble: { normal: 100, served: 120 }, // ajustá si usás otros valores
};

export const useGeneralaStore = create<GeneralaState>()(
  persist(
    (set, get) => ({
      players: initialPlayers,
      scores: initialScores,

      // ✅ NUEVO
      history: [],

      addPlayer: (name) => {
        const { players, scores } = get();
        if (players.length >= 6) return;

        const id = `p${Date.now().toString(36)}`;
        const newPlayer: Player = {
          id,
          name: name?.trim() || `Jugador ${players.length + 1}`,
        };

        set({
          players: [...players, newPlayer],
          scores: { ...scores, [id]: emptyRow() },
        });
      },

      renamePlayer: (id, name) => {
        set((state) => ({
          players: state.players.map((p) =>
            p.id === id ? { ...p, name: name.trim() || p.name } : p
          ),
        }));
      },

      removePlayer: (id) => {
        const { players, scores, history } = get();
        const nextPlayers = players.filter((p) => p.id !== id);
        const { [id]: _omit, ...rest } = scores;

        // opcional pero recomendable: eliminar eventos del jugador borrado
        const nextHistory = history.filter((ev) => ev.playerId !== id);

        set({ players: nextPlayers, scores: rest, history: nextHistory });
      },

      setScore: (playerId, category, value) => {
        const { scores, history } = get();
        const prev: ScoreCell = scores[playerId]?.[category] ?? null;

        // si querés evitar “eventos basura” cuando no cambia nada:
        if (prev === value) return;

        const nextScores: Scores = {
          ...scores,
          [playerId]: { ...scores[playerId], [category]: value },
        };

        const ev: GeneralaHistoryEvent = {
          id: crypto.randomUUID(),
          at: Date.now(),
          playerId,
          category,
          value,
          prev,
        };

        set({
          scores: nextScores,
          history: [...history, ev],
        });
      },

      reset: () =>
        set((state) => {
          const freshScores: Scores = state.players.reduce((acc, p) => {
            acc[p.id] = emptyRow();
            return acc;
          }, {} as Scores);

          return {
            scores: freshScores, // mantiene players tal cual
            history: [], // ✅ limpia steps
          };
        }),
    }),
    {
      name: "have-fun:generala",
      storage: createJSONStorage(() => localStorage),

      // ✅ persistimos history también
      partialize: (s) => ({
        players: s.players,
        scores: s.scores,
        history: s.history,
      }),
    }
  )
);

export const getTotal = (scores: Scores, playerId: string) =>
  Object.values(scores[playerId] || {}).reduce<number>(
    (acc, v) => acc + (typeof v === "number" ? v : 0),
    0
  );
