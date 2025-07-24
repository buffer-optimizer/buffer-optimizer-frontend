export interface BufferProfile {
    id: string;
    service: 'x' | 'linkedin' | 'facebook' | 'instagram'; // Changed from 'twitter' to 'x'
    service_username: string;
    service_id: string;
    formatted_username: string;
    avatar: string;
    timezone: string;
    schedules: Array<{
        days: string[];
        times: string[];
    }>;
    default: boolean;
}

export interface PluginExecutionContext {
    profileId?: string;
    timeRange?: {
        start?: string;
        end?: string;
    };
    config?: Record<string, any>;
    apiClient: any; // Will be typed as BufferClient when imported
    userId?: string;
    metadata?: Record<string, any>;
}

export interface PluginConfig {
    requiresAuth: boolean;
    configSchema: Record<string, {
        type: 'string' | 'number' | 'boolean' | 'array' | 'object';
        label: string;
        description: string;
        required: boolean;
        default?: any;
        options?: any[];
    }>;
    defaultConfig: Record<string, any>;
}

export interface Plugin {
    // Plugin Metadata
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    category: 'analytics' | 'optimization' | 'content' | 'scheduling' | 'reporting';
    enabled: boolean;

    // Configuration
    config: PluginConfig;

    // Plugin Lifecycle Methods
    initialize(context: PluginExecutionContext): Promise<void>;
    execute(context: PluginExecutionContext): Promise<any>;
    validate?(context: PluginExecutionContext): Promise<boolean>;
    cleanup?(): Promise<void>;
}

export interface PostAnalytics {
    postId: string;
    profileId: string;
    service: 'x' | 'linkedin' | 'facebook' | 'instagram'; // Changed from 'twitter' to 'x'
    publishedAt: string;
    text: string;
    metrics: {
        likes: number;
        comments: number;
        shares: number;
        clicks: number;
        retweets?: number;
        reactions?: number;
        saves?: number;
    };
    engagementRate: number;
    reach: number;
    impressions: number;
}

export interface DashboardStats {
    totalPosts: number;
    averageEngagementRate: number;
    bestPerformingPlatform: 'x' | 'linkedin' | 'facebook' | 'instagram'; // Changed from 'twitter' to 'x'
    recommendedPostTime: string;
    weekOverWeekGrowth: number;
    topPerformingPost: {
        id: string;
        text: string;
        engagementRate: number;
    };
}

export interface OptimalTimingAnalysis {
    profileId: string;
    service: 'x' | 'linkedin' | 'facebook' | 'instagram'; // Changed from 'twitter' to 'x'
    recommendations: Array<{
        dayOfWeek: number;
        hour: number;
        engagementScore: number;
        confidence: number;
        sampleSize: number;
    }>;
    analysis: {
        bestDays: Array<{
            dayOfWeek: number;
            dayName: string;
            averageEngagement: number;
            postCount: number;
            rank: number;
        }>;
        bestHours: Array<{
            hour: number;
            averageEngagement: number;
            postCount: number;
            rank: number;
        }>;
    };
    confidence: number;
    lastUpdated: string;
}

