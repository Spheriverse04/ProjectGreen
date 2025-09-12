'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axiosInstance';

interface RoleGuardProps {
  role: 'ADMIN' | 'WORKER' | 'CITIZEN';
  children: React.ReactNode;
}

export default function RoleGuard({ role, children }: RoleGuardProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const res = await api.post(
          '/auth/check',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const user = res.data.user;

        if (user.role !== role) {
          // 🚨 Wrong role → redirect to *their* dashboard
          router.push(`/auth/dashboard/${user.role.toLowerCase()}`);
          return;
        }

        setAuthorized(true);
      } catch (err) {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [role, router]);

  if (loading) return <p>Loading...</p>;
  if (!authorized) return null;

  return <>{children}</>;
}

