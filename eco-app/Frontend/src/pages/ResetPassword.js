import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = searchParams.get('token');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token) return setError('Invalid reset link');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirm) return setError('Passwords do not match');
    try {
      await authApi.resetPassword(token, password);
      setSuccess('Password reset! Redirecting to login...');
      setTimeout(()=>navigate('/login'), 1200);
    } catch (e) {
      setError(e.response?.data?.error || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 bg-white/70 backdrop-blur p-6 rounded-xl">
        <h1 className="text-xl font-semibold">Reset Password</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <input type="password" placeholder="New password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full border rounded p-2" required />
        <input type="password" placeholder="Confirm password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} className="w-full border rounded p-2" required />
        <button type="submit" className="w-full bg-emerald-600 text-white rounded p-2">Reset</button>
      </form>
    </div>
  );
};

export default ResetPassword;
