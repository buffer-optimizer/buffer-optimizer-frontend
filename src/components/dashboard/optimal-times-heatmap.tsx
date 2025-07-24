'use client';

import { Clock } from 'lucide-react';
import { Card } from '../ui/card';

// Local types (copy from the types artifact)
interface OptimalTimingAnalysis {
    profileId: string;
    service: 'x' | 'linkedin' | 'facebook' | 'instagram';
    recommendations: TimeSlotRecommendation[];
    analysis: TimingAnalysis;
    confidence: number;
    lastUpdated: string;
}

interface TimeSlotRecommendation {
    dayOfWeek: number;
    hour: number;
    engagementScore: number;
    confidence: number;
    sampleSize: number;
}

interface TimingAnalysis {
    bestDays: DayAnalysis[];
    bestHours: HourAnalysis[];
}

interface DayAnalysis {
    dayOfWeek: number;
    dayName: string;
    averageEngagement: number;
    postCount: number;
    rank: number;
}

interface HourAnalysis {
    hour: number;
    averageEngagement: number;
    postCount: number;
    rank: number;
}

interface OptimalTimesHeatmapProps {
    data: OptimalTimingAnalysis;
}

export function OptimalTimesHeatmap({ data }: OptimalTimesHeatmapProps) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Optimal Posting Times
                </h3>
                <Clock className="w-5 h-5 text-gray-500" />
            </div>

            <div className="space-y-4">
                {/* Top recommendations */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Best Times This Week
                    </h4>
                    {data.recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {days[rec.dayOfWeek]} at {rec.hour.toString().padStart(2, '0')}:00
                </span>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {(rec.engagementScore * 100).toFixed(2)}% avg engagement
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                    {(rec.confidence * 100).toFixed(0)}% confidence
                                </div>
                                <div className="text-xs text-gray-500">
                                    {rec.sampleSize} posts
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Confidence indicator */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                    <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Overall Confidence
            </span>
                        <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
              {(data.confidence * 100).toFixed(0)}%
            </span>
                    </div>
                    <div className="mt-2 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${data.confidence * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </Card>
    );
}