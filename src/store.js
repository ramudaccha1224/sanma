import { create } from 'zustand'

export const useGameStore = create((set) => ({
  games: [],
  addGame: (game) => set((state) => ({ games: [...state.games, game] })),
  removeGame: (index) => set((state) => ({
    games: state.games.filter((_, i) => i !== index)
  })),
  selectedGame: null,
  selectGame: (game) => set({ selectedGame: game })
}))
