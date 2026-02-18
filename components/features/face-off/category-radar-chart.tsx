'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';

interface StatPoint {
    metric: string;
    valueA: number;
    valueB: number;
    fullMark: number; // The max value for normalization
}

interface CategoryRadarChartProps {
    title: string;
    data: StatPoint[]; // Raw data
    playerAName: string;
    playerBName: string;
    colorClass: string; // Tailclass for colors (e.g., 'text-red-500')
}

// Custom Tooltip to show RAW numbers instead of normalized 0-100 values
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl backdrop-blur-md">
                <p className="text-gray-300 font-semibold mb-2">{label}</p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.stroke }}
                        />
                        <span style={{ color: entry.stroke }}>{entry.name}:</span>
                        <span className="text-white font-mono font-bold">
                            {/* We stored rawValue in the payload via the data object */}
                            {entry.payload[`raw${entry.dataKey}`]}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function CategoryRadarChart({ title, data, playerAName, playerBName, colorClass }: CategoryRadarChartProps) {
    // Transform data: Normalize values to 0-100 scale for the chart, but keep raw values for tooltip
    const normalizedData = data.map(item => ({
        subject: item.metric,
        A: (item.valueA / item.fullMark) * 100,
        B: (item.valueB / item.fullMark) * 100,
        rawA: item.valueA,
        rawB: item.valueB,
        fullMark: 100
    }));

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/5 p-4 flex flex-col h-full">
            <h4 className={cn("text-lg font-bold text-center mb-4", colorClass)}>
                {title}
            </h4>
            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={normalizedData}>
                        <PolarGrid stroke="#374151" strokeDasharray="3 3" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />

                        <Radar
                            name={playerAName}
                            dataKey="A"
                            stroke="#60A5FA" // Blue-400
                            strokeWidth={3}
                            fill="#3B82F6"
                            fillOpacity={0.3}
                        />

                        <Radar
                            name={playerBName}
                            dataKey="B"
                            stroke="#F87171" // Red-400
                            strokeWidth={3}
                            fill="#EF4444"
                            fillOpacity={0.3}
                        />

                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
