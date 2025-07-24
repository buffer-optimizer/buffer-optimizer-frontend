'use client';

import {
    Heart,
    BarChart3,
    Github,
    Linkedin,
    Mail,
    ExternalLink,
    Code,
    Zap
} from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-white"/>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white text-lg">
                                Buffer Content Optimizer
                            </span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-md">
                            A full-stack social media analytics and optimization platform showcasing
                            modern React/Node.js architecture, plugin systems, and enterprise-grade development.
                        </div>

                        {/* Creator Attribution */}
                        <div
                            className="flex items-center space-x-2 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                            <Heart className="w-5 h-5 text-red-500 animate-pulse"/>
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                Created by <span className="font-semibold text-blue-600 dark:text-blue-400">Kingsley Baah Brew</span> for Buffer with love
              </span>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Features</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                <span
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                  Multi-Platform Analytics
                </span>
                            </li>
                            <li>
                <span
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                  AI-Powered Optimal Timing
                </span>
                            </li>
                            <li>
                <span
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                  Extensible Plugin System
                </span>
                            </li>
                            <li>
                <span
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                  Real-time Data Export
                </span>
                            </li>

                            <li>
                <span
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                  RESTful API Integration
                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Tech Stack Section */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Frontend Stack</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center space-x-2">
                                <Code className="w-3 h-3 text-blue-500"/>
                                <span className="text-gray-600 dark:text-gray-400">Next.js 14 + TypeScript</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Zap className="w-3 h-3 text-yellow-500"/>
                                <span className="text-gray-600 dark:text-gray-400">Tailwind CSS</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <BarChart3 className="w-3 h-3 text-green-500"/>
                                <span className="text-gray-600 dark:text-gray-400">Recharts</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Code className="w-3 h-3 text-purple-500"/>
                                <span className="text-gray-600 dark:text-gray-400">Lucide React Icons</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Zap className="w-3 h-3 text-blue-500"/>
                                <span className="text-gray-600 dark:text-gray-400">Plugin Architecture</span>
                            </li>
                        </ul>
                    </div>

                    {/* Backend Stack Section */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Backend Stack</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center space-x-2">
                                <Code className="w-3 h-3 text-green-600"/>
                                <span className="text-gray-600 dark:text-gray-400">Node.js</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Zap className="w-3 h-3 text-gray-600"/>
                                <span className="text-gray-600 dark:text-gray-400">Express.js</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Code className="w-3 h-3 text-blue-600"/>
                                <span className="text-gray-600 dark:text-gray-400">TypeScript</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <BarChart3 className="w-3 h-3 text-purple-600"/>
                                <span className="text-gray-600 dark:text-gray-400">RESTful APIs</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Zap className="w-3 h-3 text-orange-500"/>
                                <span className="text-gray-600 dark:text-gray-400">Mock Data Layer</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div
                        className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        {/* Copyright */}
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            © {new Date().getFullYear()} Buffer Content Optimizer Demo.
                            <span className="ml-1">Built as a technical showcase.</span>
                        </div>

                        {/* Contact Links */}
                        <div className="flex items-center space-x-4">
                            <a
                                href="https://github.com/kingsbrew94"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                <Github className="w-4 h-4"/>
                                <span className="text-sm">GitHub</span>
                                <ExternalLink className="w-3 h-3"/>
                            </a>

                            <a
                                href="https://gh.linkedin.com/in/kingsley-brew-56881b172"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                <Linkedin className="w-4 h-4"/>
                                <span className="text-sm">LinkedIn</span>
                                <ExternalLink className="w-3 h-3"/>
                            </a>

                            <a
                                href="mailto:kingsleybrew@gmail.com"
                                className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                <Mail className="w-4 h-4"/>
                                <span className="text-sm">Contact</span>
                            </a>
                        </div>
                    </div>

                    {/* Special Buffer Message */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-center">
                        <div className="flex items-center justify-center space-x-2 text-white">
                            <BarChart3 className="w-5 h-5"/>
                            <span className="font-medium">
                Designed specifically for the Buffer team to showcase engineering skills
              </span>
                            <Heart className="w-5 h-5 text-pink-200 animate-pulse"/>
                        </div>
                        <p className="text-blue-100 text-sm mt-2">
                            Demonstrating platform thinking, plugin architecture, and enterprise-grade React development
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}