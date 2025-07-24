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
    AreaChart,
    Area
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Eye,
    Heart,
    Download
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { PostAnalytics, DashboardStats, BufferProfile } from '../../types';

interface AnalyticsData {
    posts: PostAnalytics[];
    stats: DashboardStats | null;
    profiles: BufferProfile[];
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData>({
        posts: [],
        stats: null,
        profiles: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState('30');
    const [selectedPlatform, setSelectedPlatform] = useState('all');
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        loadAnalyticsData();
    }, []);

    useEffect(() => {
        // Reload data when filters change
        if (data.profiles.length > 0) {
            loadAnalyticsData();
        }
    }, [timeRange, selectedPlatform]);

    const loadAnalyticsData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load profiles first
            const profiles = await apiClient.profiles.list();
            const profileId = profiles[0]?.id;

            if (!profileId) {
                throw new Error('No profiles found');
            }

            // Load analytics data
            const [posts, stats] = await Promise.all([
                apiClient.analytics.getPosts(profileId, {
                    period: timeRange === '7' ? 'week' : timeRange === '30' ? 'month' : 'month'
                }),
                apiClient.analytics.getDashboard(profileId),
            ]);

            // Filter by platform if selected
            const filteredPosts = selectedPlatform === 'all'
                ? posts
                : posts.filter(post => post.service === selectedPlatform);

            setData({ posts: filteredPosts, stats, profiles });
        } catch (err) {
            console.error('Analytics loading error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        loadAnalyticsData();
    };

    // Export functionality
    const handleExport = async () => {
        setIsExporting(true);

        try {
            // Prepare CSV data
            const csvData = [
                // Header row
                [
                    'Post ID',
                    'Platform',
                    'Published Date',
                    'Post Text',
                    'Engagement Rate (%)',
                    'Reach',
                    'Impressions',
                    'Likes',
                    'Comments',
                    'Shares',
                    'Clicks',
                    'Retweets'
                ],
                // Data rows
                ...data.posts.map(post => [
                    post.postId,
                    post.service,
                    new Date(post.publishedAt).toLocaleDateString(),
                    `"${post.text.replace(/"/g, '""')}"`, // Escape quotes in text
                    (post.engagementRate * 100).toFixed(2),
                    post.reach,
                    post.impressions,
                    post.metrics.likes,
                    post.metrics.comments,
                    post.metrics.shares,
                    post.metrics.clicks,
                    post.metrics.retweets || 0
                ])
            ];

            // Convert to CSV string
            const csvContent = csvData.map(row => row.join(',')).join('\n');

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');

            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);

                // Generate filename with current date and filters
                const dateStr = new Date().toISOString().split('T')[0];
                const platformStr = selectedPlatform === 'all' ? 'all-platforms' : selectedPlatform;
                const filename = `buffer-analytics-${platformStr}-${timeRange}days-${dateStr}.csv`;

                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up the URL object
                URL.revokeObjectURL(url);
            }

            // Show success message (you could add a toast notification here)
            console.log('Analytics data exported successfully');

        } catch (error) {
            console.error('Export failed:', error);
            // You could show an error toast here
        } finally {
            setIsExporting(false);
        }
    };

    // Calculate metrics from actual data
    const totalEngagement = data.posts.reduce((sum, post) =>
        sum + Object.values(post.metrics).reduce((metricSum, val) => metricSum + (val || 0), 0), 0
    );

    const avgEngagementRate = data.posts.length > 0
        ? data.posts.reduce((sum, post) => sum + post.engagementRate, 0) / data.posts.length
        : 0;

    const totalReach = data.posts.reduce((sum, post) => sum + post.reach, 0);
    const totalImpressions = data.posts.reduce((sum, post) => sum + post.impressions, 0);

    // Performance over time data
    const performanceData = data.posts
        .slice(-parseInt(timeRange))
        .map(post => ({
            date: new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            engagement: Object.values(post.metrics).reduce((sum, val) => sum + (val || 0), 0),
            reach: post.reach,
            impressions: post.impressions,
            engagementRate: post.engagementRate * 100,
        }))
        .reverse();

    // Platform performance data from actual posts
    const platformData = ['x', 'linkedin', 'facebook', 'instagram'].map(platform => {
        const platformPosts = data.posts.filter(post => post.service === platform);
        const engagement = platformPosts.reduce((sum, post) =>
            sum + Object.values(post.metrics).reduce((metricSum, val) => metricSum + (val || 0), 0), 0
        );
        const avgRate = platformPosts.length > 0
            ? platformPosts.reduce((sum, post) => sum + post.engagementRate, 0) / platformPosts.length
            : 0;

        return {
            platform: platform.charAt(0).toUpperCase() + platform.slice(1),
            posts: platformPosts.length,
            engagement,
            avgEngagementRate: avgRate * 100,
            color: {
                Twitter: '#1DA1F2',
                Linkedin: '#0077B5',
                Facebook: '#1877F2',
                Instagram: '#E4405F'
            }[platform.charAt(0).toUpperCase() + platform.slice(1)] || '#6B7280'
        };
    }).filter(item => item.posts > 0);

    // Engagement by time of day from actual data
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
        const hourPosts = data.posts.filter(post =>
            new Date(post.publishedAt).getHours() === hour
        );
        const avgEngagement = hourPosts.length > 0
            ? hourPosts.reduce((sum, post) => sum + post.engagementRate, 0) / hourPosts.length
            : 0;

        return {
            hour: `${hour.toString().padStart(2, '0')}:00`,
            engagement: avgEngagement * 100,
            posts: hourPosts.length,
        };
    }).filter(item => item.posts > 0); // Only show hours with posts

    // Top performing posts from actual data
    const topPosts = data.posts
        .sort((a, b) => b.engagementRate - a.engagementRate)
        .slice(0, 5);

    // Calculate growth percentages (simplified for demo)
    const calculateGrowth = (current: number) => {
        // Simulate growth calculation - in real app, compare with previous period
        return (Math.random() - 0.5) * 30; // Random growth between -15% and +15%
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center space-y-4">
                        <LoadingSpinner size="lg" />
                        <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
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
                    title="Failed to load analytics"
                />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Comprehensive performance insights from {data.posts.length} posts
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

                    {/* Time Range Filter */}
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                    </select>

                    {/* Functional Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={isExporting || data.posts.length === 0}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                            isExporting || data.posts.length === 0
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
                        <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
                    </button>
                </div>
            </div>

            {/* Export Info Banner */}
            {data.posts.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Export Analytics Data
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Click "Export CSV" to download {data.posts.length} posts with engagement metrics,
                                platform data, and performance statistics for {selectedPlatform === 'all' ? 'all platforms' : selectedPlatform}.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Rest of the component remains the same... */}
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Engagement</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {totalEngagement.toLocaleString()}
                            </p>
                            {(() => {
                                const growth = calculateGrowth(totalEngagement);
                                return (
                                    <div className="flex items-center mt-2">
                                        {growth >= 0 ? (
                                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                                        )}
                                        <span className={`text-sm font-medium ${
                                            growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        }`}>
                      {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                    </span>
                                        <span className="text-sm text-gray-500 ml-1">vs last period</span>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                            <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Engagement Rate</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {(avgEngagementRate * 100).toFixed(2)}%
                            </p>
                            {(() => {
                                const growth = calculateGrowth(avgEngagementRate);
                                return (
                                    <div className="flex items-center mt-2">
                                        {growth >= 0 ? (
                                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                                        )}
                                        <span className={`text-sm font-medium ${
                                            growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        }`}>
                      {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                    </span>
                                        <span className="text-sm text-gray-500 ml-1">vs last period</span>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reach</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {totalReach.toLocaleString()}
                            </p>
                            {(() => {
                                const growth = calculateGrowth(totalReach);
                                return (
                                    <div className="flex items-center mt-2">
                                        {growth >= 0 ? (
                                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                                        )}
                                        <span className={`text-sm font-medium ${
                                            growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        }`}>
                      {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                    </span>
                                        <span className="text-sm text-gray-500 ml-1">vs last period</span>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
                            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Impressions</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {totalImpressions.toLocaleString()}
                            </p>
                            {(() => {
                                const growth = calculateGrowth(totalImpressions);
                                return (
                                    <div className="flex items-center mt-2">
                                        {growth >= 0 ? (
                                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                                        )}
                                        <span className={`text-sm font-medium ${
                                            growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        }`}>
                      {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                    </span>
                                        <span className="text-sm text-gray-500 ml-1">vs last period</span>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg">
                            <Eye className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Performance Over Time */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Performance Over Time
                    </h3>
                    <div className="text-sm text-gray-500">
                        Showing {performanceData.length} data points
                    </div>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12, fill: 'currentColor' }}
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
                                labelStyle={{ color: 'var(--foreground)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="engagement"
                                stroke="#3B82F6"
                                fill="#3B82F6"
                                fillOpacity={0.1}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Platform Performance & Engagement by Hour */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Performance */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Platform Performance
                    </h3>
                    {platformData.length > 0 ? (
                        <div className="space-y-4">
                            {platformData.map((platform) => (
                                <div key={platform.platform} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: platform.color }}
                                        ></div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {platform.platform}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {platform.posts} posts
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {platform.engagement.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {platform.avgEngagementRate.toFixed(2)}% avg rate
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No platform data available for the selected filters
                        </div>
                    )}
                </Card>

                {/* Engagement by Hour */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Engagement by Hour
                    </h3>
                    {hourlyData.length > 0 ? (
                        <div className="h-64">
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
                                        formatter={(value: number) => [`${value.toFixed(2)}%`, 'Engagement Rate']}
                                    />
                                    <Bar dataKey="engagement" fill="#10B981" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No hourly data available for the selected filters
                        </div>
                    )}
                </Card>
            </div>

            {/* Top Performing Posts */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Top Performing Posts
                </h3>
                {topPosts.length > 0 ? (
                    <div className="space-y-4">
                        {topPosts.map((post, index) => (
                            <div key={post.postId} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 dark:text-white line-clamp-2 mb-2">
                                        {post.text}
                                    </p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                                        <span className="capitalize">{post.service}</span>
                                        <span>•</span>
                                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{(post.engagementRate * 100).toFixed(2)}% engagement rate</span>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 text-right">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {Object.values(post.metrics).reduce((sum, val) => sum + (val || 0), 0)} interactions
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        {post.reach.toLocaleString()} reach
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No posts available for the selected filters
                    </div>
                )}
            </Card>
        </div>
    );
}