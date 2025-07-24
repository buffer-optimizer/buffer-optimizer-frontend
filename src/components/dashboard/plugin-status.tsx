'use client';

import { Card } from '../ui/card';
import { CheckCircle, AlertCircle, Clock, Play } from 'lucide-react';
import type { Plugin } from '@/types'; // Import from shared types

interface PluginStatusProps {
    plugins: Plugin[];
}

export function PluginStatus({ plugins }: PluginStatusProps) {
    const getStatusIcon = (enabled: boolean) => {
        if (enabled) {
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        }
        return <Play className="w-4 h-4 text-gray-500" />;
    };

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Plugin Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plugins.map((plugin) => (
                    <div key={plugin.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                {plugin.name}
                            </h4>
                            {getStatusIcon(plugin.enabled)}
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                            {plugin.description}
                        </p>

                        <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                v{plugin.version}
              </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                                plugin.enabled
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                {plugin.enabled ? 'Active' : 'Inactive'}
              </span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}