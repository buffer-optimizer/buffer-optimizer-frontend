'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';
import {
    Clock,
    Calendar,
    TrendingUp,
    Target,
    Zap,
    Info,
    ChevronRight,
    Settings,
    Sparkles
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import type { OptimalTimingAnalysis, PostAnalytics, BufferProfile } from '../../types';

interface OptimalTimesData {
    optimalTimes: OptimalTimingAnalysis | null;
    posts: PostAnalytics[];
    profiles: BufferProfile[];
}

export default function OptimalTimesPage() {
    const [data, setData] = useState<OptimalTimesData>({
        optimalTimes: null,
        posts: [],
        profiles: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState('all');

    useEffect(() => {
        loadOptimalTimesData();
    }, []);

    useEffect(() => {
        // Reload data when platform filter changes
        if (data.profiles.length > 0) {
            loadOptimalTimesData();
        }
    }, [selectedPlatform]);

    const loadOptimalTimesData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load profiles first
            const profiles = await apiClient.profiles.list();
            const profileId = profiles[0]?.id;

            if (!profileId) {
                throw new Error('No profiles found');
            }

            // Load optimal times and posts data
            const [optimalTimes, posts] = await Promise.all([
                apiClient.analytics.getOptimalTimes(profileId),
                apiClient.analytics.getPosts(profileId),
            ]);

            // Filter posts by platform if selected
            const filteredPosts = selectedPlatform === 'all'
                ? posts
                : posts.filter(post => post.service === selectedPlatform);

            setData({ optimalTimes, posts: filteredPosts, profiles });
        } catch (err) {
            console.error('Optimal times loading error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load optimal times data');
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        loadOptimalTimesData();
    };

    // Generate heatmap data for time slots from actual data
    const generateHeatmapData = () => {
        if (!data.optimalTimes || data.posts.length === 0) return [];

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const hours = Array.from({ length: 24 }, (_, i) => i);

        const heatmapData: any = [];

        days.forEach((day, dayIndex) => {
            hours.forEach(hour => {
                // Get posts for this day/hour combination
                const dayHourPosts = data.posts.filter(post => {
                    const postDate = new Date(post.publishedAt);
                    return postDate.getDay() === dayIndex && postDate.getHours() === hour;
                });

                // Calculate average engagement for this time slot
                const avgEngagement = dayHourPosts.length > 0
                    ? dayHourPosts.reduce((sum, post) => sum + post.engagementRate, 0) / dayHourPosts.length
                    : 0;

                const score = avgEngagement * 100;

                heatmapData.push({
                    day,
                    hour: `${hour.toString().padStart(2, '0')}:00`,
                    score: score,
                    postCount: dayHourPosts.length,
                    intensity: score > 6 ? 'high' : score > 3 ? 'medium' : 'low'
                });
            });
        });

        return heatmapData;
    };

    // Generate data for the best times radar chart from actual data
    const generateRadarData = () => {
        if (!data.optimalTimes) return [];

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return data.optimalTimes.analysis.bestDays.map(day => ({
            day: dayNames[day.dayOfWeek],
            engagement: day.averageEngagement * 100,
            posts: day.postCount,
        }));
    };

    // Generate hourly performance data from actual data
    const generateHourlyData = () => {
        if (!data.optimalTimes) return [];

        return data.optimalTimes.analysis.bestHours.map(hour => ({
            hour: `${hour.hour.toString().padStart(2, '0')}:00`,
            engagement: hour.averageEngagement * 100,
            posts: hour.postCount,
        }));
    };

    // Calculate next recommended posting times from actual analysis
    const getNextRecommendedTimes = () => {
        if (!data.optimalTimes) return [];

        const now = new Date();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const recommendations = [];

        for (let i = 0; i < 7; i++) {
            const targetDate = new Date(now);
            targetDate.setDate(now.getDate() + i);
            const dayOfWeek = targetDate.getDay();

            const dayRecommendations = data.optimalTimes.recommendations
                .filter(rec => rec.dayOfWeek === dayOfWeek)
                .sort((a, b) => b.engagementScore - a.engagementScore)
                .slice(0, 3);

            if (dayRecommendations.length > 0) {
                recommendations.push({
                    date: targetDate,
                    dayName: dayNames[dayOfWeek],
                    times: dayRecommendations,
                });
            }
        }

        return recommendations.slice(0, 5);
    };

    const heatmapData = generateHeatmapData();
    const radarData = generateRadarData();
    const hourlyData = generateHourlyData();
    const nextRecommendations = getNextRecommendedTimes();

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center space-y-4">
                        <LoadingSpinner size="lg" />
                        <p className="text-gray-600 dark:text-gray-400">Analyzing optimal posting times...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <ErrorMessage
                    error={new Error(error)}
                    onRetry={handleRetry}
                    title="Failed to load optimal times"
                />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Optimal Posting Times</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        AI-powered recommendations based on {data.posts.length} posts analyzed
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Platform Filter */}
                    <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Platforms</option>
                        {data.profiles.map(profile => (
                            <option key={profile.service} value={profile.service}>
                                {profile.service.charAt(0).toUpperCase() + profile.service.slice(1)}
                            </option>
                        ))}
                    </select>

                    {/* Refresh Analysis Button */}
                    <button
                        onClick={loadOptimalTimesData}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Zap className="w-4 h-4" />
                        <span>Refresh Analysis</span>
                    </button>
                </div>
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Best Overall Day</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {data.optimalTimes?.analysis.bestDays[0]?.dayName || 'Monday'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {((data.optimalTimes?.analysis.bestDays[0]?.averageEngagement || 0) * 100).toFixed(1)}% avg engagement
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg">
                            <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Best Overall Time</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {data.optimalTimes?.analysis.bestHours[0]?.hour.toString().padStart(2, '0') || '14'}:00
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {((data.optimalTimes?.analysis.bestHours[0]?.averageEngagement || 0) * 100).toFixed(1)}% avg engagement
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Analysis Confidence</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {((data.optimalTimes?.confidence || 0) * 100).toFixed(0)}%
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Based on {data.posts.length} posts analyzed
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
                            <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Next Recommended Times */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Next Recommended Posting Times
                    </h3>
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                </div>

                {nextRecommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {nextRecommendations.map((rec, index) => (
                            <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            {rec.dayName}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {rec.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </div>

                                <div className="space-y-2">
                                    {rec.times.slice(0, 2).map((time, timeIndex) => (
                                        <div key={timeIndex} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {time.hour.toString().padStart(2, '0')}:00
                      </span>
                                            <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {(time.engagementScore * 100).toFixed(1)}%
                        </span>
                                                <div className={`w-2 h-2 rounded-full ${
                                                    time.confidence > 0.8 ? 'bg-green-500' :
                                                        time.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No recommendations available. Try analyzing more posts or adjusting filters.
                    </div>
                )}
            </Card>

            {/* Performance by Day & Hour Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Best Days Radar Chart */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Performance by Day of Week
                    </h3>
                    {radarData.length > 0 ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis
                                        dataKey="day"
                                        tick={{ fontSize: 12, fill: 'currentColor' }}
                                        className="text-gray-600 dark:text-gray-400"
                                    />
                                    <PolarRadiusAxis
                                        angle={90}
                                        domain={[0, 'dataMax']}
                                        tick={{ fontSize: 10, fill: 'currentColor' }}
                                        className="text-gray-600 dark:text-gray-400"
                                    />
                                    <Radar
                                        name="Engagement"
                                        dataKey="engagement"
                                        stroke="#3B82F6"
                                        fill="#3B82F6"
                                        fillOpacity={0.1}
                                        strokeWidth={2}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '6px',
                                        }}
                                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Engagement Rate']}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                            No day-of-week data available for analysis
                        </div>
                    )}
                </Card>

                {/* Best Hours Bar Chart */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Performance by Hour of Day
                    </h3>
                    {hourlyData.length > 0 ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyData}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis
                                        dataKey="hour"
                                        tick={{ fontSize: 10, fill: 'currentColor' }}
                                        className="text-gray-600 dark:text-gray-400"
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12, fill: 'currentColor' }}
                                        className="text-gray-600 dark:text-gray-400"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '6px',
                                        }}
                                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Engagement Rate']}
                                    />
                                    <Bar
                                        dataKey="engagement"
                                        fill="#10B981"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                            No hourly data available for analysis
                        </div>
                    )}
                </Card>
            </div>

            {/* Time Heatmap */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Engagement Heatmap
                    </h3>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>Low</span>
                            <div className="flex space-x-1">
                                <div className="w-3 h-3 bg-blue-100 rounded"></div>
                                <div className="w-3 h-3 bg-blue-300 rounded"></div>
                                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                <div className="w-3 h-3 bg-blue-700 rounded"></div>
                            </div>
                            <span>High</span>
                        </div>
                    </div>
                </div>

                {/* Custom Heatmap Grid */}
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        <div className="grid grid-cols-25 gap-1 mb-4">
                            <div className="text-xs text-gray-600 dark:text-gray-400"></div>
                            {Array.from({ length: 24 }, (_, i) => (
                                <div key={i} className="text-xs text-center text-gray-600 dark:text-gray-400">
                                    {i.toString().padStart(2, '0')}
                                </div>
                            ))}
                        </div>

                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, dayIndex) => (
                            <div key={day} className="grid grid-cols-25 gap-1 mb-1">
                                <div className="text-xs text-gray-600 dark:text-gray-400 py-2">
                                    {day.slice(0, 3)}
                                </div>
                                {Array.from({ length: 24 }, (_, hour) => {
                                    const cellData = heatmapData.find((item: any) =>
                                        item.day === day && item.hour === `${hour.toString().padStart(2, '0')}:00`
                                    );
                                    const intensity = cellData?.score || 0;
                                    const postCount = cellData?.postCount || 0;
                                    const bgColor = intensity > 6 ? 'bg-blue-700' :
                                        intensity > 3 ? 'bg-blue-500' :
                                            intensity > 1 ? 'bg-blue-300' : 'bg-blue-100';

                                    return (
                                        <div
                                            key={hour}
                                            className={`w-6 h-6 rounded ${bgColor} hover:scale-110 transition-transform cursor-pointer`}
                                            title={`${day} ${hour}:00 - ${intensity.toFixed(1)}% engagement (${postCount} posts)`}
                                        ></div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Detailed Recommendations */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Detailed Recommendations
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Top Time Slots */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                            Top Time Slots
                        </h4>
                        {data && (data.optimalTimes?.recommendations??[]).slice(0, 5).length > 0 ? (
                            <div className="space-y-3">
                                {data.optimalTimes?.recommendations.slice(0, 5).map((rec, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {index + 1}
                        </span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][rec.dayOfWeek]} at {rec.hour.toString().padStart(2, '0')}:00
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {rec.sampleSize} posts analyzed
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {(rec.engagementScore * 100).toFixed(1)}%
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {(rec.confidence * 100).toFixed(0)}% confidence
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No time slot recommendations available
                            </div>
                        )}
                    </div>

                    {/* Insights & Tips */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                            Insights & Tips
                        </h4>
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                                <div className="flex items-start space-x-3">
                                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div>
                                        <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                                            Peak Engagement Windows
                                        </h5>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Your audience shows highest engagement between{' '}
                                            {data.optimalTimes?.analysis.bestHours.slice(0, 2).map(h =>
                                                `${h.hour.toString().padStart(2, '0')}:00`
                                            ).join(' and ')} {' '}
                                            on {data.optimalTimes?.analysis.bestDays[0]?.dayName || 'weekdays'}.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                                <div className="flex items-start space-x-3">
                                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                                    <div>
                                        <h5 className="font-medium text-green-900 dark:text-green-100 mb-1">
                                            Data Quality
                                        </h5>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            Analysis confidence: {((data.optimalTimes?.confidence || 0) * 100).toFixed(0)}%.
                                            Based on {data.posts.length} posts. More data will improve recommendation accuracy.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                <div className="flex items-start space-x-3">
                                    <Settings className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                    <div>
                                        <h5 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                                            Platform-Specific Timing
                                        </h5>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                            Use the platform filter to see timing recommendations specific to each social network.
                                            Each platform has different peak engagement patterns.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}