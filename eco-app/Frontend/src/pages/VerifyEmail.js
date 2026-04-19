import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying your email...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('Invalid verification link.');
      return;
    }
    authApi.verifyEmail(token)
      .then(() => {
        setStatus('Email verified! Redirecting...');
        setTimeout(()=>navigate('/home'), 1200);
      })
      .catch((e) => {
        setStatus(e.response?.data?.error || 'Verification failed.');
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>{status}</div>
    </div>
  );
};

export default VerifyEmail;
