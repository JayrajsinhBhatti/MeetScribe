import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Bell,
  Settings,
  FileText,
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  ExternalLink,
  X,
  CheckCircle,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calendarService, meetingService } from '../services/api';
import type { Meeting } from '../types/meeting';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedText, setLastSyncedText] = useState('2 minutes ago');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number>(25);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Modals
  const [selectedNoteMeeting, setSelectedNoteMeeting] = useState<Meeting | null>(null);
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newMeetLink, setNewMeetLink] = useState('https://meet.google.com/new');
  const [newDuration, setNewDuration] = useState(30);

  // Fetch meetings from API
  const loadMeetings = async () => {
    try {
      const res = await meetingService.list({ limit: 50 });
      setMeetings(res.items || []);
    } catch (err) {
      console.error('Failed to load meetings:', err);
    }
  };

  // Day 7 Auto-sync on dashboard load
  useEffect(() => {
    const initSync = async () => {
      try {
        setIsSyncing(true);
        await calendarService.syncMeetings(7, 30);
        setLastSyncedText('Just now');
      } catch (e) {
        console.warn('Initial calendar sync skipped or failed:', e);
      } finally {
        setIsSyncing(false);
        loadMeetings();
      }
    };
    initSync();
  }, []);

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      await calendarService.syncMeetings(7, 30);
      setLastSyncedText('Just now');
      await loadMeetings();
    } catch (err) {
      console.error('Manual sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;
    try {
      await meetingService.create({
        title: newTitle,
        scheduledAt: new Date(newDate).toISOString(),
        duration: Number(newDuration),
        meetLink: newMeetLink,
        status: 'upcoming',
        participants: [user?.email || 'you@example.com'],
      });
      // Immediately sync with Google Calendar after creation
      try {
        await calendarService.syncMeetings(7, 30);
      } catch (syncErr) {
        console.warn('Calendar sync after meeting creation failed:', syncErr);
      }
      // Immediately sync with Google Calendar after creation
      try {
        await calendarService.syncMeetings(7, 30);
      } catch (syncErr) {
        console.warn('Calendar sync after meeting creation failed:', syncErr);
      }
      setShowNewMeetingModal(false);
      setNewTitle('');
      setNewDate('');
      loadMeetings();
    } catch (err) {
      console.error('Error creating meeting:', err);
    }
  };

  // Filter meetings for UI
  const filteredMeetings = meetings.filter((m) =>
    searchQuery ? m.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const upcomingMeetings = filteredMeetings.filter((m) => m.status === 'upcoming');
  const pastMeetings = filteredMeetings.filter((m) => m.status !== 'upcoming');

const displayUpcoming = upcomingMeetings;

  const displayPast = pastMeetings.length > 0 ? pastMeetings : [
    {
      meetingId: 'past-1',
      userId: user?.userId || 'usr',
      title: 'Sprint Planning',
      scheduledAt: '2025-09-24T11:00:00Z',
      duration: 60,
      participants: ['1', '2', '3', '4', '5', '6'],
      meetLink: 'https://meet.google.com/xyz-demo',
      status: 'completed' as const,
    },
    {
      meetingId: 'past-2',
      userId: user?.userId || 'usr',
      title: 'HR Discussion',
      scheduledAt: '2025-09-23T16:00:00Z',
      duration: 30,
      participants: ['1', '2', '3', '4'],
      meetLink: 'https://meet.google.com/xyz-demo',
      status: 'completed' as const,
    },
    {
      meetingId: 'past-3',
      userId: user?.userId || 'usr',
      title: 'Client Call',
      scheduledAt: '2025-09-22T13:30:00Z',
      duration: 30,
      participants: ['1', '2', '3'],
      meetLink: 'https://meet.google.com/xyz-demo',
      status: 'completed' as const,
    },
    {
      meetingId: 'past-4',
      userId: user?.userId || 'usr',
      title: 'Project Update',
      scheduledAt: '2025-09-21T15:00:00Z',
      duration: 30,
      participants: ['1', '2', '3', '4', '5'],
      meetLink: 'https://meet.google.com/xyz-demo',
      status: 'completed' as const,
    },
    {
      meetingId: 'past-5',
      userId: user?.userId || 'usr',
      title: 'Weekly Sync',
      scheduledAt: '2025-09-19T10:00:00Z',
      duration: 30,
      participants: ['1', '2', '3', '4'],
      meetLink: 'https://meet.google.com/xyz-demo',
      status: 'missed' as const,
    },
  ];

  const userName = user?.name || 'Jayraj';
  const userFirstName = userName.split(' ')[0];

  return (
    <div className="dashboard-layout">
      {/* 1. LEFT SIDEBAR */}
      <aside className="dash-sidebar">
        <div>
          {/* Logo */}
          <div className="dash-brand">
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
            <li>
              <button
                className={`sidebar-nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
                onClick={() => { setActiveNav('dashboard'); navigate('/dashboard'); }}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-nav-item ${activeNav === 'meetings' ? 'active' : ''}`}
                onClick={() => { setActiveNav('meetings'); navigate('/meetings'); }}
              >
                <Video size={18} />
                <span>My Meetings</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-nav-item ${activeNav === 'calendar' ? 'active' : ''}`}
                onClick={() => { setActiveNav('calendar'); navigate('/calendar'); }}
              >
                <CalendarDays size={18} />
                <span>Calendar</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-nav-item ${activeNav === 'notes' ? 'active' : ''}`}
                onClick={() => { setActiveNav('notes'); navigate('/notes'); }}
              >
                <FileText size={18} />
                <span>Notes & Summaries</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-nav-item ${activeNav === 'settings' ? 'active' : ''}`}
                onClick={() => { setActiveNav('settings'); navigate('/settings'); }}
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>
            </li>
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
            <div className="status-subtext">Last synced {lastSyncedText}</div>
          </div>

          {/* Auto-sync Enabled Promo */}
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
                  <button className="dropdown-item" onClick={() => setActiveNav('settings')}>
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

        {/* Dashboard Body Grid (2 Columns) */}
        <div className="dash-body-grid">
          {/* Middle Column */}
          <div className="dash-middle-col">
            {/* Greeting Header Bar */}
            <div className="greeting-row">
              <div>
                <h1 className="greeting-title">Good morning, {userFirstName} 👋</h1>
                <p className="greeting-subtitle">Here's what's happening with your meetings today.</p>
              </div>

              {/* Date & Quick Sync Pill */}
              <div className="date-sync-pill">
                <div className="date-pill-icon">
                  <CalendarIcon size={16} />
                </div>
                <div className="date-pill-text">
                  <div className="date-pill-main">Thu, Sep 25, 2025</div>
                  <div className="date-pill-sub">
                    {displayUpcoming.length} meetings · 1 synced calendar
                  </div>
                </div>
                <button
                  className="date-pill-sync-btn"
                  onClick={handleManualSync}
                  title="Sync with Google Calendar"
                >
                  <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* UPCOMING MEETINGS SECTION */}
            <section className="dash-section-card">
              <div className="dash-section-header">
                <div className="section-header-left">
                  <h2 className="section-header-title">Upcoming Meetings</h2>
                  <span className="section-count-badge">{displayUpcoming.length}</span>
                </div>
                <a href="#all-upcoming" className="view-all-link">
                  View all →
                </a>
              </div>

              <div className="meeting-list-container">
                {displayUpcoming.map((item, index) => {
                  const attendeesCount = item.participants?.length || 3;
                  const firstLetter = item.title[0]?.toUpperCase() || 'M';
                  const isFirst = index === 0;

                  return (
                    <div className="meeting-card-row" key={item.meetingId}>
                      <div className="meeting-info-left">
                        {/* Leading Icon */}
                        {isFirst ? (
                          <div className="meeting-icon-box icon-meet-container">
                            <svg width="22" height="22" viewBox="0 0 48 48">
                              <path fill="#00832d" d="M37 24v-8.5l-8-6v29l8-6V24z" />
                              <path fill="#0066da" d="M12 37h17V11H12c-2.2 0-4 1.8-4 4v18c0 2.2 1.8 4 4 4z" />
                              <path fill="#e53935" d="M29 37h9c1.7 0 3-1.3 3-3V14c0-1.7-1.3-3-3-3h-9v26z" />
                            </svg>
                          </div>
                        ) : (
                          <div
                            className={`meeting-icon-box ${
                              index === 1 ? 'icon-badge-p' : 'icon-badge-m'
                            }`}
                          >
                            {firstLetter}
                          </div>
                        )}

                        <div className="meeting-title-box">
                          <div className="meeting-row-title">{item.title}</div>
                          <div className="meeting-meta-row">
                            <span className="meta-item">
                              <Clock size={13} />{' '}
                              {isFirst
                                ? '10:00 AM - 10:30 AM · Today'
                                : index === 1
                                ? '02:00 PM - 03:00 PM · Today'
                                : '04:30 PM - 05:15 PM · Today'}
                            </span>
                            <span className="meta-item">
                              <Users size={13} /> {attendeesCount} participants
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="meeting-action-right">
                        <a
                          href={item.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-join-meet"
                        >
                          <Video size={14} /> Join
                        </a>
                        <button className="btn-options-dots" onClick={() => console.log('Options for', item.meetingId)}>
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* PAST MEETINGS SECTION */}
            <section className="dash-section-card">
              <div className="dash-section-header">
                <h2 className="section-header-title">Past Meetings</h2>
                <a href="#all-past" className="view-all-link">
                  View all →
                </a>
              </div>

              <div className="meeting-list-container">
                {displayPast.map((item, index) => {
                  const attendeesCount = item.participants?.length || 4;
                  const firstLetter = item.title[0]?.toUpperCase() || 'M';
                  const isMeetIcon = index === 0 || index === 2;
                  const isMissed = item.status === 'missed';

                  return (
                    <div className="meeting-card-row" key={item.meetingId}>
                      <div className="meeting-info-left">
                        {isMeetIcon ? (
                          <div className="meeting-icon-box icon-meet-container">
                            <svg width="22" height="22" viewBox="0 0 48 48">
                              <path fill="#00832d" d="M37 24v-8.5l-8-6v29l8-6V24z" />
                              <path fill="#0066da" d="M12 37h17V11H12c-2.2 0-4 1.8-4 4v18c0 2.2 1.8 4 4 4z" />
                              <path fill="#e53935" d="M29 37h9c1.7 0 3-1.3 3-3V14c0-1.7-1.3-3-3-3h-9v26z" />
                            </svg>
                          </div>
                        ) : (
                          <div
                            className={`meeting-icon-box ${
                              index === 1
                                ? 'icon-badge-h'
                                : index === 3
                                ? 'icon-badge-p'
                                : 'icon-badge-w'
                            }`}
                          >
                            {firstLetter}
                          </div>
                        )}

                        <div className="meeting-title-box">
                          <div className="meeting-row-title">{item.title}</div>
                          <div className="meeting-meta-row">
                            <span className="meta-item">
                              <Clock size={13} />{' '}
                              {(() => {
                                const start = new Date(item.scheduledAt);
                                const time = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                const date = start.toLocaleDateString();
                                return `${date} · ${time}`;
                              })()}
                            </span>
                            <span className="meta-item">
                              <Users size={13} /> {attendeesCount} participants
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="meeting-action-right">
                        {isMissed ? (
                          <span className="status-badge-missed">★ Missed</span>
                        ) : (
                          <span className="status-badge-completed">Completed</span>
                        )}

                        <button
                          className="btn-view-note"
                          onClick={() => setSelectedNoteMeeting(item)}
                        >
                          View Note
                        </button>

                        <button className="btn-options-dots" onClick={() => console.log('Options for', item.meetingId)}>
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* 3. RIGHT COLUMN WIDGETS */}
          <div className="dash-right-col">
            {/* Calendar Widget */}
            <div className="widget-card">
              <div className="calendar-widget-header">
                <span className="cal-month-title">September 2025</span>
                <div className="cal-nav-arrows">
                  <button className="cal-nav-btn">
                    <ChevronLeft size={16} />
                  </button>
                  <button className="cal-nav-btn">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="cal-weekdays-row">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              <div className="cal-days-grid">
                {/* Previous month day */}
                <div className="cal-day-cell muted">31</div>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map(
                  (day) => {
                    const isSelected = selectedCalendarDate === day;
                    const hasMeeting = day === 23 || day === 24 || day === 25 || day === 26;

                    return (
                      <div
                        key={day}
                        className={`cal-day-cell ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedCalendarDate(day)}
                      >
                        <span>{day}</span>
                        {hasMeeting && <span className="cal-has-event-dot" />}
                      </div>
                    );
                  }
                )}
                {/* Next month days */}
                <div className="cal-day-cell muted">1</div>
                <div className="cal-day-cell muted">2</div>
                <div className="cal-day-cell muted">3</div>
                <div className="cal-day-cell muted">4</div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="widget-card">
              <h3 className="quick-actions-title">Quick Actions</h3>

              <div className="quick-action-item" onClick={handleManualSync}>
                <div className="qa-left">
                  <div className="qa-icon-circle">
                    <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
                  </div>
                  <div>
                    <div className="qa-text-title">Sync Calendar</div>
                    <div className="qa-text-desc">Fetch latest meetings from Google Calendar</div>
                  </div>
                </div>
                <ChevronRight size={15} color="#94a3b8" />
              </div>

              <div className="quick-action-item" onClick={() => setShowNewMeetingModal(true)}>
                <div className="qa-left">
                  <div className="qa-icon-circle">
                    <Plus size={16} />
                  </div>
                  <div>
                    <div className="qa-text-title">New Meeting</div>
                    <div className="qa-text-desc">Schedule a new meeting</div>
                  </div>
                </div>
                <ChevronRight size={15} color="#94a3b8" />
              </div>

              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="quick-action-item"
              >
                <div className="qa-left">
                  <div className="qa-icon-circle">
                    <CalendarDays size={16} />
                  </div>
                  <div>
                    <div className="qa-text-title">View Calendar</div>
                    <div className="qa-text-desc">Open in Google Calendar</div>
                  </div>
                </div>
                <ChevronRight size={15} color="#94a3b8" />
              </a>
            </div>

            {/* AI-Powered Summaries Promotion Card */}
            <div className="ai-promo-card">
              <div className="ai-promo-icon">
                <Sparkles size={20} />
              </div>
              <h3 className="ai-promo-title">AI-Powered Summaries</h3>
              <p className="ai-promo-desc">
                Get concise meeting notes, action items and key takeaways — automatically.
              </p>
              <button
                className="ai-promo-btn"
                onClick={() => setSelectedNoteMeeting(displayPast[0])}
              >
                Learn more →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. VIEW NOTE MODAL */}
      {selectedNoteMeeting && (
        <div className="modal-overlay" onClick={() => setSelectedNoteMeeting(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {selectedNoteMeeting.title}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>AI Meeting Summary & Notes</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNoteMeeting(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #eef2f6' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  📌 Executive Summary
                </h4>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  The team discussed the upcoming Q4 deliverables, finalized sprint velocity metrics, and resolved technical blockers on the Google OAuth refresh token cycle.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                  ✅ Key Action Items
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}>
                    <CheckCircle size={15} color="#16a34a" /> Jayraj: Complete audio capture WebRTC module by Monday.
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}>
                    <CheckCircle size={15} color="#16a34a" /> Team: Review Google Speech-to-Text streaming quota.
                  </li>
                </ul>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <a
                  href={selectedNoteMeeting.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-join-meet"
                  style={{ textDecoration: 'none' }}
                >
                  <Video size={14} /> Join Meeting <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SCHEDULE NEW MEETING MODAL */}
      {showNewMeetingModal && (
        <div className="modal-overlay" onClick={() => setShowNewMeetingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Schedule New Meeting
              </h3>
              <button onClick={() => setShowNewMeetingModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Meeting Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sprint Architecture Review"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Google Meet Link
                </label>
                <input
                  type="url"
                  required
                  value={newMeetLink}
                  onChange={(e) => setNewMeetLink(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewMeetingModal(false)}
                  style={{ background: '#f1f5f9', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Create Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
