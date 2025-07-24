'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/card';
import { useState } from 'react';
import type { PostAnalytics } from '@/types'; // Import from shared types

interface EngagementChartProps {
    data: PostAnalytics[];
}

export function EngagementChart({ data }: EngagementChartProps) {
    const [timeRange, setTimeRange] = useState('30');
    const [selectedMetric, setSelectedMetric] = useState('engagementRate');

    // Transform data for the chart based on selected time range
    const chartData = data
        .slice(-parseInt(timeRange)) // Last N posts based on selection
        .map((post) => ({
            date: new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }),
            engagementRate: post.engagementRate * 100, // Convert to percentage
            reach: post.reach,
            impressions: post.impressions,
            totalEngagement: Object.values(post.metrics).reduce((sum, val) => sum + (val || 0), 0),
            platform: post.service,
        }))
        .reverse(); // Most recent first

    const metrics = [
        { key: 'engagementRate', label: 'Engagement Rate', color: '#3B82F6', format: (val: number) => `${val.toFixed(2)}%` },
        { key: 'reach', label: 'Reach', color: '#10B981', format: (val: number) => val.toLocaleString() },
        { key: 'impressions', label: 'Impressions', color: '#F59E0B', format: (val: number) => val.toLocaleString() },
        { key: 'totalEngagement', label: 'Total Engagement', color: '#EF4444', format: (val: number) => val.toLocaleString() },
    ];

    const currentMetric = metrics.find(m => m.key === selectedMetric) || metrics[0];

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Engagement Over Time
                </h3>

                <div className="flex items-center space-x-4">
                    {/* Metric Selector */}
                    <select
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value)}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {metrics.map(metric => (
                            <option key={metric.key} value={metric.key}>
                                {metric.label}
                            </option>
                        ))}
                    </select>

                    {/* Time Range Selector */}
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                    </select>
                </div>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: currentMetric.color }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
            {currentMetric.label}
          </span>
                </div>
                <div className="text-sm text-gray-500">
                    {chartData.length} data points
                </div>
            </div>

            {/* Chart Container */}
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                            className="opacity-30 dark:opacity-20"
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12, fill: 'currentColor' }}
                            tickLine={false}
                            axisLine={false}
                            className="text-gray-600 dark:text-gray-400"
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: 'currentColor' }}
                            tickLine={false}
                            axisLine={false}
                            className="text-gray-600 dark:text-gray-400"
                            tickFormatter={currentMetric.format}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--background)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                            labelStyle={{
                                color: 'var(--foreground)',
                                fontWeight: 'medium'
                            }}
                            formatter={(value: number, name: string) => [
                                currentMetric.format(value),
                                currentMetric.label
                            ]}
                            labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Line
                            type="monotone"
                            dataKey={selectedMetric}
                            stroke={currentMetric.color}
                            strokeWidth={3}
                            dot={{
                                fill: currentMetric.color,
                                strokeWidth: 2,
                                r: 4,
                                className: 'drop-shadow-sm'
                            }}
                            activeDot={{
                                r: 6,
                                stroke: currentMetric.color,
                                strokeWidth: 2,
                                fill: '#ffffff',
                                className: 'drop-shadow-lg'
                            }}
                            connectNulls={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Chart Summary */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map(metric => {
                    const values = chartData.map(d => d[metric.key as keyof typeof d] as number);
                    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
                    const max = Math.max(...values);

                    return (
                        <div key={metric.key} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">{metric.label}</div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                Avg: {metric.format(avg)}
                            </div>
                            <div className="text-xs text-gray-500">
                                Max: {metric.format(max)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}