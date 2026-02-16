'use client';

import { FaceOffZone, PlayerComparisonRadar } from '@/components/features/face-off';
import { SearchInput } from '@/components/features/search';
import { useComparisonStore } from '@/lib/store/comparison-store';
import { type Player } from '@/app/types';

export default function ComparePage() {
    const { playerA, playerB, setPlayerA, setPlayerB } = useComparisonStore();

    const handlePlayerSelect = (player: Player) => {
        // Auto-assign to first empty slot
        if (!playerA) {
            setPlayerA(player);
        } else if (!playerB) {
            setPlayerB(player);
        } else {
            // Both full, replace player B
            setPlayerB(player);
        }
    };

    const showChart = playerA && playerB;

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">
                        Player <span className="text-green-500">Face-Off</span>
                    </h1>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Search for players and click to add them to the comparison.
                    </p>
                </div>

                {/* Search */}
                <div className="flex justify-center">
                    <SearchInput
                        onPlayerSelect={handlePlayerSelect}
                        className="w-full max-w-lg"
                    />
                </div>

                {/* Comparison Zone */}
                <FaceOffZone />

                {/* Radar Chart - Shows when both players selected */}
                {showChart && (
                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PlayerComparisonRadar playerA={playerA} playerB={playerB} />
                    </div>
                )}

                {/* Instructions */}
                <div className="text-center text-sm text-gray-500 mt-8">
                    <p>💡 Tip: Search for a player and click to add them. The chart appears when both slots are filled.</p>
                </div>
            </div>
        </main>
    );
}
