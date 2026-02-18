'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { type Player, type FPLFixture, type PlayerFixture } from '@/app/types';
import { fetchFPLPlayers, fetchFixtures, getNextFixtures, getTeamMap } from '@/lib/api/fpl-api';
import { FixtureTicker } from '@/components/features/face-off/fixture-ticker';
import { useComparisonStore } from '@/lib/store/comparison-store';
import { useRouter } from 'next/navigation';

const POSITIONS = ['All', 'Forward', 'Midfielder', 'Defender', 'Goalkeeper'] as const;
type PositionFilter = (typeof POSITIONS)[number];

export default function FormTablePage() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [fixtures, setFixtures] = useState<FPLFixture[]>([]);
    const [loading, setLoading] = useState(true);
    const [positionFilter, setPositionFilter] = useState<PositionFilter>('All');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const { setPlayerA, setPlayerB, playerA } = useComparisonStore();
    const router = useRouter();

    useEffect(() => {
        Promise.all([fetchFPLPlayers(), fetchFixtures()])
            .then(([p, f]) => {
                setPlayers(p);
                setFixtures(f);
            })
            .catch((err) => console.error('Failed to load data:', err))
            .finally(() => setLoading(false));
    }, []);

    const teamMap = getTeamMap();

    const sortedPlayers = useMemo(() => {
        let filtered = players.filter((p) => (p.stats?.fplValue.form || 0) > 0);
        if (positionFilter !== 'All') {
            filtered = filtered.filter((p) => p.position === positionFilter);
        }
        return filtered
            .sort((a, b) => (b.stats?.fplValue.form || 0) - (a.stats?.fplValue.form || 0))
            .slice(0, 20);
    }, [players, positionFilter]);

    const handleCompare = (player: Player) => {
        if (!playerA) {
            setPlayerA(player);
        } else {
            setPlayerB(player);
        }
        router.push('/compare');
    };

    const getPlayerFixtures = (player: Player): PlayerFixture[] => {
        if (fixtures.length === 0) return [];
        return getNextFixtures(player.teamId, fixtures, teamMap);
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6 md:p-12">
                <div className="max-w-5xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-12 bg-gray-800 rounded-lg w-64 mx-auto" />
                        <div className="h-8 bg-gray-800 rounded-lg w-48 mx-auto" />
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-16 bg-gray-800/50 rounded-lg" />
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">
                        Form <span className="text-green-500">Table</span>
                    </h1>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Top performers ranked by current FPL form. Tap a row to see their fixtures.
                    </p>
                </div>

                {/* Nav */}
                <div className="flex justify-center">
                    <Link
                        href="/compare"
                        className="text-sm text-gray-400 hover:text-green-400 transition-colors flex items-center gap-1.5"
                    >
                        ← Back to Face-Off
                    </Link>
                </div>

                {/* Position Filter */}
                <div className="flex justify-center gap-2 flex-wrap">
                    {POSITIONS.map((pos) => (
                        <button
                            key={pos}
                            onClick={() => setPositionFilter(pos)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${positionFilter === pos
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            {pos}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-800/50 bg-gray-900/30 backdrop-blur-sm">
                    {/* Table Header */}
                    <div className="grid grid-cols-[3rem_1fr_6rem_5rem_5rem_5rem_6rem] md:grid-cols-[3rem_3fr_6rem_5rem_5rem_5rem_6rem] gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700/50 text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                        <span className="text-center">#</span>
                        <span>Player</span>
                        <span className="text-center">Form</span>
                        <span className="text-center hidden md:block">PPG</span>
                        <span className="text-center hidden md:block">Goals</span>
                        <span className="text-center hidden md:block">Assists</span>
                        <span className="text-center">Action</span>
                    </div>

                    {/* Rows */}
                    {sortedPlayers.map((player, index) => {
                        const form = player.stats?.fplValue.form || 0;
                        const ppg = player.stats?.fplValue.pointsPerGame || 0;
                        const goals = player.stats?.attacking.goals || 0;
                        const assists = player.stats?.playmaking.assists || 0;
                        const isExpanded = expandedRow === player.id;
                        const playerFixtures = isExpanded ? getPlayerFixtures(player) : [];

                        // Form color based on value
                        let formColor = 'text-gray-400';
                        if (form >= 8) formColor = 'text-green-400';
                        else if (form >= 6) formColor = 'text-emerald-400';
                        else if (form >= 4) formColor = 'text-yellow-400';
                        else if (form >= 2) formColor = 'text-orange-400';

                        return (
                            <div
                                key={player.id}
                                className="animate-in fade-in slide-in-from-bottom-2"
                                style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'both' }}
                            >
                                <div
                                    onClick={() => setExpandedRow(isExpanded ? null : player.id)}
                                    className={`grid grid-cols-[3rem_1fr_6rem_5rem_5rem_5rem_6rem] md:grid-cols-[3rem_3fr_6rem_5rem_5rem_5rem_6rem] gap-2 px-4 py-3 items-center cursor-pointer transition-all duration-200 ${isExpanded
                                            ? 'bg-gray-800/60'
                                            : 'hover:bg-gray-800/30'
                                        } ${index !== sortedPlayers.length - 1 ? 'border-b border-gray-800/30' : ''}`}
                                >
                                    {/* Rank */}
                                    <span className={`text-center text-sm font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-gray-500'
                                        }`}>
                                        {index + 1}
                                    </span>

                                    {/* Player Info */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                                            {player.photo ? (
                                                <img
                                                    src={player.photo}
                                                    alt={player.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                                                    ⚽
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">{player.name}</p>
                                            <p className="text-[11px] text-gray-500 truncate">
                                                {player.team} · {player.position}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Form */}
                                    <div className="text-center">
                                        <span className={`text-lg font-bold ${formColor}`}>{form}</span>
                                    </div>

                                    {/* PPG */}
                                    <span className="text-center text-sm text-gray-300 hidden md:block">{ppg}</span>

                                    {/* Goals */}
                                    <span className="text-center text-sm text-gray-300 hidden md:block">{goals}</span>

                                    {/* Assists */}
                                    <span className="text-center text-sm text-gray-300 hidden md:block">{assists}</span>

                                    {/* Compare Button */}
                                    <div className="text-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCompare(player);
                                            }}
                                            className="px-3 py-1.5 text-[11px] font-medium rounded-full bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors border border-green-500/20"
                                        >
                                            Compare
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Fixtures */}
                                {isExpanded && (
                                    <div className="px-4 py-4 bg-gray-800/30 border-b border-gray-800/30 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="flex justify-center">
                                            <FixtureTicker fixtures={playerFixtures} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-500">
                    <p>💡 Tap a player row to see their next 5 fixtures. Click Compare to send them to Face-Off.</p>
                </div>
            </div>
        </main>
    );
}
