import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  Calendar,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User as UserIcon,
} from 'lucide-react';
import { authService } from '../services/api';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Trigger Google OAuth 2.0 flow
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setAuthError(null);
      const authUrl = await authService.getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (err: any) {
      console.error('Failed to initiate Google OAuth:', err);
      setAuthError('Could not connect to Google OAuth service. Please verify your backend server is running on port 5000.');
      setIsGoogleLoading(false);
    }
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setAuthError('Please fill in all required fields.');
      return;
    }
    // Proceed to Google OAuth for authorized Calendar access
    handleGoogleSignIn();
  };

  return (
    <div className="login-page-container">
      <div className="login-card-wrapper">
        {/* Left Side Showcase Panel (Matches Image 2) */}
        <div className="login-left-panel">
          <div>
            <Link to="/" className="login-brand-header">
              <div className="login-brand-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    stroke="#ffffff"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="login-brand-name">MeetScribe</span>
            </Link>

            <h1 className="login-hero-heading">
              Turn Your Meetings
              <span className="login-gradient-text">Into Action</span>
            </h1>

            <p className="login-hero-subtext">
              MeetScribe records, transcribes and summarizes your Google Meet calls — so you can focus on what matters most.
            </p>

            {/* Feature Bullets */}
            <div className="login-features-list">
              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="login-feature-title">Auto Transcription</div>
                  <div className="login-feature-desc">Get accurate transcripts in real time.</div>
                </div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="login-feature-title">Smart Summaries</div>
                  <div className="login-feature-desc">Key points, action items and decisions — instantly.</div>
                </div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <Calendar size={18} />
                </div>
                <div>
                  <div className="login-feature-title">Seamless Google Meet Sync</div>
                  <div className="login-feature-desc">Join, record and manage all your meetings in one place.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Cards Collage */}
          <div>
            <div className="login-visual-collage">
              {/* Google Meet Recording Badge */}
              <div className="collage-meet-card">
                <div className="collage-meet-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#00832d" d="M37 24v-8.5l-8-6v29l8-6V24z" />
                      <path fill="#0066da" d="M12 37h17V11H12c-2.2 0-4 1.8-4 4v18c0 2.2 1.8 4 4 4z" />
                      <path fill="#e53935" d="M29 37h9c1.7 0 3-1.3 3-3V14c0-1.7-1.3-3-3-3h-9v26z" />
                    </svg>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>Google Meet</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600 }}>• Recording...</span>
                </div>

                <div className="collage-avatar-row">
                  <div className="collage-avatar">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                  </div>
                  <div className="collage-avatar">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                  </div>
                  <div className="collage-avatar">
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                  </div>
                </div>
              </div>

              {/* Summary Checklist Card */}
              <div className="collage-summary-card">
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  📋 Summary
                </div>
                <div className="summary-bullet">
                  <span style={{ color: '#16a34a' }}>✓</span> Key discussion points
                </div>
                <div className="summary-bullet">
                  <span style={{ color: '#16a34a' }}>✓</span> Action items
                </div>
                <div className="summary-bullet">
                  <span style={{ color: '#16a34a' }}>✓</span> Decisions
                </div>
              </div>
            </div>

            {/* Handwritten Note at Bottom Left */}
            <div className="login-handwritten-note">
              Less note-taking.
              <br />
              More doing.
              <span className="login-handwritten-underline" />
            </div>
          </div>
        </div>

        {/* Right Side Login / Sign Up Form */}
        <div className="login-right-panel">
          <div className="form-header-box">
            <div className="form-logo-box">
              <div className="login-brand-icon" style={{ width: '32px', height: '32px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    stroke="#ffffff"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="login-brand-name" style={{ fontSize: '18px' }}>MeetScribe</span>
            </div>

            <h2 className="form-title">{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
            <p className="form-subtext">
              {isSignUp
                ? 'Sign up to start automating your meeting notes.'
                : 'Sign in to continue to your meeting assistant.'}
            </p>
          </div>

          {authError && (
            <div
              style={{
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '13px',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              {authError}
            </div>
          )}

          <form className="auth-form" onSubmit={handleEmailAuth}>
            {/* Full Name field in Sign Up Mode */}
            {isSignUp && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <div className="input-field-wrapper">
                  <UserIcon size={18} className="input-icon" />
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Jayraj Bhatti"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="input-group">
              <label className="input-label">Email address</label>
              <div className="input-field-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-field-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder={isSignUp ? 'Create a strong password' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password (Sign In Mode) */}
            {!isSignUp && (
              <div className="form-options-row">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#2563eb' }}
                  />
                  Remember me
                </label>
                <a href="#forgot" className="forgot-link">
                  Forgot password?
                </a>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="submit-btn">
              {isSignUp ? 'Sign up' : 'Sign in'} <ArrowRight size={16} />
            </button>
          </form>

          {/* Divider */}
          <div className="or-divider">or</div>

          {/* Google OAuth Button */}
          <button
            type="button"
            className="google-auth-btn"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <span>Connecting to Google...</span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{isSignUp ? 'Sign up with Google' : 'Continue with Google'}</span>
              </>
            )}
          </button>

          {/* Toggle between Sign In & Sign Up */}
          <div className="form-footer-text">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="signup-link"
                  onClick={() => {
                    setIsSignUp(false);
                    setAuthError(null);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="signup-link"
                  onClick={() => {
                    setIsSignUp(true);
                    setAuthError(null);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
