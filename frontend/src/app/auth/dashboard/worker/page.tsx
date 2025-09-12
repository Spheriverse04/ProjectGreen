'use client';

import RoleGuard from '@/components/RoleGuard';
import { useRouter } from 'next/navigation';

export default function WorkerDashboard() {
  const router = useRouter();

  return (
    <RoleGuard role="WORKER">
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-2">Worker Dashboard</h1>
        <p className="text-gray-700 mb-6">Welcome Waste Worker! 🧹 Access your training modules and resources to stay updated and efficient.</p>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Training Modules */}
          <div
            className="p-6 border rounded-lg shadow hover:shadow-lg transition cursor-pointer bg-green-50"
            onClick={() => router.push('/auth/dashboard/worker/training')}
          >
            <h2 className="text-2xl font-semibold mb-2">Training Modules</h2>
            <p className="text-gray-700">View all training modules specifically designed for waste management workers, including videos, flashcards, and quizzes.</p>
          </div>

          {/* Resources / Safety Guidelines */}
          <div
            className="p-6 border rounded-lg shadow hover:shadow-lg transition cursor-pointer bg-blue-50"
            onClick={() => alert('Resources coming soon!')}
          >
            <h2 className="text-2xl font-semibold mb-2">Resources & Safety</h2>
            <p className="text-gray-700">Access safety guidelines, manuals, and best practices to improve efficiency and safety on the job.</p>
          </div>
        </div>

        {/* Optional Footer Info */}
        <div className="mt-6 text-gray-500">
          <p>Click on the cards above to access training and resources tailored for workers.</p>
        </div>
      </div>
    </RoleGuard>
  );
}

