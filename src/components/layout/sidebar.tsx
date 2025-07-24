'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    BarChart3,
    Clock,
    TrendingUp,
    Puzzle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Optimal Times', href: '/optimal-times', icon: Clock },
    { name: 'Plugins', href: '/plugins', icon: Puzzle },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <aside
            className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
                collapsed ? 'w-16' : 'w-64'
            }`}
        >
            <div className="p-4">
                <div className="flex items-center justify-between">
                    {!collapsed && (
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">Buffer</span>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {collapsed ? (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                        ) : (
                            <ChevronLeft className="w-4 h-4 text-gray-500" />
                        )}
                    </button>
                </div>
            </div>

            <nav className="px-4 pb-4">
                <ul className="space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <item.icon className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
                                    {!collapsed && <span>{item.name}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Enhanced demo info panel with plugin system highlight */}
            {!collapsed && (
                <div className="mx-4 mt-8 space-y-4">
                    {/* Main demo info */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Content Optimizer Demo
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Showcasing analytics, optimal timing recommendations, and extensible plugin architecture.
                        </p>
                    </div>

                    {/* Plugin system highlight */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center space-x-2 mb-2">
                            <Puzzle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                Plugin System
                            </h4>
                        </div>
                        <p className="text-xs text-purple-700 dark:text-purple-300">
                            Extensible architecture with plugins for advanced analytics, optimization, and automation.
                        </p>
                    </div>
                </div>
            )}
        </aside>
    );
}