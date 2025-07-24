'use client';

import { ExternalLink, TrendingUp } from 'lucide-react';
import { Card } from '../ui/card';

// Local types
interface PostAnalytics {
    postId: string;
    profileId: string;
    service: 'x' | 'linkedin' | 'facebook' | 'instagram';
    publishedAt: string;
    text: string;
    metrics: PostMetrics;
    engagementRate: number;
    reach: number;
    impressions: number;
}

interface PostMetrics {
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    retweets?: number;
    reactions?: number;
    saves?: number;
}

interface RecentPostsProps {
    data: PostAnalytics[];
}

export function RecentPosts({ data }: RecentPostsProps) {
    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Top Posts
                </h3>
                <ExternalLink className="w-5 h-5 text-gray-500" />
            </div>

            <div className="space-y-4">
                {data.map((post, index) => (
                    <div key={post.postId} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {index + 1}
                </span>
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                                {post.text}
                            </p>
                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                <span className="capitalize">{post.service}</span>
                                <span>•</span>
                                <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>{(post.engagementRate * 100).toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-shrink-0 text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {Object.values(post.metrics).reduce((sum, val) => sum + (val || 0), 0)}
                            </div>
                            <div className="text-xs text-gray-500">
                                interactions
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}