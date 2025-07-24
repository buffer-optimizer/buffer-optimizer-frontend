import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import React from "react";

export default function OptimalTimesLayout({
                                               children,
                                           }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    {children}
                </main>
            </div>
        </div>
    );
}
