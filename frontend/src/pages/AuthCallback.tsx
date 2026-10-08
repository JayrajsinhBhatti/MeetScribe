import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [statusText, setStatusText] = useState('Finalizing Google sign-in...');
  const [error, setError] = useState<string | null>(null);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (hasProcessedRef.current) return;

    const token = searchParams.get('token');
    if (!token) {
      setError('No authentication token received from Google. Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 2500);
      return;
    }

    hasProcessedRef.current = true;

    const processLogin = async () => {
      try {
        setStatusText('Retrieving your profile and connected calendar...');
        await login(token);
        setStatusText('Success! Taking you to your dashboard...');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 500);
      } catch (err) {
        console.error('Callback error:', err);
        setError('Authentication failed. Please try signing in again.');
        setTimeout(() => navigate('/login', { replace: true }), 2500);
      }
    };

    processLogin();
  }, [searchParams, login, navigate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f7ff 0%, #e0effe 100%)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '40px 48px',
          borderRadius: '24px',
          boxShadow: '0 20px 40px -15px rgba(37, 99, 235, 0.15)',
          textAlign: 'center',
          maxWidth: '420px',
          width: '90%',
        }}
      >
        {/* Animated MeetScribe Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
          MeetScribe Authentication
        </h2>
        <p style={{ color: error ? '#dc2626' : '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
          {error || statusText}
        </p>

        {!error && (
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #e2e8f0',
              borderTopColor: '#2563eb',
              borderRadius: '50%',
              margin: '24px auto 0',
              animation: 'spin 0.7s linear infinite',
            }}
          />
        )}
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
