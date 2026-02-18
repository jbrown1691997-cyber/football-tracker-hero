'use client';

import { type PickRecommendation, type Player } from '@/app/types';
import { cn } from '@/lib/utils';

interface BestPickVerdictProps {
    recommendation: PickRecommendation;
    playerA: Player;
    playerB: Player;
    className?: string;
}

export function BestPickVerdict({
    recommendation,
    playerA,
    playerB,
    className,
}: BestPickVerdictProps) {
    const { winner, winnerName, reason, scoreA, scoreB } = recommendation;
    const maxScore = Math.max(scoreA, scoreB);
    const barWidthA = maxScore > 0 ? (scoreA / maxScore) * 100 : 50;
    const barWidthB = maxScore > 0 ? (scoreB / maxScore) * 100 : 50;

    const isTie = winner === 'tie';

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl p-6',
                'bg-gradient-to-br from-gray-900/80 via-gray-800/50 to-gray-900/80',
                'border border-gray-700/50 backdrop-blur-sm',
                'animate-in fade-in slide-in-from-bottom-4 duration-700',
                className
            )}
        >
            {/* Glow effect for winner */}
            {!isTie && (
                <div
                    className={cn(
                        'absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20',
                        winner === 'A' ? 'bg-green-500' : 'bg-blue-500'
                    )}
                />
            )}

            {/* Header */}
            <div className="relative text-center mb-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">
                    Fixture-Based Recommendation
                </p>
                {isTie ? (
                    <h3 className="text-xl font-bold text-gray-300">
                        🤝 Too Close to Call
                    </h3>
                ) : (
                    <h3 className="text-xl font-bold text-white">
                        🏆 Best Pick:{' '}
                        <span
                            className={cn(
                                winner === 'A' ? 'text-green-400' : 'text-blue-400'
                            )}
                        >
                            {winnerName}
                        </span>
                    </h3>
                )}
                <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">{reason}</p>
            </div>

            {/* Score Comparison Bars */}
            <div className="relative space-y-3 max-w-md mx-auto">
                {/* Player A */}
                <div className="flex items-center gap-3">
                    <span
                        className={cn(
                            'w-20 text-right text-sm font-medium truncate',
                            winner === 'A' ? 'text-green-400' : 'text-gray-400'
                        )}
                    >
                        {playerA.name}
                    </span>
                    <div className="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                'h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2',
                                winner === 'A'
                                    ? 'bg-gradient-to-r from-green-600 to-green-400'
                                    : 'bg-gradient-to-r from-gray-600 to-gray-500'
                            )}
                            style={{ width: `${barWidthA}%` }}
                        >
                            <span className="text-[11px] font-bold text-white drop-shadow">
                                {scoreA}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Player B */}
                <div className="flex items-center gap-3">
                    <span
                        className={cn(
                            'w-20 text-right text-sm font-medium truncate',
                            winner === 'B' ? 'text-blue-400' : 'text-gray-400'
                        )}
                    >
                        {playerB.name}
                    </span>
                    <div className="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                'h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2',
                                winner === 'B'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-400'
                                    : 'bg-gradient-to-r from-gray-600 to-gray-500'
                            )}
                            style={{ width: `${barWidthB}%` }}
                        >
                            <span className="text-[11px] font-bold text-white drop-shadow">
                                {scoreB}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <p className="text-center text-[10px] text-gray-600 mt-4">
                Score = (Form × 2) + (PPG × 1.5) + (Fixture Ease × 1)
            </p>
        </div>
    );
}
