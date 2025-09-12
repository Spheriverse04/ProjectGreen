'use client';

import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';

export default function AdminDashboard() {
  return (
    <RoleGuard role="ADMIN">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p className="mb-4">Welcome, Admin 👋</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/auth/dashboard/admin/training">
            <div className="p-6 bg-blue-100 rounded-lg shadow hover:bg-blue-200 cursor-pointer">
              <h2 className="text-xl font-semibold">📚 Training Modules</h2>
              <p className="text-sm mt-2">Manage modules, flashcards, videos, and quizzes.</p>
            </div>
          </Link>

          <Link href="/auth/dashboard/admin/users">
            <div className="p-6 bg-green-100 rounded-lg shadow hover:bg-green-200 cursor-pointer">
              <h2 className="text-xl font-semibold">👥 Users</h2>
              <p className="text-sm mt-2">(Optional) Manage registered users.</p>
            </div>
          </Link>

          <Link href="/auth/dashboard/admin/reports">
            <div className="p-6 bg-yellow-100 rounded-lg shadow hover:bg-yellow-200 cursor-pointer">
              <h2 className="text-xl font-semibold">📊 Reports</h2>
              <p className="text-sm mt-2">(Optional) Track learning progress.</p>
            </div>
          </Link>
        </div>
      </div>
    </RoleGuard>
  );
}

