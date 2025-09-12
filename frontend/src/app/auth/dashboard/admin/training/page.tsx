'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axiosInstance';

export default function TrainingModulesPage() {
  const router = useRouter();

  const [modules, setModules] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('CITIZEN');
  const [message, setMessage] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch modules
  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await api.get('/training/modules', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModules(res.data);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to fetch modules');
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);
    setLoading(false);

    if (role !== 'ADMIN') {
      // 🚨 redirect non-admins
      router.push('/auth/dashboard');
    } else {
      fetchModules();
    }
  }, [router]);

  // Create module (Admin only)
  const createModule = async () => {
    if (!title) return setMessage('Title is required');
    
    console.log('Creating module with:', { title, role });
    
    try {
      const token = localStorage.getItem('access_token');
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      await api.post(
        '/training/modules',
        { title, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setRole('CITIZEN');
      setMessage('Module created successfully!');
      fetchModules();
    } catch (err: any) {
      console.error('Error creating module:', err.response?.data || err.message);
      setMessage(err.response?.data?.message || 'Failed to create module');
    }
  };

  // Delete module (Admin only)
  const deleteModule = async (id: string) => {
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

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

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
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="CITIZEN">Citizen</option>
            <option value="WORKER">Worker</option>
          </select>
          <button
            onClick={createModule}
            className="px-4 py-2 bg-blue-600 text-white rounded"
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
                className="p-4 border rounded flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold">{m.title}</h3>
                  <p className="text-sm text-gray-600">Role: {m.role}</p>
                </div>
                {userRole === 'ADMIN' && (
                  <button
                    onClick={() => deleteModule(m.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
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


