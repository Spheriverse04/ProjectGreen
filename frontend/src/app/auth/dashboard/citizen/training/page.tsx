'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axiosInstance';
import RoleGuard from '@/components/RoleGuard';

type Module = {
  id: string;
  title: string;
  role: string;
};

export default function CitizenTrainingPage() {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const fetchModules = async () => {
    try {
      const res = await api.get('/training/modules', {
        headers: { Authorization: `Bearer ${token}` },
        params: { role: 'CITIZEN' },
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
    <RoleGuard role="CITIZEN">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Citizen Training Modules</h1>

        {message && <p className="text-red-500 mb-4">{message}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="p-4 border rounded shadow hover:shadow-lg cursor-pointer transition"
              onClick={() => router.push(`/auth/dashboard/citizen/training/${mod.id}`)}
            >
              <h2 className="text-xl font-semibold">{mod.title}</h2>
              <p className="text-gray-600 mt-2">Role: {mod.role}</p>
            </div>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}

