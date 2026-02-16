'use client';

import { type Player } from '@/app/types';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
    player: Player;
    side?: 'left' | 'right';
    isDraggable?: boolean;
    className?: string;
}

export function PlayerCard({ player, side, isDraggable = false, className }: PlayerCardProps) {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/json', JSON.stringify(player));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div
            draggable={isDraggable}
            onDragStart={isDraggable ? handleDragStart : undefined}
            className={cn(
                'flex flex-col items-center p-6 rounded-lg bg-gray-900/50 backdrop-blur-sm',
                isDraggable && 'cursor-grab active:cursor-grabbing hover:scale-105 transition-transform',
                side === 'left' && 'items-start text-left',
                side === 'right' && 'items-end text-right',
                className
            )}
        >
            {/* Player Photo */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-800 mb-4">
                {player.photo ? (
                    <img
                        src={player.photo}
                        alt={player.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-gray-500">
                        ⚽
                    </div>
                )}
            </div>

            {/* Player Info */}
            <h3 className="text-lg font-semibold text-white">{player.name}</h3>
            <p className="text-sm text-gray-400">{player.position}</p>
            <p className="text-xs text-gray-500">{player.team}</p>
        </div>
    );
}
