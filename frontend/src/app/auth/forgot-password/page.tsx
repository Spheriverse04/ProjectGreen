'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/axiosInstance';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
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
      const res = await api.post('/auth/verify-otp', { phone, token: otp });
      if (!res.data.success) {
        setMessage('Invalid OTP');
        return;
      }
      setOtpVerified(true);
      setMessage('OTP verified! Now set your new password.');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!otpVerified) return setMessage('Please verify OTP first');
    if (!newPassword || newPassword !== confirmPassword)
      return setMessage('Passwords do not match');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { phone, newPassword });
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-gray-600">Enter your phone number to reset your password</p>
        </div>

        <div className="eco-card p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registered Phone Number</label>
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
                  {loading ? 'Sending...' : otpSent ? 'Sent' : 'Send OTP'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="eco-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="eco-input"
                    required
                  />
                </div>

                <button
                  onClick={resetPassword}
                  disabled={loading}
                  className="eco-button eco-button-primary w-full py-3 disabled:opacity-50"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
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
              Remember your password?{' '}
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
