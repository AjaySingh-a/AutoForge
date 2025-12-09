import { AgentDashboard } from '@/components/AgentDashboard';
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                AutoForge
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Multi-Agent AI Development System
              </p>
            </div>
            <Link
              href="/cline"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Cline CLI →
            </Link>
          </div>
          <AgentDashboard />
        </div>
      </div>
    </main>
  );
}

