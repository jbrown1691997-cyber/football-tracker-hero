'use client';

import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { type Player } from '@/app/types';
import { fetchFPLPlayers } from '@/lib/api/fpl-api';

interface SearchInputProps {
    onPlayerSelect?: (player: Player) => void;
    className?: string;
}

export function SearchInput({ onPlayerSelect, className }: SearchInputProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Player[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load all players on mount
    useEffect(() => {
        async function loadPlayers() {
            try {
                setIsLoading(true);
                setError(null);
                const players = await fetchFPLPlayers();
                setAllPlayers(players);
            } catch (err) {
                console.error('Failed to load players:', err);
                setError('Failed to load players');
            } finally {
                setIsLoading(false);
            }
        }
        loadPlayers();
    }, []);

    const handleSearch = useCallback((searchQuery: string) => {
        setQuery(searchQuery);
        if (searchQuery.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const lowerQuery = searchQuery.toLowerCase();
        const filtered = allPlayers.filter(
            (player) =>
                player.name.toLowerCase().includes(lowerQuery) ||
                player.team.toLowerCase().includes(lowerQuery)
        ).slice(0, 20); // Limit to 20 results for performance

        setResults(filtered);
        setIsOpen(filtered.length > 0);
    }, [allPlayers]);

    const handleSelect = (player: Player) => {
        onPlayerSelect?.(player);
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div className={cn('relative w-full max-w-md', className)}>
            <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={isLoading ? "Loading players..." : `Search ${allPlayers.length} players...`}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
            />

            {error && (
                <p className="absolute top-full left-0 mt-2 text-red-400 text-sm">{error}</p>
            )}

            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                    {results.map((player) => (
                        <button
                            key={player.id}
                            onClick={() => handleSelect(player)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors flex items-center gap-3 first:rounded-t-lg last:rounded-b-lg"
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-lg overflow-hidden shrink-0">
                                {player.photo ? (
                                    <img
                                        src={player.photo}
                                        alt={player.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback if image fails to load
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    "⚽"
                                )}
                            </div>
                            <div>
                                <p className="text-white font-medium">{player.name}</p>
                                <p className="text-sm text-gray-400">
                                    {player.position} • {player.team}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
