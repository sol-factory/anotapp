// /hooks/use-chinchon-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const TARGET_CHINCHON = 100;

export type TurnsMap = Record<string, (number | undefined)[]>;

export const getTotalChinchon = (turns: TurnsMap, playerId: string): number =>
  (turns[playerId] ?? []).reduce<number>((a, v) => a + (v ?? 0), 0);

type Player = { id: string; name: string };

type State = {
  players: Player[];
  addPlayer: (name?: string) => void;
  removePlayer: (id: string) => void;
  renamePlayer: (id: string, name: string) => void;
  turns: Record<string, (number | undefined)[]>;
  setScoreAt: (playerId: string, turnIndex: number, value: number) => void;
  reset: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const useChinchonStore = create<State>()(
  persist(
    (set, get) => ({
      players: [{ id: uid(), name: "Jugador 1" }],
      turns: {},

      addPlayer: () =>
        set((s) => {
          const n = s.players.length + 1;
          return {
            players: [...s.players, { id: uid(), name: `Jugador ${n}` }],
          };
        }),

      removePlayer: (playerId) =>
        set((s) => {
          const players = s.players.filter((p) => p.id !== playerId);
          const turns = { ...s.turns };
          delete turns[playerId];
          return { players, turns };
        }),

      renamePlayer: (playerId, name) =>
        set((s) => ({
          players: s.players.map((p) =>
            p.id === playerId ? { ...p, name } : p
          ),
        })),

      setScoreAt: (playerId, turnIndex, value) =>
        set((s) => {
          const arr: (number | undefined)[] = [...(s.turns[playerId] ?? [])];

          // si el usuario tocó una celda vacía "del medio"
          while (arr.length < turnIndex) arr.push(undefined);

          arr[turnIndex] = value;

          return {
            turns: {
              ...s.turns,
              [playerId]: arr,
            },
          };
        }),

      reset: () =>
        set({ players: [{ id: uid(), name: "Jugador 1" }], turns: {} }),
    }),
    { name: "chinchon-store" }
  )
);
