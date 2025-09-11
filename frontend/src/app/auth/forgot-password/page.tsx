'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axiosInstance';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false); // ✅ new state
  const [message, setMessage] = useState('');

  // Send OTP
  const sendOtp = async () => {
    if (!phone) return setMessage('Please enter your phone number');
    try {
      await api.post('/auth/send-otp', { phone });
      setOtpSent(true);
      setMessage('OTP sent successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!otp) return setMessage('Please enter OTP');
    try {
      const res = await api.post('/auth/verify-otp', { phone, token: otp });
      if (!res.data.success) {
        setMessage('Invalid OTP');
        return;
      }
      setOtpVerified(true); // ✅ show password fields
      setMessage('OTP verified! Now set your new password.');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'OTP verification failed');
    }
  };

  // Reset password
  const resetPassword = async () => {
    if (!otpVerified) return setMessage('Please verify OTP first');
    if (!newPassword || newPassword !== confirmPassword)
      return setMessage('Passwords do not match');

    try {
      await api.post('/auth/reset-password', { phone, newPassword });
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => router.push('/auth/login'), 1500);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>

      {/* Phone + OTP */}
      <div className="flex mb-2">
        <input
          type="tel"
          placeholder="Registered Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="flex-1 p-2 border rounded-l"
        />
        <button
          onClick={sendOtp}
          className="px-4 bg-blue-600 text-white rounded-r"
        >
          Send OTP
        </button>
      </div>

      {otpSent && !otpVerified && (
        <div className="flex mb-2">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="flex-1 p-2 border rounded-l"
          />
          <button
            onClick={verifyOtp}
            className="px-4 bg-green-600 text-white rounded-r"
          >
            Verify OTP
          </button>
        </div>
      )}

      {/* Password fields only after OTP verified */}
      {otpVerified && (
        <>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          />
          <button
            onClick={resetPassword}
            className="w-full bg-green-600 text-white p-2 rounded mt-2"
          >
            Reset Password
          </button>
        </>
      )}

      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
}

