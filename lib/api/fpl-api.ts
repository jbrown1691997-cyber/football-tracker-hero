import { type Player, type PlayerStats, type FPLBootstrapResponse, type FPLElement } from '@/app/types';

// Use local API proxy to avoid CORS issues
const FPL_API_URL = '/api/fpl';

// Cache for FPL data
let cachedData: { players: Player[]; timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Position mapping
const POSITION_MAP: Record<number, string> = {
    1: 'Goalkeeper',
    2: 'Defender',
    3: 'Midfielder',
    4: 'Forward',
};

/**
 * Transform FPL element to our Player type
 */
function transformPlayer(
    element: FPLElement,
    teamMap: Map<number, string>
): Player {
    const stats: PlayerStats = {
        attacking: {
            goals: element.goals_scored,
            expectedGoals: parseFloat(element.expected_goals) || 0,
            threat: parseFloat(element.threat) || 0,
        },
        playmaking: {
            assists: element.assists,
            expectedAssists: parseFloat(element.expected_assists) || 0,
            creativity: parseFloat(element.creativity) || 0,
        },
        fplValue: {
            pointsPerGame: parseFloat(element.points_per_game) || 0,
            bonus: element.bonus || 0,
            form: parseFloat(element.form) || 0,
        },
    };

    // Build photo URL from FPL photo code
    const photoCode = element.photo.replace('.jpg', '');
    const photoUrl = `https://resources.premierleague.com/premierleague/photos/players/250x250/p${photoCode}.png`;

    return {
        id: element.id,
        name: element.web_name,
        position: POSITION_MAP[element.element_type] || 'Unknown',
        team: teamMap.get(element.team) || 'Unknown',
        photo: photoUrl,
        stats,
    };
}

/**
 * Fetch all Premier League players from FPL API
 */
export async function fetchFPLPlayers(): Promise<Player[]> {
    // Check cache
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        return cachedData.players;
    }

    try {
        const response = await fetch(FPL_API_URL);

        if (!response.ok) {
            throw new Error(`FPL API error: ${response.status}`);
        }

        const data: FPLBootstrapResponse = await response.json();

        // Build team lookup map
        const teamMap = new Map<number, string>();
        data.teams.forEach((team) => {
            teamMap.set(team.id, team.name);
        });

        // Transform all available players (status 'a' = available, 'd' = doubtful, etc.)
        const players = data.elements
            .filter((el) => el.minutes > 0 || el.status === 'a') // Players who have played or are available
            .map((element) => transformPlayer(element, teamMap))
            .sort((a, b) => a.name.localeCompare(b.name));

        // Update cache
        cachedData = {
            players,
            timestamp: Date.now(),
        };

        return players;
    } catch (error) {
        console.error('Failed to fetch FPL data:', error);
        // Return cached data if available, even if stale
        if (cachedData) {
            return cachedData.players;
        }
        throw error;
    }
}

/**
 * Search players by name or team
 */
export async function searchPlayers(query: string): Promise<Player[]> {
    const players = await fetchFPLPlayers();
    const lowerQuery = query.toLowerCase();

    return players.filter(
        (player) =>
            player.name.toLowerCase().includes(lowerQuery) ||
            player.team.toLowerCase().includes(lowerQuery)
    );
}
