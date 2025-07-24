import { Dashboard } from '@/components/dashboard/dashboard';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';

export default function Home() {
  return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <Dashboard />
          </main>
        </div>
      </div>
  );
}