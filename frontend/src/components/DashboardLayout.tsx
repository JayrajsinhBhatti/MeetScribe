import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Video,
  Search,
  Bell,
  Settings,
  FileText,
  LayoutDashboard,
  CalendarDays,
  ChevronDown,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userName = user?.name || 'User';

  // Determine active nav from current path
  const getActiveNav = (): string => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path.startsWith('/meetings')) return 'meetings';
    if (path.startsWith('/calendar')) return 'calendar';
    if (path.startsWith('/notes')) return 'notes';
    if (path.startsWith('/settings')) return 'settings';
    return 'dashboard';
  };

  const activeNav = getActiveNav();

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { key: 'meetings', label: 'My Meetings', icon: Video, path: '/meetings' },
    { key: 'calendar', label: 'Calendar', icon: CalendarDays, path: '/calendar' },
    { key: 'notes', label: 'Notes & Summaries', icon: FileText, path: '/notes' },
    { key: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="dashboard-layout">
      {/* 1. LEFT SIDEBAR */}
      <aside className="dash-sidebar">
        <div>
          {/* Logo */}
          <div className="dash-brand" onClick={() => navigate('/dashboard')}>
            <div className="dash-brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  stroke="#ffffff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="dash-brand-name">MeetScribe</span>
          </div>

          {/* Navigation Links */}
          <ul className="sidebar-nav-list">
            {navItems.map((item) => (
              <li key={item.key}>
                <button
                  className={`sidebar-nav-item ${activeNav === item.key ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Status Cards */}
        <div className="sidebar-bottom-cards">
          {/* Google Calendar Connected */}
          <div className="calendar-status-card">
            <div className="status-dot-title">
              <span className="dot-green" />
              <span>Google Calendar Connected</span>
            </div>
            <div className="status-subtext">Synced via Google OAuth</div>
          </div>

          {/* Auto-sync Enabled */}
          <div className="auto-sync-card">
            <div className="auto-sync-icon">
              <RefreshCw size={15} />
            </div>
            <div>
              <div className="auto-sync-title">Auto-sync enabled</div>
              <div className="auto-sync-desc">Your meetings are always up to date.</div>
            </div>
          </div>

          {/* Version footer */}
          <div className="sidebar-footer-version">
            <Video size={13} /> MeetScribe v1.0.0
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTAINER */}
      <div className="dash-main-container">
        {/* Top Navbar */}
        <header className="dash-topbar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search meetings, notes, or participants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-shortcut-badge">⌘ K</span>
          </div>

          {/* Right Profile & Notifications */}
          <div className="topbar-right-actions">
            <button className="notification-bell-btn" title="Notifications">
              <Bell size={18} />
              <span className="notification-dot" />
            </button>

            <div style={{ position: 'relative' }}>
              <button
                className="user-profile-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={userName} className="user-avatar" />
                ) : (
                  <div className="user-avatar-fallback">{userName[0]}</div>
                )}
                <div className="user-meta-text">
                  <div className="user-name">{userName}</div>
                  <div className="user-role">Student</div>
                </div>
                <ChevronDown size={14} color="#64748b" />
              </button>

              {showUserDropdown && (
                <div className="user-dropdown-menu">
                  <button className="dropdown-item" onClick={() => { setShowUserDropdown(false); navigate('/settings'); }}>
                    <Settings size={14} /> Account Settings
                  </button>
                  <button className="dropdown-item logout" onClick={logout}>
                    <LogOut size={14} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
};
