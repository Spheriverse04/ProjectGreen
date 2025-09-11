// src/app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axiosInstance';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const login = async () => {
    if (!email || !password) return setMessage('Please enter email and password');
    try {
      const res = await api.post('/auth/login', { email, password });

      // ✅ Save token + role
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('role', res.data.role);

      setMessage('Login successful!');

      // ✅ Redirect based on role
      switch (res.data.role) {
        case 'CITIZEN':
          router.push('/auth/dashboard/citizen');
          break;
        case 'WORKER':
          router.push('/auth/dashboard/worker');
          break;
        case 'ADMIN':
          router.push('/auth/dashboard/admin');
          break;
        default:
          router.push('/auth/dashboard'); // fallback
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />

      <button
        onClick={login}
        className="w-full bg-blue-600 text-white p-2 rounded mt-2"
      >
        Login
      </button>

      <p className="mt-2 text-sm text-right">
        <button
          onClick={() => router.push('/auth/forgot-password')}
          className="text-blue-600 underline"
        >
          Forgot Password?
        </button>
      </p>

      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
}

