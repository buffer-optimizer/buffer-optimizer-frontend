'use client';

import { useState, useEffect } from 'react';
import { DashboardStats } from './dashboard-stats';
import { EngagementChart } from './engagement-chart';
import { OptimalTimesHeatmap } from './optimal-times-heatmap';
import { PlatformBreakdown } from './platform-breakdown';
import { RecentPosts } from './recent-posts';
import { PluginStatus } from './plugin-status';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ErrorMessage } from '../ui/error-message';
import { apiClient } from '@/lib/api-client';

// Import shared types
import type {
    BufferProfile,
    DashboardStats as DashboardStatsType,
    PostAnalytics,
    OptimalTimingAnalysis,
    Plugin
} from '@/types';

interface DashboardData {
    profiles: BufferProfile[];
    dashboardData: DashboardStatsType | null;
    analyticsData: PostAnalytics[];
    optimalTimes: OptimalTimingAnalysis | null;
    plugins: Plugin[] | any;
}

export function Dashboard() {
    const [data, setData] = useState<DashboardData>({
        profiles: [],
        dashboardData: null,
        analyticsData: [],
        optimalTimes: null,
        plugins: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load profiles first
            const profiles = await apiClient.profiles.list();
            const profileId = profiles[0]?.id;

            if (!profileId) {
                throw new Error('No profiles found');
            }

            // Load all dashboard data in parallel
            const [dashboardData, analyticsData, optimalTimes, plugins] = await Promise.all([
                apiClient.analytics.getDashboard(profileId),
                apiClient.analytics.getPosts(profileId),
                apiClient.analytics.getOptimalTimes(profileId),
                apiClient.plugins.list(),
            ]);

            setData({
                profiles,
                dashboardData,
                analyticsData,
                optimalTimes,
                plugins,
            });
        } catch (err) {
            console.error('Dashboard loading error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        loadDashboardData();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
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
                    title="Failed to load dashboard"
                />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Dashboard Stats */}
            {data.dashboardData && <DashboardStats data={data.dashboardData} />}

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {data.analyticsData.length > 0 && <EngagementChart data={data.analyticsData} />}
                </div>
                <div>
                    {data.optimalTimes && <OptimalTimesHeatmap data={data.optimalTimes} />}
                </div>
            </div>

            {/* Secondary Charts and Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.dashboardData && <PlatformBreakdown data={data.dashboardData} />}
                {data.analyticsData.length > 0 && (
                    <RecentPosts data={data.analyticsData.slice(0, 5)} />
                )}
            </div>

            {/* Plugin Status */}
            {data.plugins.length > 0 && <PluginStatus plugins={data.plugins} />}
        </div>
    );
}