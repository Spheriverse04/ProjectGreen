'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axiosInstance';

interface Module {
  id: string;
  title: string;
  role: string; // 'CITIZEN' | 'WORKER'
}

export default function TrainingModulesPage() {
  const router = useRouter();

  const [modules, setModules] = useState<Module[]>([]);
  const [title, setTitle] = useState('');
  const [role, setRole] = useState<'CITIZEN' | 'WORKER'>('CITIZEN');
  const [message, setMessage] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch modules
  const fetchModules = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await api.get('/training/modules', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModules(res.data || []);
      setMessage('');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  };

  // Create module (Admin only)
  const createModule = async () => {
    if (!title.trim()) return setMessage('Module title is required');
    try {
      const token = localStorage.getItem('access_token');
      await api.post(
        '/training/modules',
        { title: title.trim(), role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setRole('CITIZEN');
      setMessage('Module created successfully!');
      fetchModules();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to create module');
    }
  };

  // Delete module (Admin only)
  const deleteModule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await api.delete(`/training/modules/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Module deleted successfully!');
      fetchModules();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to delete module');
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);
    if (role !== 'ADMIN') {
      router.push('/auth/dashboard'); // redirect non-admins
    } else {
      fetchModules();
    }
  }, [router]);

  if (loading) return <p className="p-6">Loading modules...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📚 Training Modules</h1>

      {/* Admin-only: Create new module */}
      {userRole === 'ADMIN' && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Create New Module</h2>
          <input
            type="text"
            placeholder="Module Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'CITIZEN' | 'WORKER')}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="CITIZEN">Citizen</option>
            <option value="WORKER">Worker</option>
          </select>
          <button
            onClick={createModule}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Module
          </button>
        </div>
      )}

      {/* Module list */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Modules</h2>
        {modules.length === 0 ? (
          <p>No training modules found.</p>
        ) : (
          <ul className="space-y-4">
            {modules.map((m) => (
              <li
                key={m.id}
                className="p-4 border rounded flex justify-between items-center hover:bg-gray-50 transition"
              >
                <div>
                  <h3 className="font-bold">{m.title}</h3>
                  <p className="text-sm text-gray-600">Role: {m.role}</p>
                </div>
                {userRole === 'ADMIN' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        router.push(`/auth/dashboard/admin/training/${m.id}`)
                      }
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => deleteModule(m.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}

