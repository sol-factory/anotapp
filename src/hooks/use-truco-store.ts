import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* ========== STORE ========== */

export type TeamKey = "us" | "them";
export type Team = { malas: number; buenas: number };

type State = {
  teams: Record<TeamKey, Team>;
  increment: (team: TeamKey) => void;
  decrement: (team: TeamKey) => void;
  reset: () => void;
};

const initialTeam: Team = { malas: 0, buenas: 0 };

export const useTrucoStore = create<State>()(
  persist(
    (set, get) => ({
      teams: { us: { ...initialTeam }, them: { ...initialTeam } },

      increment: (team) => {
        set((state) => {
          const t = { ...state.teams[team] };
          if (t.malas < 15) t.malas++;
          else if (t.buenas < 15) t.buenas++;
          return { teams: { ...state.teams, [team]: t } };
        });
      },

      decrement: (team) => {
        set((state) => {
          const t = { ...state.teams[team] };
          if (t.buenas > 0) t.buenas--;
          else if (t.malas > 0) t.malas--;
          return { teams: { ...state.teams, [team]: t } };
        });
      },

      // 👇 antes: reset: () => ({ teams: ... })
      reset: () =>
        set({
          teams: { us: { ...initialTeam }, them: { ...initialTeam } },
        }),
    }),
    {
      name: "have-fun:truco",
      storage: createJSONStorage(() => localStorage),
      // opcional: guardar solo 'teams'
      partialize: (s) => ({ teams: s.teams }),
    }
  )
);
