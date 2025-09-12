'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/axiosInstance';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) return setMessage('Please enter email and password');
    
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      console.log('Login response:', res.data);

      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('role', res.data.role);

      setMessage('Login successful!');

      // Redirect based on role
      setTimeout(() => {
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
            router.push('/auth/dashboard');
        }
      }, 1000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your Clean India account</p>
        </div>

        <div className="eco-card p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="eco-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="eco-input"
                required
              />
            </div>

            <button
              onClick={login}
              disabled={loading}
              className="eco-button eco-button-primary w-full py-3 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-green-600 hover:text-green-700"
            >
              Forgot your password?
            </Link>
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm ${
              message.includes('successful') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-green-600 hover:text-green-700 font-medium">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
