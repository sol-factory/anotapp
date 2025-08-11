"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Player = { id: string; name: string };
export type DiezMilState = {
  players: Player[];
  turns: Record<string, number[]>; // playerId -> lista de puntajes por turno
  addPlayer: (name?: string) => void;
  removePlayer: (id: string) => void;
  renamePlayer: (id: string, name: string) => void;
  setScoreAt: (playerId: string, turnIndex: number, value: number) => void;
  undoLast: (playerId: string) => void;
  reset: () => void;
};

const initialPlayers: Player[] = [
  { id: "p1", name: "Jugador 1" },
  { id: "p2", name: "Jugador 2" },
];

const emptyTurns: Record<string, number[]> = Object.fromEntries(
  initialPlayers.map((p) => [p.id, []])
) as Record<string, number[]>;

export const useDiezMilStore = create<DiezMilState>()(
  persist(
    (set, get) => ({
      players: initialPlayers,
      turns: emptyTurns,

      addPlayer: (name) => {
        const { players, turns } = get();
        if (players.length >= 6) return;
        const id = `p${Date.now().toString(36)}`;
        const newPlayer: Player = {
          id,
          name: name?.trim() || `Jugador ${players.length + 1}`,
        };
        set({
          players: [...players, newPlayer],
          turns: { ...turns, [id]: [] },
        });
      },

      removePlayer: (id) => {
        const { players, turns } = get();
        const nextPlayers = players.filter((p) => p.id !== id);
        const { [id]: _omit, ...rest } = turns;
        set({ players: nextPlayers, turns: rest });
      },

      renamePlayer: (id, name) => {
        set((state) => ({
          players: state.players.map((p) =>
            p.id === id ? { ...p, name: name.trim() || p.name } : p
          ),
        }));
      },

      setScoreAt: (playerId, turnIndex, value) => {
        set((state) => {
          const arr = [...(state.turns[playerId] || [])];
          // Relleno si hace falta
          while (arr.length < turnIndex + 1) arr.push(0);
          arr[turnIndex] = value;
          return { turns: { ...state.turns, [playerId]: arr } };
        });
      },

      undoLast: (playerId) => {
        set((state) => {
          const arr = [...(state.turns[playerId] || [])];
          arr.pop();
          return { turns: { ...state.turns, [playerId]: arr } };
        });
      },

      reset: () => set({ players: initialPlayers, turns: emptyTurns }),
    }),
    {
      name: "have-fun:10000",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ players: s.players, turns: s.turns }),
    }
  )
);

export const getTotalDiezMil = (
  turns: Record<string, number[]>,
  playerId: string
) =>
  (turns[playerId] || []).reduce((a, n) => a + (Number.isFinite(n) ? n : 0), 0);

export const getMaxTurns = (
  turns: Record<string, number[]>,
  playerIds: string[]
) => Math.max(0, ...playerIds.map((id) => turns[id]?.length ?? 0));
