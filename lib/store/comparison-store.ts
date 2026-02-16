// Zustand store for Face-Off comparison
// This store manages the selected players for comparison

import { create } from 'zustand';
import { type Player } from '@/app/types';

interface ComparisonState {
    playerA: Player | null;
    playerB: Player | null;
    setPlayerA: (player: Player | null) => void;
    setPlayerB: (player: Player | null) => void;
    swapPlayers: () => void;
    clearComparison: () => void;
}

export const useComparisonStore = create<ComparisonState>((set) => ({
    playerA: null,
    playerB: null,
    setPlayerA: (player) => set({ playerA: player }),
    setPlayerB: (player) => set({ playerB: player }),
    swapPlayers: () =>
        set((state) => ({
            playerA: state.playerB,
            playerB: state.playerA,
        })),
    clearComparison: () => set({ playerA: null, playerB: null }),
}));
