interface BufferProfile {
    id: string;
    service: 'x' | 'linkedin' | 'facebook' | 'instagram';
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

interface PostAnalytics {
    postId: string;
    profileId: string;
    service: 'x' | 'linkedin' | 'facebook' | 'instagram';
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

interface OptimalTimingAnalysis {
    profileId: string;
    service: 'x' | 'linkedin' | 'facebook' | 'instagram';
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

interface Plugin {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    status: string;
    category: 'analytics' | 'optimization' | 'content' | 'scheduling' | 'reporting';
    enabled: boolean;
    lastExecuted?: string;
    permissions: string[];
    downloads?: number;
    rating?: number;
}

class APIClient {
    private baseURL: string;

    constructor() {
        this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    }

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer demo_token',
                    ...options?.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            // For demo purposes, return mock data if API is not available
            console.warn('API not available, using mock data:', error);
            return this.getMockData(endpoint) as T;
        }
    }

    private getMockData(endpoint: string): any {
        if (endpoint.includes('/profiles')) {
            return this.generateMockProfiles();
        }

        if (endpoint.includes('/dashboard/')) {
            return this.generateMockDashboardStats();
        }

        if (endpoint.includes('/posts/')) {
            return this.generateMockAnalytics();
        }

        if (endpoint.includes('/optimal-times/')) {
            return this.generateMockOptimalTimes();
        }

        if (endpoint.includes('/plugins')) {
            return this.generateMockPlugins();
        }

        return [];
    }

    private generateMockProfiles(): BufferProfile[] {
        return [
            {
                id: 'profile_x_001',
                service: 'x',
                service_username: 'bufferoptimizer',
                service_id: '1234567890',
                formatted_username: '@bufferoptimizer',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                timezone: 'America/Los_Angeles',
                schedules: [
                    {
                        days: ['mon', 'tue', 'wed', 'thu', 'fri'],
                        times: ['09:00', '13:00', '17:00', '20:00'],
                    },
                    {
                        days: ['sat', 'sun'],
                        times: ['11:00', '15:00'],
                    },
                ],
                default: true,
            },
            {
                id: 'profile_linkedin_002',
                service: 'linkedin',
                service_username: 'buffer-content-optimizer',
                service_id: '0987654321',
                formatted_username: 'Buffer Content Optimizer',
                avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
                timezone: 'America/Los_Angeles',
                schedules: [
                    {
                        days: ['mon', 'tue', 'wed', 'thu', 'fri'],
                        times: ['08:00', '12:00', '16:00'],
                    },
                ],
                default: false,
            },
            {
                id: 'profile_facebook_003',
                service: 'facebook',
                service_username: 'BufferContentOptimizer',
                service_id: '1122334455',
                formatted_username: 'Buffer Content Optimizer',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                timezone: 'America/Los_Angeles',
                schedules: [
                    {
                        days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
                        times: ['10:00', '14:00', '19:00'],
                    },
                ],
                default: false,
            },
            {
                id: 'profile_instagram_004',
                service: 'instagram',
                service_username: 'buffer.optimizer',
                service_id: '5566778899',
                formatted_username: '@buffer.optimizer',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face',
                timezone: 'America/Los_Angeles',
                schedules: [
                    {
                        days: ['mon', 'wed', 'fri'],
                        times: ['12:00', '17:00'],
                    },
                    {
                        days: ['sat', 'sun'],
                        times: ['10:00', '14:00', '18:00'],
                    },
                ],
                default: false,
            },
        ];
    }

    private generateMockAnalytics(): PostAnalytics[] {
        const analytics: PostAnalytics[] = [];
        const platforms = ['x', 'linkedin', 'facebook', 'instagram'] as const;
        const totalPosts = 120; // 30 posts per platform

        for (let i = 0; i < totalPosts; i++) {
            // Rotate through platforms to get diverse data
            const platformIndex = i % platforms.length;
            const platform = platforms[platformIndex];
            const postIndex = Math.floor(i / platforms.length);

            // Get platform-specific profile ID
            const profileId = this.getProfileIdForPlatform(platform);

            // Generate platform-specific content
            const content = this.generatePlatformContent(platform, postIndex);

            // Get platform-specific engagement rates and metrics
            const baseEngagement = this.getBaseEngagementForPlatform(platform);
            const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
            const engagementRate = Math.max(0.01, baseEngagement + variation);

            // Platform-specific reach and impressions
            const reach = this.getPlatformReach(platform);
            const impressions = Math.floor(reach * this.getPlatformImpressionMultiplier(platform));

            analytics.push({
                postId: `post_${platform}_${postIndex}`,
                profileId,
                service: platform,
                publishedAt: new Date(Date.now() - (i * 6 * 60 * 60 * 1000)).toISOString(), // Every 6 hours
                text: content,
                metrics: this.generatePlatformMetrics(platform, engagementRate, reach),
                engagementRate,
                reach,
                impressions,
            });
        }

        return analytics.reverse(); // Most recent first
    }

// Helper function to get profile ID for each platform
    private getProfileIdForPlatform(platform: 'x' | 'linkedin' | 'facebook' | 'instagram'): string {
        const profileMap = {
            x: 'profile_x_001',
            linkedin: 'profile_linkedin_002',
            facebook: 'profile_facebook_003',
            instagram: 'profile_instagram_004',
        };
        return profileMap[platform];
    }

// Platform-specific engagement rates based on industry averages
    private getBaseEngagementForPlatform(platform: 'x' | 'linkedin' | 'facebook' | 'instagram'): number {
        const baseRates = {
            x: 0.045,           // 4.5% average
            linkedin: 0.054,    // 5.4% average (higher for B2B)
            facebook: 0.063,    // 6.3% average
            instagram: 0.071,   // 7.1% average (highest visual engagement)
        };
        return baseRates[platform];
    }

// Platform-specific reach ranges
    private getPlatformReach(platform: 'x' | 'linkedin' | 'facebook' | 'instagram'): number {
        const reachRanges = {
            x: { min: 800, max: 8000 },        // Fast-moving, varied reach
            linkedin: { min: 500, max: 3000 }, // Professional network, smaller but targeted
            facebook: { min: 1200, max: 12000 }, // Largest potential reach
            instagram: { min: 600, max: 6000 }, // Visual content, good engagement
        };

        const range = reachRanges[platform];
        return Math.floor(Math.random() * (range.max - range.min) + range.min);
    }

// Platform-specific impression multipliers
    private getPlatformImpressionMultiplier(platform: 'x' | 'linkedin' | 'facebook' | 'instagram'): number {
        const multipliers = {
            x: 1.8,        // High impression rate due to timeline algorithm
            linkedin: 1.4,  // Lower but more targeted impressions
            facebook: 2.2,  // Highest impression rate
            instagram: 1.6, // Good impression rate for visual content
        };
        return multipliers[platform] + (Math.random() * 0.4); // Add some variation
    }

// Generate platform-specific content
    private generatePlatformContent(platform: 'x' | 'linkedin' | 'facebook' | 'instagram', index: number): string {
        const contentTemplates = {
            x: [
                `🚀 Exciting updates coming to our platform! What feature would you like to see next? #innovation #tech #startup`,
                `📊 Data shows that engaged teams are 3x more productive. How do you keep your team motivated? #productivity #leadership`,
                `💡 Pro tip: Schedule your social media posts during peak engagement hours for maximum reach! #socialmedia #marketing`,
                `🔥 Just launched our new analytics dashboard! The insights are incredible. Check it out 👇 #analytics #data`,
                `🎯 Focus on quality over quantity when it comes to content creation. What's your content strategy? #contentmarketing`,
                `⚡ Quick thread on why timing matters for social media success... 1/5 #thread #socialmedia`,
                `🌟 Celebrating our community of amazing creators! Thank you for inspiring us every day #community #grateful`,
                `📈 The future of social media is data-driven. Are you leveraging analytics to optimize your content? #datadriven #socialmedia`,
            ],
            linkedin: [
                `Thrilled to share insights from our latest industry report. Key findings that every professional should know about the future of social media marketing.`,
                `Leadership isn't about having all the answers—it's about asking the right questions and empowering your team to find innovative solutions.`,
                `The future of work is hybrid, and companies that adapt quickly will thrive. How is your organization preparing for this transformation?`,
                `Data-driven decision making has revolutionized our business operations. Here's how we leverage analytics to drive sustainable growth and innovation.`,
                `Excited to announce our strategic partnership with industry leaders. Together, we're building the next generation of social media tools.`,
                `Reflecting on lessons learned from scaling a startup: the importance of building strong company culture from day one.`,
                `Industry insight: The most successful social media campaigns combine authentic storytelling with strategic data analysis.`,
                `What I've learned about effective team management: Trust your people, provide clear goals, and get out of their way.`,
            ],
            facebook: [
                `We're so grateful for our amazing community! 🙏 Thank you for your continued support and feedback. Your input helps us build better tools every day.`,
                `Behind the scenes look at our team working hard to bring you the best social media optimization features. The dedication is incredible! 💪`,
                `What's your favorite way to stay productive while working from home? Share your tips below – we love learning from our community! 🏠`,
                `Celebrating another milestone! 🎉 Thanks to everyone who's been part of this incredible journey. Here's to many more achievements together.`,
                `Weekend inspiration: "The best time to plant a tree was 20 years ago. The second best time is now." What are you planting today? 🌱`,
                `Sharing some love for our incredible users who've built amazing businesses using our platform. Your success stories motivate us every day! ❤️`,
                `Fun fact Friday: Did you know that posts with images get 2.3x more engagement? Visual content is key to social media success! 📸`,
                `Community question: What's the biggest challenge you face with social media management? Let's help each other out! 💬`,
            ],
            instagram: [
                `✨ Creating magic one post at a time. What inspires your content creation journey? Drop a comment below! #contentcreator #inspiration`,
                `🌟 Monday motivation: Your only limit is your mind. Dream big, work hard, and make it happen! #mondaymotivation #dreambig #hustle`,
                `📷 Captured this amazing moment during our team retreat last week. Nothing beats good vibes and great people! #teamretreat #goodvibes`,
                `🎨 Design is not just what it looks like—design is how it works. Function meets beauty in everything we create. #designthinking #ux`,
                `🚀 Innovation happens when creativity meets technology. What's your next big idea? Share it with us! #innovation #creativity #tech`,
                `🌈 Colors, creativity, and community – that's what makes social media so powerful. What's your favorite platform? #socialmedia #community`,
                `💫 Behind every great post is a story worth telling. What story are you sharing with the world today? #storytelling #authentic`,
                `🎯 Focus mode: When you're passionate about what you do, work doesn't feel like work. What are you passionate about? #passion #focus`,
            ],
        };

        const templates = contentTemplates[platform];
        return templates[index % templates.length];
    }

// Generate platform-specific metrics
    private generatePlatformMetrics(
        platform: 'x' | 'linkedin' | 'facebook' | 'instagram',
        engagementRate: number,
        reach: number
    ) {
        const totalEngagement = Math.floor(reach * engagementRate);

        // Platform-specific metric distributions
        const distributions = {
            x: {
                likes: 0.6,
                retweets: 0.15,
                comments: 0.15,
                clicks: 0.1
            },
            linkedin: {
                likes: 0.5,
                comments: 0.25,
                shares: 0.15,
                clicks: 0.1
            },
            facebook: {
                likes: 0.55,
                comments: 0.2,
                shares: 0.15,
                clicks: 0.1
            },
            instagram: {
                likes: 0.75,
                comments: 0.15,
                saves: 0.08,
                clicks: 0.02
            }
        };

        const dist: any = distributions[platform];

        const metrics: any = {
            likes: Math.floor(totalEngagement * dist.likes),
            comments: Math.floor(totalEngagement * (dist.comments || 0)),
            shares: Math.floor(totalEngagement * (dist.shares || 0)),
            clicks: Math.floor(totalEngagement * (dist.clicks || 0)),
        };

        // Add platform-specific metrics
        if (platform === 'x') {
            metrics.retweets = Math.floor(totalEngagement * (dist.retweets || 0));
        }

        if (platform === 'instagram') {
            metrics.saves = Math.floor(totalEngagement * (dist.saves || 0));
        }

        if (platform === 'facebook') {
            metrics.reactions = metrics.likes; // Facebook uses reactions
        }

        return metrics;
    }

    private generateMockDashboardStats(): DashboardStats {
        return {
            totalPosts: 150,
            averageEngagementRate: 0.045,
            bestPerformingPlatform: 'x',
            recommendedPostTime: '14:00',
            weekOverWeekGrowth: 12.5,
            topPerformingPost: {
                id: 'post_0',
                text: 'Our best performing post about social media optimization!',
                engagementRate: 0.085,
            },
        };
    }

    private generateMockOptimalTimes(): OptimalTimingAnalysis {
        return {
            profileId: 'profile_x_001',
            service: 'x',
            recommendations: [
                { dayOfWeek: 1, hour: 9, engagementScore: 0.08, confidence: 0.85, sampleSize: 45 },
                { dayOfWeek: 1, hour: 14, engagementScore: 0.075, confidence: 0.82, sampleSize: 38 },
                { dayOfWeek: 2, hour: 10, engagementScore: 0.072, confidence: 0.78, sampleSize: 42 },
                { dayOfWeek: 3, hour: 15, engagementScore: 0.069, confidence: 0.81, sampleSize: 36 },
                { dayOfWeek: 4, hour: 11, engagementScore: 0.065, confidence: 0.76, sampleSize: 33 },
            ],
            analysis: {
                bestDays: [
                    { dayOfWeek: 1, dayName: 'Monday', averageEngagement: 0.067, postCount: 83, rank: 1 },
                    { dayOfWeek: 2, dayName: 'Tuesday', averageEngagement: 0.062, postCount: 79, rank: 2 },
                    { dayOfWeek: 3, dayName: 'Wednesday', averageEngagement: 0.058, postCount: 75, rank: 3 },
                    { dayOfWeek: 4, dayName: 'Thursday', averageEngagement: 0.055, postCount: 71, rank: 4 },
                    { dayOfWeek: 5, dayName: 'Friday', averageEngagement: 0.048, postCount: 68, rank: 5 },
                ],
                bestHours: [
                    { hour: 9, averageEngagement: 0.071, postCount: 28, rank: 1 },
                    { hour: 14, averageEngagement: 0.068, postCount: 32, rank: 2 },
                    { hour: 10, averageEngagement: 0.065, postCount: 29, rank: 3 },
                    { hour: 15, averageEngagement: 0.062, postCount: 31, rank: 4 },
                    { hour: 11, averageEngagement: 0.059, postCount: 26, rank: 5 },
                ],
            },
            confidence: 0.8,
            lastUpdated: new Date().toISOString(),
        };
    }

    private generateMockPlugins(): Plugin[] {
        return [
            {
                id: 'optimal-timing',
                name: 'Optimal Timing Analyzer',
                version: '1.2.0',
                description: 'Advanced AI-powered analysis of historical post performance to recommend optimal posting times across all platforms with 90%+ accuracy.',
                author: 'Buffer Optimizer Team',
                category: 'optimization',
                enabled: true,
                lastExecuted: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                status: 'active',
                permissions: ['read:analytics', 'read:posts', 'read:profiles'],
                downloads: 8547,
                rating: 4.8,
            },
            {
                id: 'performance-analytics',
                name: 'Performance Analytics Pro',
                version: '2.1.0',
                description: 'Comprehensive performance analytics with advanced metrics, competitor analysis, and detailed engagement insights across all social platforms.',
                author: 'Buffer Optimizer Team',
                category: 'analytics',
                enabled: true,
                lastExecuted: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
                status: 'active',
                permissions: ['read:analytics', 'read:posts', 'read:profiles', 'read:competitors'],
                downloads: 12043,
                rating: 4.9,
            },
            {
                id: 'content-suggestions',
                name: 'AI Content Suggestions',
                version: '1.5.2',
                description: 'Generate high-performing content ideas using machine learning algorithms trained on millions of successful social media posts.',
                author: 'Buffer Optimizer Team',
                category: 'content',
                enabled: false,
                status: 'inactive',
                permissions: ['read:analytics', 'write:posts', 'read:trends'],
                downloads: 6789,
                rating: 4.6,
            },
            {
                id: 'hashtag-optimizer',
                name: 'Hashtag Optimizer',
                version: '1.3.1',
                description: 'Automatically suggest and optimize hashtags for maximum reach and engagement based on current trends and historical performance.',
                author: 'Social Media Labs',
                category: 'optimization',
                enabled: true,
                lastExecuted: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
                status: 'active',
                permissions: ['read:posts', 'write:posts', 'read:trends'],
                downloads: 9876,
                rating: 4.7,
            },
            {
                id: 'competitor-tracker',
                name: 'Competitor Tracker',
                version: '2.0.0',
                description: 'Monitor competitor performance, track their posting strategies, and get insights on what content works best in your industry.',
                author: 'Analytics Pro Inc',
                category: 'analytics',
                enabled: false,
                status: 'inactive',
                permissions: ['read:competitors', 'read:analytics', 'write:reports'],
                downloads: 5432,
                rating: 4.4,
            },
            {
                id: 'auto-scheduler',
                name: 'Smart Auto Scheduler',
                version: '1.8.0',
                description: 'Intelligent scheduling system that automatically posts your content at optimal times across all platforms with advanced queue management and AI-powered timing optimization.',
                author: 'Automation Solutions',
                category: 'scheduling',
                enabled: true,
                lastExecuted: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
                status: 'active',
                permissions: ['read:posts', 'write:posts', 'read:profiles', 'write:schedule', 'read:analytics'],
                downloads: 11234,
                rating: 4.5,
            },
            {
                id: 'custom-reports',
                name: 'Custom Report Builder',
                version: '2.2.1',
                description: 'Create detailed, customizable reports with advanced data visualization, white-label options, automated delivery to stakeholders, and executive-level insights.',
                author: 'Report Solutions Inc',
                category: 'reporting',
                enabled: true,
                lastExecuted: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
                status: 'active',
                permissions: ['read:analytics', 'read:posts', 'write:reports', 'read:profiles', 'read:export'],
                downloads: 4567,
                rating: 4.6,
            },
            {
                id: 'crisis-monitor',
                name: 'Crisis Monitor',
                version: '1.0.5',
                description: 'Monitor brand mentions and sentiment in real-time, with automated alerts for potential PR issues, reputation management tools, and crisis response workflows.',
                author: 'Brand Safety Solutions',
                category: 'reporting',
                enabled: true,
                lastExecuted: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
                status: 'active',
                permissions: ['read:mentions', 'read:sentiment', 'write:alerts', 'read:social_listening', 'write:notifications'],
                downloads: 2345,
                rating: 4.4,
            }
        ];
    }


    // API methods
    profiles = {
        list: (): Promise<BufferProfile[]> =>
            this.request('/profiles'),

        get: (profileId: string): Promise<BufferProfile> =>
            this.request(`/profiles/${profileId}`),
    };

    analytics = {
        getPosts: (profileId: string, params?: Record<string, string>): Promise<PostAnalytics[]> => {
            const query = params ? `?${new URLSearchParams(params)}` : '';
            return this.request(`/analytics/posts/${profileId}${query}`);
        },

        getSummary: (profileId: string, params?: Record<string, string>): Promise<any> => {
            const query = params ? `?${new URLSearchParams(params)}` : '';
            return this.request(`/analytics/summary/${profileId}${query}`);
        },

        getOptimalTimes: (profileId: string, params?: Record<string, string>): Promise<OptimalTimingAnalysis> => {
            const query = params ? `?${new URLSearchParams(params)}` : '';
            return this.request(`/analytics/optimal-times/${profileId}${query}`);
        },

        getDashboard: (profileId: string, params?: Record<string, string>): Promise<DashboardStats> => {
            const query = params ? `?${new URLSearchParams(params)}` : '';
            return this.request(`/analytics/dashboard/${profileId}${query}`);
        },
    };

    plugins = {
        list: (): Promise<Plugin[]> =>
            this.request('/plugins'),

        get: (pluginId: string): Promise<Plugin> =>
            this.request(`/plugins/${pluginId}`),

        execute: async (pluginId: string, data: any): Promise<any> => {
            // Simulate realistic plugin execution
            await this.simulatePluginExecution(pluginId);
            return this.getPluginExecutionResult(pluginId, data);
        },

        executeAll: async (data: any): Promise<Record<string, any>> => {
            const results: Record<string, any> = {};

            // Execute all plugins sequentially with delays
            for (const pluginId of data.plugins || []) {
                await this.simulatePluginExecution(pluginId);
                results[pluginId] = this.getPluginExecutionResult(pluginId, data);
            }

            return results;
        },

        toggle: async (pluginId: string, enabled: boolean): Promise<void> => {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log(`Plugin ${pluginId} ${enabled ? 'enabled' : 'disabled'}`);
        },
    };

// Add these helper methods to your APIClient class
    private async simulatePluginExecution(pluginId: string): Promise<void> {
        // Simulate processing time based on plugin type
        const executionTimes = {
            'optimal-timing': 3000,
            'performance-analytics': 4000,
            'content-suggestions': 2500,
            'hashtag-optimizer': 2000,
            'competitor-tracker': 5000,
            'auto-scheduler': 3500,
            'engagement-booster': 2800,
            'visual-content-ai': 4500,
            'custom-reports': 6000,
            'trend-detector': 3800,
            'crisis-monitor': 1500,
            'roi-calculator': 4200,
        };

        const delay = executionTimes[pluginId as keyof typeof executionTimes] || 3000;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    private getPluginExecutionResult(pluginId: string, inputData: any): any {
        const pluginResults = {
            'optimal-timing': {
                status: 'completed',
                executionTime: '3.2s',
                data: {
                    recommendations: [
                        { day: 'Monday', time: '14:00', engagementScore: 0.92, confidence: 0.87 },
                        { day: 'Wednesday', time: '10:00', engagementScore: 0.88, confidence: 0.82 },
                        { day: 'Friday', time: '16:00', engagementScore: 0.85, confidence: 0.79 },
                    ],
                    insights: [
                        'Afternoon posts on weekdays show 34% higher engagement',
                        'Avoid posting between 8-9 AM due to low visibility',
                        'Weekend posts perform best between 10-12 PM'
                    ],
                    nextAnalysis: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                }
            },
            'performance-analytics': {
                status: 'completed',
                executionTime: '4.1s',
                data: {
                    metrics: {
                        totalReach: 45230,
                        engagementRate: 0.067,
                        impressions: 89450,
                        clickThroughRate: 0.023,
                        averageEngagementGrowth: 0.12,
                    },
                    trends: {
                        direction: 'up',
                        percentage: 12,
                        description: 'Engagement up 12% from last month'
                    },
                    topPerformingPosts: 5,
                    reportGenerated: true,
                }
            },
            'content-suggestions': {
                status: 'completed',
                executionTime: '2.8s',
                data: {
                    suggestions: [
                        {
                            title: 'Social Media Trends for 2024',
                            platform: 'linkedin',
                            estimatedEngagement: 0.078,
                            reasoning: 'Professional development content performs well'
                        },
                        {
                            title: '5 Quick Productivity Tips for Remote Workers',
                            platform: 'x',
                            estimatedEngagement: 0.065,
                            reasoning: 'List-based content drives high engagement'
                        },
                        {
                            title: 'Behind the Scenes: Our Design Process',
                            platform: 'instagram',
                            estimatedEngagement: 0.089,
                            reasoning: 'Visual storytelling resonates with audience'
                        }
                    ],
                    trendingtopics: ['AI in marketing', 'Remote work', 'Social commerce'],
                    nextUpdate: '4 hours',
                }
            },
            'hashtag-optimizer': {
                status: 'completed',
                executionTime: '2.1s',
                data: {
                    optimizedHashtags: {
                        trending: ['#SocialMediaTips', '#ContentMarketing', '#DigitalStrategy'],
                        niche: ['#BufferOptimizer', '#SocialAnalytics', '#MarketingAutomation'],
                        location: ['#TechSF', '#StartupLife', '#SiliconValley']
                    },
                    performance: {
                        previousReach: 12500,
                        optimizedReach: 16100,
                        improvement: '28%'
                    },
                    recommendations: 'Use 3-5 hashtags per post for optimal reach',
                }
            },
            'competitor-tracker': {
                status: 'completed',
                executionTime: '5.3s',
                data: {
                    competitors: [
                        {
                            name: 'Hootsuite',
                            engagementRate: 0.045,
                            postFrequency: '3 posts/day',
                            topContent: 'Educational content about social media'
                        },
                        {
                            name: 'Sprout Social',
                            engagementRate: 0.052,
                            postFrequency: '2 posts/day',
                            topContent: 'Customer success stories'
                        }
                    ],
                    insights: [
                        'Competitors focus heavily on educational content',
                        'Video content drives 40% more engagement',
                        'Posting frequency: 2-3 times daily optimal'
                    ],
                    opportunities: 'Underutilized: Instagram Stories, LinkedIn polls',
                }
            },
            'auto-scheduler': {
                status: 'completed',
                executionTime: '3.7s',
                data: {
                    scheduled: 15,
                    optimized: 12,
                    platforms: ['x', 'linkedin', 'facebook', 'instagram'],
                    nextPosts: [
                        { platform: 'x', time: '14:00', content: 'Pro tip: Schedule posts...' },
                        { platform: 'linkedin', time: '09:00', content: 'Industry insights...' },
                        { platform: 'instagram', time: '17:00', content: 'Behind the scenes...' }
                    ],
                    message: 'Successfully scheduled 15 posts at optimal times',
                }
            },
            'engagement-booster': {
                status: 'completed',
                executionTime: '2.9s',
                data: {
                    boosted: 8,
                    strategies: ['Optimal timing', 'Hashtag optimization', 'Content enhancement'],
                    results: {
                        averageIncrease: '23%',
                        bestPerforming: 'LinkedIn posts with industry insights',
                        improvementAreas: 'Instagram Stories engagement'
                    },
                    nextActions: ['A/B test posting times', 'Experiment with video content'],
                }
            },
            'visual-content-ai': {
                status: 'completed',
                executionTime: '4.6s',
                data: {
                    generated: 6,
                    contentTypes: ['Instagram posts', 'LinkedIn banners', 'X graphics'],
                    recommendations: [
                        'Use blue color scheme for trust-building',
                        'Include person in image for higher engagement',
                        'Keep text minimal for mobile optimization'
                    ],
                    templates: 'Created 3 new templates for upcoming campaigns',
                }
            },
            'custom-reports': {
                status: 'completed',
                executionTime: '6.2s',
                data: {
                    generated: 3,
                    formats: ['PDF Executive Summary', 'Excel Data Export', 'Interactive Dashboard'],
                    recipients: ['team@company.com', 'marketing@company.com'],
                    metrics: {
                        totalPages: 24,
                        chartCount: 15,
                        insights: 8
                    },
                    deliveryStatus: 'All reports delivered successfully',
                }
            },
            'trend-detector': {
                status: 'completed',
                executionTime: '3.9s',
                data: {
                    emergingTrends: [
                        { topic: 'AI-powered social media', growth: '+145%', confidence: 0.87 },
                        { topic: 'Micro-influencer marketing', growth: '+89%', confidence: 0.92 },
                        { topic: 'Social commerce integration', growth: '+67%', confidence: 0.78 }
                    ],
                    recommendations: [
                        'Create content around AI in marketing',
                        'Partner with micro-influencers in tech space',
                        'Explore social shopping features'
                    ],
                    nextUpdate: 'Tomorrow at 9:00 AM',
                }
            },
            'crisis-monitor': {
                status: 'completed',
                executionTime: '1.7s',
                data: {
                    alerts: 0,
                    sentiment: {
                        overall: 'positive',
                        score: 0.78,
                        change: '+5%'
                    },
                    mentions: {
                        total: 156,
                        positive: 121,
                        neutral: 31,
                        negative: 4
                    },
                    message: 'No crisis detected. Brand sentiment remains positive',
                    nextCheck: '15 minutes',
                }
            },
            'roi-calculator': {
                status: 'completed',
                executionTime: '4.4s',
                data: {
                    roi: {
                        percentage: 245,
                        revenue: '$124,500',
                        investment: '$38,200',
                        profit: '$86,300'
                    },
                    attribution: {
                        direct: '45%',
                        social: '32%',
                        referral: '23%'
                    },
                    recommendations: [
                        'Increase LinkedIn ad spend - highest ROI',
                        'Optimize Instagram campaigns',
                        'Focus on video content for better conversion'
                    ],
                    period: 'Last 30 days',
                }
            },
        };

        return pluginResults[pluginId as keyof typeof pluginResults] || {
            status: 'completed',
            executionTime: '3.0s',
            data: { message: `Plugin ${pluginId} executed successfully` },
        };
    }
}

export const apiClient = new APIClient();