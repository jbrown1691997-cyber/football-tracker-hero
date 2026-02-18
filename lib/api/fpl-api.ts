import { type Player, type PlayerStats, type FPLBootstrapResponse, type FPLElement, type FPLFixture, type PlayerFixture, type PickRecommendation } from '@/app/types';

// Use local API proxies to avoid CORS issues
const FPL_API_URL = '/api/fpl';
const FPL_FIXTURES_URL = '/api/fpl/fixtures';

// Cache for FPL data
let cachedData: { players: Player[]; teamMap: Map<number, { name: string; shortName: string }>; timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Cache for fixtures data
let cachedFixtures: { fixtures: FPLFixture[]; timestamp: number } | null = null;

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
    teamMap: Map<number, { name: string; shortName: string }>
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
        team: teamMap.get(element.team)?.name || 'Unknown',
        teamId: element.team,
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

        // Build team lookup map with short names
        const teamMap = new Map<number, { name: string; shortName: string }>();
        data.teams.forEach((team) => {
            teamMap.set(team.id, { name: team.name, shortName: team.short_name });
        });

        // Transform all available players
        const players = data.elements
            .filter((el) => el.minutes > 0 || el.status === 'a')
            .map((element) => transformPlayer(element, teamMap))
            .sort((a, b) => a.name.localeCompare(b.name));

        // Update cache
        cachedData = {
            players,
            teamMap,
            timestamp: Date.now(),
        };

        return players;
    } catch (error) {
        console.error('Failed to fetch FPL data:', error);
        if (cachedData) {
            return cachedData.players;
        }
        throw error;
    }
}

/**
 * Get the team map (must call fetchFPLPlayers first)
 */
export function getTeamMap(): Map<number, { name: string; shortName: string }> {
    return cachedData?.teamMap || new Map();
}

/**
 * Fetch all fixtures from FPL API
 */
export async function fetchFixtures(): Promise<FPLFixture[]> {
    if (cachedFixtures && Date.now() - cachedFixtures.timestamp < CACHE_DURATION) {
        return cachedFixtures.fixtures;
    }

    try {
        const response = await fetch(FPL_FIXTURES_URL);

        if (!response.ok) {
            throw new Error(`FPL Fixtures API error: ${response.status}`);
        }

        const data: FPLFixture[] = await response.json();

        cachedFixtures = {
            fixtures: data,
            timestamp: Date.now(),
        };

        return data;
    } catch (error) {
        console.error('Failed to fetch FPL fixtures:', error);
        if (cachedFixtures) {
            return cachedFixtures.fixtures;
        }
        throw error;
    }
}

/**
 * Get the next N fixtures for a specific team
 */
export function getNextFixtures(
    teamId: number,
    fixtures: FPLFixture[],
    teamMap: Map<number, { name: string; shortName: string }>,
    count: number = 5
): PlayerFixture[] {
    return fixtures
        .filter((f) => !f.finished && (f.team_h === teamId || f.team_a === teamId))
        .sort((a, b) => (a.event ?? 999) - (b.event ?? 999))
        .slice(0, count)
        .map((fixture) => {
            const isHome = fixture.team_h === teamId;
            const opponentId = isHome ? fixture.team_a : fixture.team_h;
            const opponentInfo = teamMap.get(opponentId);

            return {
                opponent: opponentInfo?.name || 'Unknown',
                opponentShort: opponentInfo?.shortName || '???',
                isHome,
                difficulty: isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty,
                gameweek: fixture.event,
                kickoffTime: fixture.kickoff_time,
            };
        });
}

/**
 * Calculate a pick score for a player based on form + fixtures
 * Higher score = better pick
 */
export function calculatePickScore(player: Player, fixtures: PlayerFixture[]): number {
    const form = player.stats?.fplValue.form || 0;
    const ppg = player.stats?.fplValue.pointsPerGame || 0;

    // Average fixture ease (6 - difficulty, so FDR 1 = 5 ease, FDR 5 = 1 ease)
    const avgFixtureEase =
        fixtures.length > 0
            ? fixtures.reduce((sum, f) => sum + (6 - f.difficulty), 0) / fixtures.length
            : 2.5; // neutral if no fixtures

    // Weighted score: form matters most, then PPG, then fixture ease
    return form * 2 + ppg * 1.5 + avgFixtureEase * 1;
}

/**
 * Get a recommendation for who to pick
 */
export function getRecommendation(
    playerA: Player,
    playerB: Player,
    fixturesA: PlayerFixture[],
    fixturesB: PlayerFixture[]
): PickRecommendation {
    const scoreA = calculatePickScore(playerA, fixturesA);
    const scoreB = calculatePickScore(playerB, fixturesB);

    const formA = playerA.stats?.fplValue.form || 0;
    const formB = playerB.stats?.fplValue.form || 0;
    const easeA = fixturesA.length > 0 ? fixturesA.reduce((s, f) => s + (6 - f.difficulty), 0) / fixturesA.length : 0;
    const easeB = fixturesB.length > 0 ? fixturesB.reduce((s, f) => s + (6 - f.difficulty), 0) / fixturesB.length : 0;

    let reason = '';
    if (Math.abs(scoreA - scoreB) < 0.5) {
        return {
            winner: 'tie',
            winnerName: 'Too close to call',
            reason: 'Both players are extremely evenly matched in form and fixtures.',
            scoreA: Math.round(scoreA * 10) / 10,
            scoreB: Math.round(scoreB * 10) / 10,
        };
    }

    const winner = scoreA > scoreB ? 'A' : 'B';
    const winnerName = winner === 'A' ? playerA.name : playerB.name;
    const winnerForm = winner === 'A' ? formA : formB;
    const loserForm = winner === 'A' ? formB : formA;
    const winnerEase = winner === 'A' ? easeA : easeB;
    const loserEase = winner === 'A' ? easeB : easeA;

    if (winnerForm > loserForm && winnerEase > loserEase) {
        reason = `Higher form (${winnerForm} vs ${loserForm}) with easier fixtures ahead`;
    } else if (winnerForm > loserForm) {
        reason = `Superior form (${winnerForm} vs ${loserForm}) outweighs tougher fixtures`;
    } else if (winnerEase > loserEase) {
        reason = `Much easier fixture run makes up for slightly lower form`;
    } else {
        reason = `Better overall combination of form, PPG, and fixture difficulty`;
    }

    return {
        winner,
        winnerName,
        reason,
        scoreA: Math.round(scoreA * 10) / 10,
        scoreB: Math.round(scoreB * 10) / 10,
    };
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

