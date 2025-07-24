// apps/frontend/src/components/dashboard/platform-breakdown.tsx (FIXED - Working Pie Chart Tooltip)
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '../ui/card';

// Local types
interface DashboardStats {
    totalPosts: number;
    averageEngagementRate: number;
    bestPerformingPlatform: 'x' | 'linkedin' | 'facebook' | 'instagram';
    recommendedPostTime: string;
    weekOverWeekGrowth: number;
    topPerformingPost: {
        id: string;
        text: string;
        engagementRate: number;
    };
}

interface PlatformBreakdownProps {
    data: DashboardStats;
}

const PLATFORM_COLORS = {
    x: '#000000',        // Updated X color to black
    linkedin: '#0077B5',
    facebook: '#1877F2',
    instagram: '#E4405F',
};

// Custom tooltip component for pie chart
const CustomPieTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {data.displayName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span style={{ color: data.color }}>●</span> {data.value}% engagement
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {data.posts} posts
                </p>
            </div>
        );
    }
    return null;
};

export function PlatformBreakdown({ data }: PlatformBreakdownProps) {
    // Mock platform data with proper structure for tooltip
    const platformData = [
        {
            name: 'x',
            displayName: 'X',
            value: 45,
            posts: 67,
            color: PLATFORM_COLORS.x
        },
        {
            name: 'linkedin',
            displayName: 'LinkedIn',
            value: 30,
            posts: 45,
            color: PLATFORM_COLORS.linkedin
        },
        {
            name: 'facebook',
            displayName: 'Facebook',
            value: 15,
            posts: 23,
            color: PLATFORM_COLORS.facebook
        },
        {
            name: 'instagram',
            displayName: 'Instagram',
            value: 10,
            posts: 15,
            color: PLATFORM_COLORS.instagram
        },
    ];

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Platform Performance
            </h3>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={platformData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                            nameKey="displayName"
                            stroke="#fff"
                            strokeWidth={2}
                        >
                            {platformData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            content={<CustomPieTooltip />}
                            cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Platform Legend */}
            <div className="mt-4 space-y-2">
                {platformData.map((platform) => (
                    <div key={platform.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: platform.color }}
                            ></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {platform.displayName}
                            </span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {platform.value}%
                            </div>
                            <div className="text-xs text-gray-500">
                                {platform.posts} posts
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}