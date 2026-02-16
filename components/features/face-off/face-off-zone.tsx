'use client';

import { type Player } from '@/app/types';
import { useComparisonStore } from '@/lib/store/comparison-store';
import { PlayerCard } from './player-card';
import { cn } from '@/lib/utils';

interface FaceOffZoneProps {
    className?: string;
}

export function FaceOffZone({ className }: FaceOffZoneProps) {
    const { playerA, playerB, swapPlayers, clearComparison } = useComparisonStore();

    const handleDrop = (slot: 'A' | 'B') => (e: React.DragEvent) => {
        e.preventDefault();
        const playerData = e.dataTransfer.getData('application/json');
        if (playerData) {
            const player: Player = JSON.parse(playerData);
            if (slot === 'A') {
                useComparisonStore.getState().setPlayerA(player);
            } else {
                useComparisonStore.getState().setPlayerB(player);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    return (
        <div className={cn('flex flex-col items-center gap-6', className)}>
            <div className="flex items-center gap-4 md:gap-8 w-full max-w-4xl">
                {/* Player A Slot */}
                <div
                    onDrop={handleDrop('A')}
                    onDragOver={handleDragOver}
                    className={cn(
                        'flex-1 min-h-[300px] rounded-xl border-2 border-dashed transition-colors',
                        playerA ? 'border-green-500 bg-green-500/10' : 'border-gray-600 hover:border-gray-400'
                    )}
                >
                    {playerA ? (
                        <PlayerCard player={playerA} side="left" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Drop Player A
                        </div>
                    )}
                </div>

                {/* VS Divider */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl font-bold text-gray-300">VS</span>
                    <button
                        onClick={swapPlayers}
                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                        title="Swap players"
                    >
                        ⇄
                    </button>
                </div>

                {/* Player B Slot */}
                <div
                    onDrop={handleDrop('B')}
                    onDragOver={handleDragOver}
                    className={cn(
                        'flex-1 min-h-[300px] rounded-xl border-2 border-dashed transition-colors',
                        playerB ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-400'
                    )}
                >
                    {playerB ? (
                        <PlayerCard player={playerB} side="right" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Drop Player B
                        </div>
                    )}
                </div>
            </div>

            {(playerA || playerB) && (
                <button
                    onClick={clearComparison}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                    Clear Comparison
                </button>
            )}
        </div>
    );
}
