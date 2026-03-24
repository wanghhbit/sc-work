import { create } from 'zustand';

interface GameState {
  status: 'menu' | 'playing' | 'gameover';
  player1HP: number;
  player2HP: number;
  timer: number;
  winner: string | null;
  setStatus: (status: 'menu' | 'playing' | 'gameover') => void;
  setHP: (player: 1 | 2, hp: number) => void;
  setTimer: (time: number) => void;
  setWinner: (winner: string | null) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  status: 'menu',
  player1HP: 100,
  player2HP: 100,
  timer: 60,
  winner: null,
  setStatus: (status) => set({ status }),
  setHP: (player, hp) => set((state) => ({
    ...state,
    [player === 1 ? 'player1HP' : 'player2HP']: Math.max(0, Math.min(100, hp))
  })),
  setTimer: (timer) => set({ timer }),
  setWinner: (winner) => set({ winner }),
  resetGame: () => set({
    status: 'playing',
    player1HP: 100,
    player2HP: 100,
    timer: 60,
    winner: null
  }),
}));
