'use client';

import { CategoryRadarChart } from './category-radar-chart';
import { type Player } from '@/app/types';

interface PlayerComparisonRadarProps {
    playerA?: Player | null;
    playerB?: Player | null;
}

export function PlayerComparisonRadar({ playerA, playerB }: PlayerComparisonRadarProps) {
    if (!playerA && !playerB) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 text-gray-400">
                Select players to compare detailed metrics
            </div>
        );
    }

    // Default empty stats using new FPL-based structure
    const defaultStats = {
        attacking: { goals: 0, expectedGoals: 0, threat: 0 },
        playmaking: { assists: 0, expectedAssists: 0, creativity: 0 },
        fplValue: { pointsPerGame: 0, bonus: 0, form: 0 }
    };

    const statsA = playerA?.stats || defaultStats;
    const statsB = playerB?.stats || defaultStats;

    // --- CHART 1: ATTACKING THREAT ---
    // Goals ~30, xG ~25, Threat ~800 (scaled /10)
    const attackingData = [
        { metric: 'Goals', valueA: statsA.attacking.goals, valueB: statsB.attacking.goals, fullMark: 30 },
        { metric: 'xG', valueA: statsA.attacking.expectedGoals, valueB: statsB.attacking.expectedGoals, fullMark: 25 },
        { metric: 'Threat', valueA: statsA.attacking.threat / 10, valueB: statsB.attacking.threat / 10, fullMark: 80 },
    ];

    // --- CHART 2: PLAYMAKING VISION ---
    // Assists ~20, xA ~15, Creativity ~1000 (scaled /10)
    const playmakingData = [
        { metric: 'Assists', valueA: statsA.playmaking.assists, valueB: statsB.playmaking.assists, fullMark: 20 },
        { metric: 'xA', valueA: statsA.playmaking.expectedAssists, valueB: statsB.playmaking.expectedAssists, fullMark: 15 },
        { metric: 'Creativity', valueA: statsA.playmaking.creativity / 10, valueB: statsB.playmaking.creativity / 10, fullMark: 100 },
    ];

    // --- CHART 3: FPL VALUE ---
    // Points/Game ~8, Bonus ~25, Form ~10
    const fplValueData = [
        { metric: 'Pts/Game', valueA: statsA.fplValue.pointsPerGame, valueB: statsB.fplValue.pointsPerGame, fullMark: 8 },
        { metric: 'Bonus', valueA: statsA.fplValue.bonus, valueB: statsB.fplValue.bonus, fullMark: 25 },
        { metric: 'Form', valueA: statsA.fplValue.form, valueB: statsB.fplValue.form, fullMark: 10 },
    ];

    const nameA = playerA?.name || 'Player A';
    const nameB = playerB?.name || 'Player B';

    return (
        <div className="w-full space-y-8">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
                FPL <span className="text-green-500">Trifecta Analysis</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Attacking Chart */}
                <div className="h-[350px]">
                    <CategoryRadarChart
                        title="⚔️ Attacking Threat"
                        data={attackingData}
                        playerAName={nameA}
                        playerBName={nameB}
                        colorClass="text-pink-500"
                    />
                </div>

                {/* Playmaking Chart */}
                <div className="h-[350px]">
                    <CategoryRadarChart
                        title="🎯 Playmaking Vision"
                        data={playmakingData}
                        playerAName={nameA}
                        playerBName={nameB}
                        colorClass="text-yellow-500"
                    />
                </div>

                {/* FPL Value Chart */}
                <div className="h-[350px]">
                    <CategoryRadarChart
                        title="💎 FPL Value"
                        data={fplValueData}
                        playerAName={nameA}
                        playerBName={nameB}
                        colorClass="text-emerald-500"
                    />
                </div>
            </div>

            <p className="text-center text-gray-500 text-sm italic">
                *Stats from Fantasy Premier League API. Threat/Creativity scaled for readability.
            </p>
        </div>
    );
}
