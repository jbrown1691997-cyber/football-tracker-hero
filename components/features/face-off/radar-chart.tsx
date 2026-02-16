'use client';

import {
    Radar,
    RadarChart as RechartsRadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

interface StatData {
    stat: string;
    playerA: number;
    playerB: number;
    fullMark: number;
}

interface RadarChartProps {
    data: StatData[];
    playerAName?: string;
    playerBName?: string;
    className?: string;
}

export function RadarChart({
    data,
    playerAName = 'Player A',
    playerBName = 'Player B',
    className,
}: RadarChartProps) {
    return (
        <div className={cn('w-full h-[400px]', className)}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis
                        dataKey="stat"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: '#6B7280', fontSize: 10 }}
                    />
                    <Radar
                        name={playerAName}
                        dataKey="playerA"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.3}
                        strokeWidth={2}
                    />
                    <Radar
                        name={playerBName}
                        dataKey="playerB"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                    />
                    <Legend
                        wrapperStyle={{
                            paddingTop: '20px',
                        }}
                    />
                </RechartsRadarChart>
            </ResponsiveContainer>
        </div>
    );
}
