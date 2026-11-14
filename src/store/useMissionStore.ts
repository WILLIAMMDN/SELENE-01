import { create } from 'zustand'
import { choose, initialMission, nextSol, type MissionState } from '../game/simulation'

type MissionStore = MissionState & {
  decide: (choiceId: string) => void
  advance: () => void
  restart: () => void
}

export const useMissionStore = create<MissionStore>((set) => ({
  ...initialMission(),
  decide: (choiceId) => set((state) => choose(state, choiceId)),
  advance: () => set((state) => nextSol(state)),
  restart: () => set(initialMission()),
}))
