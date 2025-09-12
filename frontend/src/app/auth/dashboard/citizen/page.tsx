'use client';

import RoleGuard from '@/components/RoleGuard';

export default function CitizenDashboard() {
  return (
    <RoleGuard role="CITIZEN">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Citizen Dashboard</h1>
        <p>Welcome Citizen! 🚮</p>
      </div>
    </RoleGuard>
  );
}

