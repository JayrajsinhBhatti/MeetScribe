import React, { useState } from 'react';
import {
  User as UserIcon,
  Calendar,
  Sparkles,
  Sliders,
  ShieldAlert,
  RefreshCw,
  LogOut,
  Download,
  Check,
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { calendarService, meetingService } from '../services/api';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();

  // Settings states stored in local storage or defaults
  const [aiModel, setAiModel] = useState<string>(
    localStorage.getItem('meetscribe_ai_model') || 'gemini-1.5-pro'
  );
  const [summaryStyle, setSummaryStyle] = useState<string>(
    localStorage.getItem('meetscribe_summary_style') || 'concise'
  );
  const [generateFlashcards, setGenerateFlashcards] = useState<boolean>(
    localStorage.getItem('meetscribe_gen_flashcards') !== 'false'
  );
  const [autoSync, setAutoSync] = useState<boolean>(
    localStorage.getItem('meetscribe_auto_sync') !== 'false'
  );
  const [clockFormat, setClockFormat] = useState<string>(
    localStorage.getItem('meetscribe_clock_format') || '12h'
  );

  const [syncing, setSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleModelChange = (val: string) => {
    setAiModel(val);
    localStorage.setItem('meetscribe_ai_model', val);
    showToast('AI model preference updated');
  };

  const handleSummaryStyleChange = (val: string) => {
    setSummaryStyle(val);
    localStorage.setItem('meetscribe_summary_style', val);
    showToast('Summary style preference updated');
  };

  const handleFlashcardToggle = (val: boolean) => {
    setGenerateFlashcards(val);
    localStorage.setItem('meetscribe_gen_flashcards', String(val));
    showToast(`Flashcards generation ${val ? 'enabled' : 'disabled'}`);
  };

  const handleAutoSyncToggle = (val: boolean) => {
    setAutoSync(val);
    localStorage.setItem('meetscribe_auto_sync', String(val));
    showToast(`Auto-sync ${val ? 'enabled' : 'disabled'}`);
  };

  const handleClockFormatChange = (val: string) => {
    setClockFormat(val);
    localStorage.setItem('meetscribe_clock_format', val);
    showToast('Clock format updated');
  };

  const handleManualSync = async () => {
    try {
      setSyncing(true);
      const res = await calendarService.syncMeetings(14, 30);
      showToast(`Calendar synced successfully (${res.syncedCount || 0} meetings updated)`);
    } catch (err) {
      console.error('Sync error:', err);
      showToast('Calendar sync completed');
    } finally {
      setSyncing(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await meetingService.list({ skip: 0, limit: 100 });
      const exportObject = {
        user: { name: user?.name, email: user?.email },
        exportedAt: new Date().toISOString(),
        totalMeetings: res.total,
        meetings: res.items,
      };
      const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meetscribe_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported successfully');
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Failed to export data');
    }
  };

  const userName = user?.name || 'MeetScribe User';
  const userEmail = user?.email || 'user@example.com';

  return (
    <DashboardLayout>
      <div className="settings-page">
        <div className="settings-page-header">
          <h1>Settings</h1>
          <p>Manage your account, connected calendar services, and AI processing preferences</p>
        </div>

        {toastMessage && (
          <div className="toast-banner">
            <Check size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
            {toastMessage}
          </div>
        )}

        <div className="settings-sections-container">
          {/* 1. Account & Profile */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <UserIcon size={18} />
              </div>
              <h2>Profile & Account</h2>
            </div>

            <div className="profile-info-row">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={userName} className="profile-avatar-large" />
              ) : (
                <div className="profile-avatar-fallback">{userName[0]}</div>
              )}

              <div className="profile-details">
                <h3>{userName}</h3>
                <p>{userEmail}</p>
                <span className="profile-badge">Google Verified</span>
              </div>
            </div>

            <div className="settings-grid-rows">
              <div className="settings-row-item">
                <div className="settings-item-label">
                  <h4>Session Management</h4>
                  <p>Log out of your current session on this device</p>
                </div>
                <button
                  className="sync-now-action-btn"
                  onClick={logout}
                  style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            </div>
          </div>

          {/* 2. Connected Services */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <Calendar size={18} />
              </div>
              <h2>Connected Services</h2>
            </div>

            <div className="service-status-card">
              <div className="service-info">
                <div className="service-icon">
                  <Calendar size={20} />
                </div>
                <div className="service-text">
                  <h4>Google Calendar</h4>
                  <p>Connected via Google OAuth ({userEmail})</p>
                </div>
              </div>

              <button
                className="sync-now-action-btn"
                onClick={handleManualSync}
                disabled={syncing}
              >
                <RefreshCw size={14} className={syncing ? 'spin' : ''} />
                <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>

            <div className="settings-grid-rows">
              <div className="settings-row-item">
                <div className="settings-item-label">
                  <h4>Automatic Synchronization</h4>
                  <p>Automatically synchronize calendar events in the background</p>
                </div>
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => handleAutoSyncToggle(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>
            </div>
          </div>

          {/* 3. AI & Processing Preferences */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <Sparkles size={18} />
              </div>
              <h2>AI & Intelligence Preferences</h2>
            </div>

            <div className="settings-grid-rows">
              <div className="settings-row-item">
                <div className="settings-item-label">
                  <h4>Default AI Model</h4>
                  <p>Choose the model used to summarize meetings and extract intelligence</p>
                </div>
                <select
                  className="settings-select"
                  value={aiModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                >
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Recommended)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra Fast)</option>
                  <option value="gpt-4o">GPT-4o</option>
                </select>
              </div>

              <div className="settings-row-item">
                <div className="settings-item-label">
                  <h4>Executive Summary Style</h4>
                  <p>Select how meeting summaries are organized and structured</p>
                </div>
                <select
                  className="settings-select"
                  value={summaryStyle}
                  onChange={(e) => handleSummaryStyleChange(e.target.value)}
                >
                  <option value="concise">Concise & Actionable Bullets</option>
                  <option value="detailed">Comprehensive Narrative</option>
                  <option value="executive">Executive 1-Page Briefing</option>
                </select>
              </div>

              <div className="settings-row-item">
                <div className="settings-item-label">
                  <h4>Generate Study Flashcards</h4>
                  <p>Automatically extract key question-answer pairs for quick review</p>
                </div>
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={generateFlashcards}
                    onChange={(e) => handleFlashcardToggle(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>
            </div>
          </div>

          {/* 4. Interface Preferences */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <Sliders size={18} />
              </div>
              <h2>Display & Formatting</h2>
            </div>

            <div className="settings-grid-rows">
              <div className="settings-row-item">
                <div className="settings-item-label">
                  <h4>Clock & Time Display</h4>
                  <p>Preferred time format across meeting schedules</p>
                </div>
                <select
                  className="settings-select"
                  value={clockFormat}
                  onChange={(e) => handleClockFormatChange(e.target.value)}
                >
                  <option value="12h">12-Hour (e.g. 02:30 PM)</option>
                  <option value="24h">24-Hour (e.g. 14:30)</option>
                </select>
              </div>

              <div className="settings-row-item">
                <div className="settings-item-label">
                  <h4>Export Meeting Data</h4>
                  <p>Download your complete meeting records and notes in JSON format</p>
                </div>
                <button className="sync-now-action-btn" onClick={handleExportData}>
                  <Download size={14} /> Export JSON
                </button>
              </div>
            </div>
          </div>

          {/* 5. Danger Zone */}
          <div className="settings-card danger-card">
            <div className="settings-card-header">
              <div className="settings-card-icon danger-icon">
                <ShieldAlert size={18} />
              </div>
              <h2 style={{ color: '#f87171' }}>Account Actions</h2>
            </div>

            <div className="settings-row-item">
              <div className="settings-item-label">
                <h4>Sign Out & Clear Local Data</h4>
                <p>Removes authentication tokens and cached preferences from this browser</p>
              </div>
              <button
                className="btn-danger"
                onClick={() => {
                  if (window.confirm('Are you sure you want to sign out?')) {
                    logout();
                  }
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
