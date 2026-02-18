'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { FaceOffZone, PlayerComparisonRadar, BestPickVerdict } from '@/components/features/face-off';
import { SearchInput } from '@/components/features/search';
import { useComparisonStore } from '@/lib/store/comparison-store';
import { type Player, type FPLFixture, type PlayerFixture, type PickRecommendation } from '@/app/types';
import { fetchFixtures, getNextFixtures, getRecommendation, getTeamMap } from '@/lib/api/fpl-api';

export default function ComparePage() {
    const { playerA, playerB, setPlayerA, setPlayerB } = useComparisonStore();
    const [fixtures, setFixtures] = useState<FPLFixture[]>([]);

    // Fetch fixtures on mount
    useEffect(() => {
        fetchFixtures()
            .then(setFixtures)
            .catch((err) => console.error('Failed to load fixtures:', err));
    }, []);

    // Compute next 5 fixtures for each player
    const teamMap = getTeamMap();

    const fixturesA: PlayerFixture[] = useMemo(() => {
        if (!playerA || fixtures.length === 0) return [];
        return getNextFixtures(playerA.teamId, fixtures, teamMap);
    }, [playerA, fixtures, teamMap]);

    const fixturesB: PlayerFixture[] = useMemo(() => {
        if (!playerB || fixtures.length === 0) return [];
        return getNextFixtures(playerB.teamId, fixtures, teamMap);
    }, [playerB, fixtures, teamMap]);

    // Generate recommendation when both players selected
    const recommendation: PickRecommendation | null = useMemo(() => {
        if (!playerA || !playerB || fixturesA.length === 0 || fixturesB.length === 0) return null;
        return getRecommendation(playerA, playerB, fixturesA, fixturesB);
    }, [playerA, playerB, fixturesA, fixturesB]);

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
                    <Link
                        href="/form-table"
                        className="inline-block text-sm text-gray-400 hover:text-green-400 transition-colors"
                    >
                        View Form Table →
                    </Link>
                </div>

                {/* Search */}
                <div className="flex justify-center">
                    <SearchInput
                        onPlayerSelect={handlePlayerSelect}
                        className="w-full max-w-lg"
                    />
                </div>

                {/* Comparison Zone */}
                <FaceOffZone fixturesA={fixturesA} fixturesB={fixturesB} />

                {/* Radar Chart - Shows when both players selected */}
                {showChart && (
                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PlayerComparisonRadar playerA={playerA} playerB={playerB} />
                    </div>
                )}

                {/* Best Pick Verdict - Shows when both players have fixtures */}
                {showChart && recommendation && (
                    <div className="mt-4">
                        <BestPickVerdict
                            recommendation={recommendation}
                            playerA={playerA}
                            playerB={playerB}
                        />
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

