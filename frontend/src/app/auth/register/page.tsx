'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/axiosInstance';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('CITIZEN');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!phone) return setMessage('Please enter your phone number');
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { phone });
      setOtpSent(true);
      setMessage('OTP sent successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return setMessage('Please enter OTP');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        phone,
        token: otp,
      });
      if (!res.data.accessToken) {
        setMessage('Invalid OTP');
        return;
      }
      setOtpVerified(true);
      setMessage('OTP verified! Now set your password.');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    if (!otpVerified) return setMessage('Please verify OTP first');
    if (!password || password !== confirmPassword)
      return setMessage('Passwords do not match');
    
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name,
        email,
        phone,
        password,
        role,
      });
      setMessage('Registration successful! Please login.');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Registration failed');
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
          <h2 className="text-3xl font-bold text-gray-900">Join Clean India</h2>
          <p className="mt-2 text-gray-600">Create your account and start making a difference</p>
        </div>

        <div className="eco-card p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="eco-input"
                required
              />
            </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="eco-select"
              >
                <option value="CITIZEN">Citizen</option>
                <option value="WORKER">Waste Worker</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="flex space-x-2">
                <input
                  type="tel"
                  placeholder="+91 1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="eco-input flex-1"
                  required
                />
                <button
                  onClick={sendOtp}
                  disabled={loading || otpSent}
                  className="eco-button eco-button-secondary px-4 py-3 whitespace-nowrap disabled:opacity-50"
                >
                  {loading ? 'Sending...' : otpSent ? 'Sent' : 'Get OTP'}
                </button>
              </div>
            </div>

            {otpSent && !otpVerified && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="eco-input flex-1"
                    maxLength={6}
                  />
                  <button
                    onClick={verifyOtp}
                    disabled={loading}
                    className="eco-button eco-button-primary px-4 py-3 whitespace-nowrap disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>
            )}

            {otpVerified && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="eco-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="eco-input"
                    required
                  />
                </div>

                <button
                  onClick={register}
                  disabled={loading}
                  className="eco-button eco-button-primary w-full py-3 disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </>
            )}
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm ${
              message.includes('successful') || message.includes('verified') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
