'use client';

import RoleGuard from '@/components/RoleGuard';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axiosInstance';

type Module = {
  id: string;
  title: string;
  role: string;
};

export default function WorkerTrainingPage() {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const fetchModules = async () => {
    try {
      const res = await api.get('/training/modules', {
        headers: { Authorization: `Bearer ${token}` },
        params: { role: 'WORKER' },
      });
      setModules(res.data);
      setLoading(false);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to fetch modules');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  if (loading) return <p className="p-6">Loading modules...</p>;

  return (
    <RoleGuard role="WORKER">
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-4">Training Modules</h1>
        {message && <p className="text-red-500">{message}</p>}

        {modules.length === 0 ? (
          <p>No training modules available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="p-6 border rounded-lg shadow hover:shadow-lg cursor-pointer bg-green-50 transition"
                onClick={() => router.push(`/auth/dashboard/worker/training/${mod.id}`)}
              >
                <h2 className="text-xl font-semibold">{mod.title}</h2>
                <p className="text-gray-600 mt-2">Role: {mod.role}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}

