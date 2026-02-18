'use client';

import { type PlayerFixture } from '@/app/types';
import { cn } from '@/lib/utils';

interface FixtureTickerProps {
    fixtures: PlayerFixture[];
    className?: string;
}

const FDR_COLORS: Record<number, { bg: string; text: string; label: string }> = {
    1: { bg: 'bg-green-700', text: 'text-white', label: 'Very Easy' },
    2: { bg: 'bg-green-500', text: 'text-white', label: 'Easy' },
    3: { bg: 'bg-gray-500', text: 'text-white', label: 'Medium' },
    4: { bg: 'bg-orange-500', text: 'text-white', label: 'Hard' },
    5: { bg: 'bg-red-600', text: 'text-white', label: 'Very Hard' },
};

export function FixtureTicker({ fixtures, className }: FixtureTickerProps) {
    if (fixtures.length === 0) {
        return (
            <div className={cn('text-xs text-gray-500 italic mt-3', className)}>
                No upcoming fixtures
            </div>
        );
    }

    return (
        <div className={cn('mt-4 space-y-2', className)}>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                Next {fixtures.length} Fixtures
            </p>
            <div className="flex gap-1.5 flex-wrap justify-center">
                {fixtures.map((fixture, i) => {
                    const color = FDR_COLORS[fixture.difficulty] || FDR_COLORS[3];
                    return (
                        <div
                            key={`${fixture.opponentShort}-${i}`}
                            className={cn(
                                color.bg,
                                color.text,
                                'px-2 py-1 rounded-md text-[11px] font-semibold',
                                'transition-all duration-300 hover:scale-110 cursor-default',
                                'animate-in fade-in slide-in-from-bottom-2',
                            )}
                            style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
                            title={`GW${fixture.gameweek ?? '?'}: ${fixture.opponent} (${fixture.isHome ? 'Home' : 'Away'}) — ${color.label}`}
                        >
                            {fixture.opponentShort}
                            <span className="opacity-70 ml-0.5 text-[9px]">
                                {fixture.isHome ? '(H)' : '(A)'}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
