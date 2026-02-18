// FPL-based player stats for comparison
export interface PlayerStats {
    attacking: {
        goals: number;
        expectedGoals: number;
        threat: number;  // FPL threat score
    };
    playmaking: {
        assists: number;
        expectedAssists: number;
        creativity: number;  // FPL creativity score
    };
    fplValue: {
        pointsPerGame: number;
        bonus: number;
        form: number;
    };
}

export interface Player {
    id: number;
    name: string;
    position: string;
    team: string;
    teamId: number;
    photo?: string;
    stats?: PlayerStats;
}

// Raw FPL API types
export interface FPLElement {
    id: number;
    web_name: string;
    first_name: string;
    second_name: string;
    element_type: number; // 1=GKP, 2=DEF, 3=MID, 4=FWD
    team: number;
    photo: string;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    goals_conceded: number;
    threat: string;
    creativity: string;
    influence: string;
    expected_goals: string;
    expected_assists: string;
    minutes: number;
    status: string;
    // FPL Value stats
    bonus: number;
    form: string;
    points_per_game: string;
    total_points: number;
}

export interface FPLTeam {
    id: number;
    name: string;
    short_name: string;
}

export interface FPLFixture {
    id: number;
    event: number | null;
    finished: boolean;
    kickoff_time: string | null;
    team_h: number;
    team_a: number;
    team_h_difficulty: number;
    team_a_difficulty: number;
}

export interface PlayerFixture {
    opponent: string;
    opponentShort: string;
    isHome: boolean;
    difficulty: number; // 1-5 FDR
    gameweek: number | null;
    kickoffTime: string | null;
}

export interface PickRecommendation {
    winner: 'A' | 'B' | 'tie';
    winnerName: string;
    reason: string;
    scoreA: number;
    scoreB: number;
}

export interface FPLBootstrapResponse {
    elements: FPLElement[];
    teams: FPLTeam[];
    element_types: Array<{
        id: number;
        singular_name: string;
        singular_name_short: string;
    }>;
}
