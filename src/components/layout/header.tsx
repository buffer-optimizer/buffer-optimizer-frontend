'use client';

import { User } from 'lucide-react';
import { ThemeToggle } from '../ui/theme-toggle';

export function Header() {
    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Buffer Content Optimizer
                    </h1>
                    <span className="text-sm text-gray-500 bg-blue-50 dark:bg-blue-900/50 px-2 py-1 rounded dark:text-blue-300">
            Demo
          </span>
                </div>

                <div className="flex items-center space-x-4">
                    {/* User Profile */}
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Demo User
            </span>
                    </div>
                </div>
            </div>
        </header>
    );
}