'use client';

import RoleGuard from '@/components/RoleGuard';

export default function WorkerDashboard() {
  return (
    <RoleGuard role="WORKER">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Worker Dashboard</h1>
        <p>Welcome Waste Worker! 🧹</p>
      </div>
    </RoleGuard>
  );
}

