import { NextResponse } from 'next/server';

const FPL_API_URL = 'https://fantasy.premierleague.com/api/bootstrap-static/';

// Cache the response for 1 hour
let cachedData: { data: unknown; timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function GET() {
    try {
        // Check cache
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
            return NextResponse.json(cachedData.data);
        }

        // Fetch from FPL API server-side (no CORS issues)
        const response = await fetch(FPL_API_URL, {
            headers: {
                'User-Agent': 'PlayerHub/1.0',
            },
        });

        if (!response.ok) {
            throw new Error(`FPL API error: ${response.status}`);
        }

        const data = await response.json();

        // Update cache
        cachedData = {
            data,
            timestamp: Date.now(),
        };

        return NextResponse.json(data);
    } catch (error) {
        console.error('FPL API proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch FPL data' },
            { status: 500 }
        );
    }
}
