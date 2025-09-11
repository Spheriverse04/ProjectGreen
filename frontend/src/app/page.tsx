'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Example logic: redirect to register by default
    router.push('/auth/register');

    // Or, if you want to check login status first:
    // const token = localStorage.getItem('access_token');
    // if (token) router.push('/auth/dashboard');
    // else router.push('/auth/register');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Welcome to Project Green</h1>
      <p>Redirecting you to the registration page...</p>
    </div>
  );
}

