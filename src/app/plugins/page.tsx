'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import {
    Puzzle,
    BarChart3,
    Target,
    FileText,
    Calendar,
    TrendingUp,
    Search,
    Play,
    Pause,
    MoreHorizontal,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Plus,
    RefreshCw,
    Download,
    Eye
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Plugin {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    category: 'analytics' | 'optimization' | 'content' | 'scheduling' | 'reporting';
    enabled: boolean;
    lastExecuted?: string;
    status?: 'active' | 'inactive' | 'error';
    permissions?: string[];
    downloads?: number;
    rating?: number;
}

interface PluginExecution {
    pluginId: string;
    status: 'running' | 'completed' | 'failed';
    startTime: string;
    endTime?: string;
    result?: any;
    error?: string;
}

export default function PluginsPage() {
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [executingPlugins, setExecutingPlugins] = useState<Set<string>>(new Set());
    const [executionResults, setExecutionResults] = useState<Record<string, any>>({});
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState<{show: boolean, pluginId: string, result: any}>({
        show: false,
        pluginId: '',
        result: null
    });

    const categories = [
        { value: 'all', label: 'All Categories', icon: Puzzle },
        { value: 'analytics', label: 'Analytics', icon: BarChart3 },
        { value: 'optimization', label: 'Optimization', icon: Target },
        { value: 'content', label: 'Content', icon: FileText },
        { value: 'scheduling', label: 'Scheduling', icon: Calendar },
        { value: 'reporting', label: 'Reporting', icon: TrendingUp },
    ];

    useEffect(() => {
        loadPlugins();
    }, []);

    const loadPlugins = async () => {
        try {
            setLoading(true);
            setError(null);
            const pluginData = await apiClient.plugins.list();

            // Enhance mock data with additional properties
            const enhancedPlugins = pluginData.map(plugin => ({
                ...plugin,
                status: plugin.enabled ? 'active' : 'inactive' as 'active' | 'inactive',
                permissions: ['read:analytics', 'write:posts', 'read:profiles'],
                downloads: Math.floor(Math.random() * 10000) + 1000,
                rating: 4 + Math.random(),
            }));

            setPlugins(enhancedPlugins);
        } catch (err) {
            console.error('Plugins loading error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load plugins');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePlugin = async (pluginId: string, enabled: boolean) => {
        try {
            // Update local state optimistically
            setPlugins(prev => prev.map(plugin =>
                plugin.id === pluginId
                    ? { ...plugin, enabled: !enabled, status: !enabled ? 'active' : 'inactive' as 'active' | 'inactive' }
                    : plugin
            ));

            // Make API call
            await apiClient.plugins.toggle(pluginId, !enabled);

            console.log(`Plugin ${pluginId} ${!enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Failed to toggle plugin:', error);
            // Revert optimistic update
            setPlugins(prev => prev.map(plugin =>
                plugin.id === pluginId
                    ? { ...plugin, enabled, status: enabled ? 'active' : 'inactive' as 'active' | 'inactive' }
                    : plugin
            ));
        }
    };

    const handleExecutePlugin = async (pluginId: string) => {
        try {
            setExecutingPlugins(prev => new Set([...prev, pluginId]));

            // Execute plugin with real API integration
            const result = await apiClient.plugins.execute(pluginId, {
                profileId: 'profile_x_001',
                parameters: {},
                timestamp: new Date().toISOString()
            });

            // Store execution result
            setExecutionResults(prev => ({
                ...prev,
                [pluginId]: result
            }));

            // Update last executed time
            setPlugins(prev => prev.map(plugin =>
                plugin.id === pluginId
                    ? { ...plugin, lastExecuted: new Date().toISOString() }
                    : plugin
            ));

            // Show success notification (you could add a toast here)
            console.log(`Plugin ${pluginId} executed successfully:`, result);

            // Optionally show result modal for detailed results
            if (result.data && Object.keys(result.data).length > 2) {
                setShowResultModal({
                    show: true,
                    pluginId,
                    result
                });
            }

        } catch (error) {
            console.error('Failed to execute plugin:', error);
            // You could show an error toast here
        } finally {
            setExecutingPlugins(prev => {
                const newSet = new Set(prev);
                newSet.delete(pluginId);
                return newSet;
            });
        }
    };

    const handleExecuteAllPlugins = async () => {
        try {
            const enabledPlugins = plugins.filter(p => p.enabled);

            // Set all enabled plugins as executing
            const pluginIds = enabledPlugins.map(p => p.id);
            setExecutingPlugins(new Set(pluginIds));

            // Execute all plugins
            const results = await apiClient.plugins.executeAll({
                profileId: 'profile_x_001',
                plugins: pluginIds,
                timestamp: new Date().toISOString()
            });

            // Store all results
            setExecutionResults(prev => ({
                ...prev,
                ...results
            }));

            // Update all plugins' last executed time
            const now = new Date().toISOString();
            setPlugins(prev => prev.map(plugin =>
                plugin.enabled ? { ...plugin, lastExecuted: now } : plugin
            ));

            console.log('All plugins executed:', results);

        } catch (error) {
            console.error('Failed to execute all plugins:', error);
        } finally {
            setExecutingPlugins(new Set());
        }
    };

    const handleViewResult = (pluginId: string) => {
        const result = executionResults[pluginId];
        if (result) {
            setShowResultModal({
                show: true,
                pluginId,
                result
            });
        }
    };

    // Filter plugins based on search and category
    const filteredPlugins = plugins.filter(plugin => {
        const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            plugin.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryIcon = (category: string) => {
        const categoryMap = {
            analytics: BarChart3,
            optimization: Target,
            content: FileText,
            scheduling: Calendar,
            reporting: TrendingUp,
        };
        return categoryMap[category as keyof typeof categoryMap] || Puzzle;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/50';
            case 'inactive': return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
            case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/50';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return CheckCircle;
            case 'inactive': return XCircle;
            case 'error': return AlertCircle;
            default: return XCircle;
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center space-y-4">
                        <LoadingSpinner size="lg" />
                        <p className="text-gray-600 dark:text-gray-400">Loading plugins...</p>
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
                    onRetry={loadPlugins}
                    title="Failed to load plugins"
                />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Puzzle className="w-8 h-8 mr-3 text-blue-600" />
                        Plugin Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Extend your Buffer optimizer with powerful plugins and integrations
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleExecuteAllPlugins}
                        disabled={plugins.filter(p => p.enabled).length === 0 || executingPlugins.size > 0}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {executingPlugins.size > 0 ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Play className="w-4 h-4" />
                        )}
                        <span>{executingPlugins.size > 0 ? 'Running...' : 'Run All'}</span>
                    </button>

                    <button
                        onClick={() => setShowInstallModal(true)}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Install Plugin</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards - same as before but with execution stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Plugins</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{plugins.length}</p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                            <Puzzle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Plugins</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {plugins.filter(p => p.enabled).length}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Executions</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {Object.keys(executionResults).length}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Running</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {executingPlugins.size}
                            </p>
                        </div>
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg">
                            <RefreshCw className={`w-6 h-6 text-yellow-600 dark:text-yellow-400 ${executingPlugins.size > 0 ? 'animate-spin' : ''}`} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters and Search - same as before */}
            <Card className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search plugins..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 overflow-x-auto">
                        {categories.map((category) => {
                            const Icon = category.icon;
                            const isSelected = selectedCategory === category.value;
                            return (
                                <button
                                    key={category.value}
                                    onClick={() => setSelectedCategory(category.value)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                        isSelected
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{category.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </Card>

            {/* Plugin Grid - Enhanced with execution results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlugins.map((plugin) => {
                    const CategoryIcon = getCategoryIcon(plugin.category);
                    const StatusIcon = getStatusIcon(plugin.status || 'inactive');
                    const isExecuting = executingPlugins.has(plugin.id);
                    const hasResult = executionResults[plugin.id];

                    return (
                        <Card key={plugin.id} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${
                                        plugin.category === 'analytics' ? 'bg-blue-50 dark:bg-blue-900/50' :
                                            plugin.category === 'optimization' ? 'bg-green-50 dark:bg-green-900/50' :
                                                plugin.category === 'content' ? 'bg-purple-50 dark:bg-purple-900/50' :
                                                    plugin.category === 'scheduling' ? 'bg-yellow-50 dark:bg-yellow-900/50' :
                                                        'bg-gray-50 dark:bg-gray-800'
                                    }`}>
                                        <CategoryIcon className={`w-5 h-5 ${
                                            plugin.category === 'analytics' ? 'text-blue-600 dark:text-blue-400' :
                                                plugin.category === 'optimization' ? 'text-green-600 dark:text-green-400' :
                                                    plugin.category === 'content' ? 'text-purple-600 dark:text-purple-400' :
                                                        plugin.category === 'scheduling' ? 'text-yellow-600 dark:text-yellow-400' :
                                                            'text-gray-600 dark:text-gray-400'
                                        }`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{plugin.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">v{plugin.version}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plugin.status || 'inactive')}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        <span className="capitalize">{plugin.status || 'inactive'}</span>
                                    </div>
                                    {hasResult && (
                                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Has execution results"></div>
                                    )}
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                {plugin.description}
                            </p>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Author:</span>
                                    <span className="text-gray-900 dark:text-white">{plugin.author}</span>
                                </div>

                                {plugin.downloads && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Downloads:</span>
                                        <span className="text-gray-900 dark:text-white">{plugin.downloads.toLocaleString()}</span>
                                    </div>
                                )}

                                {plugin.rating && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-gray-900 dark:text-white">{plugin.rating.toFixed(1)}</span>
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span key={star} className={`text-xs ${star <= plugin.rating! ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {plugin.lastExecuted && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Clock className="w-4 h-4" />
                                        <span>Last run: {new Date(plugin.lastExecuted).toLocaleDateString()}</span>
                                    </div>
                                )}

                                {/* Execution result preview */}
                                {hasResult && (
                                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-700">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle className="w-3 h-3 text-green-600" />
                                                <span className="text-xs text-green-700 dark:text-green-300">
                                                    Executed ({executionResults[plugin.id]?.executionTime})
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleViewResult(plugin.id)}
                                                className="text-xs text-green-600 hover:text-green-800 dark:text-green-400"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleTogglePlugin(plugin.id, plugin.enabled)}
                                        className={`flex items-center space-x-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
                                            plugin.enabled
                                                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300'
                                        }`}
                                    >
                                        {plugin.enabled ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                        <span>{plugin.enabled ? 'Disable' : 'Enable'}</span>
                                    </button>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {plugin.enabled && (
                                        <button
                                            onClick={() => handleExecutePlugin(plugin.id)}
                                            disabled={isExecuting}
                                            className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 rounded text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {isExecuting ? (
                                                <RefreshCw className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Play className="w-3 h-3" />
                                            )}
                                            <span>{isExecuting ? 'Running...' : 'Run'}</span>
                                        </button>
                                    )}

                                    {hasResult && (
                                        <button
                                            onClick={() => handleViewResult(plugin.id)}
                                            className="p-1 text-green-600 hover:text-green-800 dark:text-green-400"
                                            title="View execution results"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    )}

                                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {filteredPlugins.length === 0 && (
                <Card className="p-12 text-center">
                    <Puzzle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No plugins found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {searchTerm || selectedCategory !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Get started by installing your first plugin'
                        }
                    </p>
                    {!searchTerm && selectedCategory === 'all' && (
                        <button
                            onClick={() => setShowInstallModal(true)}
                            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Browse Plugin Store</span>
                        </button>
                    )}
                </Card>
            )}

            {/* Plugin Execution Results Modal */}
            {showResultModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {plugins.find(p => p.id === showResultModal.pluginId)?.name} - Execution Results
                            </h3>
                            <button
                                onClick={() => setShowResultModal({show: false, pluginId: '', result: null})}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>

                        {showResultModal.result && (
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="font-medium text-green-800 dark:text-green-200">
                                            Execution Completed
                                        </span>
                                    </div>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        Execution Time: {showResultModal.result.executionTime}
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Execution Data:</h4>
                                    <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                        {JSON.stringify(showResultModal.result.data, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    const data = JSON.stringify(showResultModal.result, null, 2);
                                    const blob = new Blob([data], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${showResultModal.pluginId}-results.json`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Download className="w-4 h-4" />
                                <span>Export Results</span>
                            </button>
                            <button
                                onClick={() => setShowResultModal({show: false, pluginId: '', result: null})}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Install Modal Placeholder */}
            {showInstallModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Plugin Store
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Plugin installation and marketplace features would be implemented here in a production environment.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowInstallModal(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}