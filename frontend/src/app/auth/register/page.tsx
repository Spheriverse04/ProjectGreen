// src/app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('CITIZEN'); // 👈 default role
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState('');

  const sendOtp = async () => {
    if (!phone) return setMessage('Please enter your phone number');
    try {
      await axios.post('http://localhost:3000/auth/send-otp', { phone });
      setOtpSent(true);
      setMessage('OTP sent successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const verifyOtp = async () => {
    if (!otp) return setMessage('Please enter OTP');
    try {
      const res = await axios.post('http://localhost:3000/auth/verify-otp', {
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
    }
  };

  const register = async () => {
    if (!otpVerified) return setMessage('Please verify OTP first');
    if (!password || password !== confirmPassword)
      return setMessage('Passwords do not match');

    try {
      await axios.post('http://localhost:3000/auth/register', {
        name,
        email,
        phone,
        password,
        role, // 👈 send role
      });
      setMessage('Registration successful! Please login.');
      router.push('/auth/login');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Register</h1>

      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />

      {/* Role selection */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      >
        <option value="CITIZEN">Citizen</option>
        <option value="WORKER">Worker</option>
        <option value="ADMIN">Admin</option>
      </select>

      {/* Phone + OTP */}
      <div className="flex mb-2">
        <input
          type="tel"
          placeholder="Phone +911234567890"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="flex-1 p-2 border rounded-l"
        />
        <button
          onClick={sendOtp}
          className="px-4 bg-blue-600 text-white rounded-r"
        >
          Get OTP
        </button>
      </div>

      {otpSent && (
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

      {otpVerified && (
        <>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          />

          <button
            onClick={register}
            className="w-full bg-green-600 text-white p-2 rounded mt-2"
          >
            Register
          </button>
        </>
      )}

      <p className="mt-4 text-sm">
        Already have an account?{' '}
        <button
          onClick={() => router.push('/auth/login')}
          className="text-blue-600 underline"
        >
          Login
        </button>
      </p>

      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
}

