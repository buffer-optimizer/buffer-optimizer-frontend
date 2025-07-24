'use client';

import { TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';
import { Card } from '../ui/card';
import type { DashboardStats } from '@/types'; // Import from shared types

interface DashboardStatsProps {
    data: DashboardStats;
}

export function DashboardStats({ data }: DashboardStatsProps) {
    const stats = [
        {
            name: 'Total Posts',
            value: data.totalPosts.toLocaleString(),
            icon: Target,
            change: null,
            changeType: null,
        },
        {
            name: 'Avg Engagement Rate',
            value: `${(data.averageEngagementRate * 100).toFixed(2)}%`,
            icon: TrendingUp,
            change: data.weekOverWeekGrowth,
            changeType: data.weekOverWeekGrowth >= 0 ? 'positive' : 'negative',
        },
        {
            name: 'Best Platform',
            value: data.bestPerformingPlatform.charAt(0).toUpperCase() + data.bestPerformingPlatform.slice(1),
            icon: Target,
            change: null,
            changeType: null,
        },
        {
            name: 'Optimal Time',
            value: data.recommendedPostTime,
            icon: Clock,
            change: null,
            changeType: null,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
                <Card key={stat.name} className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {stat.name}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stat.value}
                            </p>
                            {stat.change !== null && (
                                <div className="flex items-center mt-2">
                                    {stat.changeType === 'positive' ? (
                                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                                    )}
                                    <span
                                        className={`text-sm font-medium ${
                                            stat.changeType === 'positive'
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                        }`}
                                    >
                    {stat.changeType === 'positive' ? '+' : ''}
                                        {stat.change.toFixed(1)}%
                  </span>
                                    <span className="text-sm text-gray-500 ml-1">vs last week</span>
                                </div>
                            )}
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                            <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}