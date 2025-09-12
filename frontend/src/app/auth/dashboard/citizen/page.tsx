'use client';

import RoleGuard from '@/components/RoleGuard';
import { useRouter } from 'next/navigation';

export default function CitizenDashboard() {
  const router = useRouter();

  return (
    <RoleGuard role="CITIZEN">
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-2">Citizen Dashboard</h1>
        <p className="text-gray-700 mb-6">Welcome Citizen! 🚮 Here’s your training and resources to improve waste management awareness.</p>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Training Modules */}
          <div
            className="p-6 border rounded-lg shadow hover:shadow-lg transition cursor-pointer bg-green-50"
            onClick={() => router.push('/auth/dashboard/citizen/training')}
          >
            <h2 className="text-2xl font-semibold mb-2">Training Modules</h2>
            <p className="text-gray-700">Access all training modules designed for citizens, including videos, flashcards, and quizzes.</p>
          </div>

          {/* Other Cards: e.g., Resources, Feedback, etc. (optional) */}
          <div
            className="p-6 border rounded-lg shadow hover:shadow-lg transition cursor-pointer bg-blue-50"
            onClick={() => alert('Resources coming soon!')}
          >
            <h2 className="text-2xl font-semibold mb-2">Resources</h2>
            <p className="text-gray-700">View useful guides and tips for better waste management practices.</p>
          </div>
        </div>

        {/* Optional Footer Info */}
        <div className="mt-6 text-gray-500">
          <p>Click on the cards above to access training and resources tailored for you.</p>
        </div>
      </div>
    </RoleGuard>
  );
}

