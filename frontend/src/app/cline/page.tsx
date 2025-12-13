import { ClinePanel } from '../../components/ClinePanel';
import Link from 'next/link';

export default function ClinePage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>
        <ClinePanel />
      </div>
    </main>
  );
}

