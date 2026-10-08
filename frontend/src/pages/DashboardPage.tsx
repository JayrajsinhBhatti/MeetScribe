import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  RefreshCw,
  FileText,
  CalendarDays,
  Sparkles,
  ExternalLink,
  X,
  CheckCircle,
  Copy,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calendarService, meetingService } from '../services/api';
import type { Meeting } from '../types/meeting';
import { DashboardLayout } from '../components/DashboardLayout';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number>(new Date().getDate());
  const [activeDropdownMeetingId, setActiveDropdownMeetingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdownMeetingId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    showToast('Meeting link copied to clipboard!');
    setActiveDropdownMeetingId(null);
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;
    try {
      await meetingService.delete(meetingId);
      showToast('Meeting deleted successfully');
      setActiveDropdownMeetingId(null);
      loadMeetings();
    } catch (err) {
      console.error('Failed to delete meeting:', err);
    }
  };

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
      try {
        await calendarService.syncMeetings(7, 30);
      } catch (syncErr) {
        console.warn('Calendar sync after meeting creation failed:', syncErr);
      }
      setShowNewMeetingModal(false);
      setNewTitle('');
      setNewDate('');
      showToast('Meeting scheduled & pushed to Google Calendar!');
      loadMeetings();
    } catch (err) {
      console.error('Error creating meeting:', err);
    }
  };

  // Filter meetings for UI
  const filteredMeetings = meetings;

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

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Dynamic mini calendar calculations
  const miniYear = today.getFullYear();
  const miniMonth = today.getMonth();
  const miniDaysInMonth = new Date(miniYear, miniMonth + 1, 0).getDate();
  const miniFirstDay = new Date(miniYear, miniMonth, 1).getDay();
  const miniDaysInPrevMonth = new Date(miniYear, miniMonth, 0).getDate();

  // Find dates in the current month with meetings
  const meetingDaysSet = new Set(
    meetings
      .filter((m) => {
        const d = new Date(m.scheduledAt);
        return d.getFullYear() === miniYear && d.getMonth() === miniMonth;
      })
      .map((m) => new Date(m.scheduledAt).getDate())
  );

  return (
    <DashboardLayout>
      {/* Dashboard Body Grid (2 Columns) */}
      <div className="dash-body-grid">
        {/* Middle Column */}
        <div className="dash-middle-col">
          {toastMsg && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <CheckCircle size={16} />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Greeting Header Bar */}
          <div className="greeting-row">
            <div>
              <h1 className="greeting-title">{greeting}, {userFirstName} 👋</h1>
              <p className="greeting-subtitle">Here's what's happening with your meetings today.</p>
            </div>

            {/* Date & Quick Sync Pill */}
            <div className="date-sync-pill">
              <div className="date-pill-icon">
                <CalendarIcon size={16} />
              </div>
              <div className="date-pill-text">
                <div className="date-pill-main">{dateStr}</div>
                <div className="date-pill-sub">
                  {displayUpcoming.length} upcoming · {meetings.length} total
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
              <button className="view-all-link" onClick={() => navigate('/meetings')}>
                View all →
              </button>
            </div>

            <div className="meeting-list-container">
              {displayUpcoming.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
                  <CalendarDays size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p style={{ fontSize: '14px', fontWeight: 600 }}>No upcoming meetings</p>
                  <p style={{ fontSize: '12px' }}>Sync your calendar or schedule a new meeting.</p>
                </div>
              )}
              {displayUpcoming.slice(0, 5).map((item, index) => {
                const attendeesCount = item.participants?.length || 1;
                const firstLetter = item.title[0]?.toUpperCase() || 'M';
                const start = new Date(item.scheduledAt);
                const time = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const end = new Date(start.getTime() + (item.duration || 30) * 60000);
                const endTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isToday = start.toDateString() === today.toDateString();
                const dateLabel = isToday ? 'Today' : start.toLocaleDateString([], { month: 'short', day: 'numeric' });

                return (
                  <div className="meeting-card-row" key={item.meetingId}>
                    <div className="meeting-info-left">
                      <div className={`meeting-icon-box ${index === 0 ? 'icon-meet-container' : index % 2 === 0 ? 'icon-badge-m' : 'icon-badge-p'}`}>
                        {index === 0 ? (
                          <svg width="22" height="22" viewBox="0 0 48 48">
                            <path fill="#00832d" d="M37 24v-8.5l-8-6v29l8-6V24z" />
                            <path fill="#0066da" d="M12 37h17V11H12c-2.2 0-4 1.8-4 4v18c0 2.2 1.8 4 4 4z" />
                            <path fill="#e53935" d="M29 37h9c1.7 0 3-1.3 3-3V14c0-1.7-1.3-3-3-3h-9v26z" />
                          </svg>
                        ) : firstLetter}
                      </div>
                      <div className="meeting-title-box">
                        <div className="meeting-row-title">{item.title}</div>
                        <div className="meeting-meta-row">
                          <span className="meta-item">
                            <Clock size={13} /> {time} – {endTime} · {dateLabel}
                          </span>
                          <span className="meta-item">
                            <Users size={13} /> {attendeesCount} participants
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="meeting-action-right">
                      <a href={item.meetLink} target="_blank" rel="noopener noreferrer" className="btn-join-meet">
                        <Video size={14} /> Join
                      </a>
                      
                      {/* 3-Dot Options Dropdown */}
                      <div className="meeting-options-wrapper">
                        <button
                          className={`btn-options-dots ${activeDropdownMeetingId === item.meetingId ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownMeetingId(
                              activeDropdownMeetingId === item.meetingId ? null : item.meetingId
                            );
                          }}
                          title="More options"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeDropdownMeetingId === item.meetingId && (
                          <div
                            className="meeting-dropdown-menu"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.meetLink && (
                              <button
                                className="meeting-dropdown-item"
                                onClick={() => handleCopyLink(item.meetLink)}
                              >
                                <Copy size={13} /> Copy Meet Link
                              </button>
                            )}
                            <button
                              className="meeting-dropdown-item"
                              onClick={() => {
                                setActiveDropdownMeetingId(null);
                                navigate(`/notes?meetingId=${item.meetingId}`);
                              }}
                            >
                              <FileText size={13} /> View Notes
                            </button>
                            <button
                              className="meeting-dropdown-item"
                              onClick={() => {
                                setActiveDropdownMeetingId(null);
                                navigate('/calendar');
                              }}
                            >
                              <CalendarDays size={13} /> View in Calendar
                            </button>
                            <button
                              className="meeting-dropdown-item danger"
                              onClick={() => handleDeleteMeeting(item.meetingId)}
                            >
                              <Trash2 size={13} /> Delete Meeting
                            </button>
                          </div>
                        )}
                      </div>
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
              <button className="view-all-link" onClick={() => navigate('/meetings')}>
                View all →
              </button>
            </div>

            <div className="meeting-list-container">
              {displayPast.map((item, index) => {
                const attendeesCount = item.participants?.length || 1;
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
                        <div className={`meeting-icon-box ${index === 1 ? 'icon-badge-h' : index === 3 ? 'icon-badge-p' : 'icon-badge-w'}`}>
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
                      <button className="btn-view-note" onClick={() => setSelectedNoteMeeting(item)}>
                        View Note
                      </button>

                      {/* 3-Dot Options Dropdown */}
                      <div className="meeting-options-wrapper">
                        <button
                          className={`btn-options-dots ${activeDropdownMeetingId === item.meetingId ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownMeetingId(
                              activeDropdownMeetingId === item.meetingId ? null : item.meetingId
                            );
                          }}
                          title="More options"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeDropdownMeetingId === item.meetingId && (
                          <div
                            className="meeting-dropdown-menu"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.meetLink && (
                              <button
                                className="meeting-dropdown-item"
                                onClick={() => handleCopyLink(item.meetLink)}
                              >
                                <Copy size={13} /> Copy Meet Link
                              </button>
                            )}
                            <button
                              className="meeting-dropdown-item"
                              onClick={() => {
                                setActiveDropdownMeetingId(null);
                                navigate(`/notes?meetingId=${item.meetingId}`);
                              }}
                            >
                              <FileText size={13} /> View Notes
                            </button>
                            <button
                              className="meeting-dropdown-item"
                              onClick={() => {
                                setActiveDropdownMeetingId(null);
                                navigate('/calendar');
                              }}
                            >
                              <CalendarDays size={13} /> View in Calendar
                            </button>
                            <button
                              className="meeting-dropdown-item danger"
                              onClick={() => handleDeleteMeeting(item.meetingId)}
                            >
                              <Trash2 size={13} /> Delete Meeting
                            </button>
                          </div>
                        )}
                      </div>
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
            <div className="mini-cal-header">
              <span className="mini-cal-month-title">
                {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <div className="mini-cal-nav-arrows">
                <button className="mini-cal-nav-btn"><ChevronLeft size={16} /></button>
                <button className="mini-cal-nav-btn"><ChevronRight size={16} /></button>
              </div>
            </div>

            <div className="mini-cal-weekdays-row">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span>
              <span>Thu</span><span>Fri</span><span>Sat</span>
            </div>

            <div className="mini-cal-days-grid">
              {Array.from({ length: miniFirstDay }).map((_, idx) => (
                <div key={`prev-${idx}`} className="mini-cal-day-cell muted">
                  {miniDaysInPrevMonth - miniFirstDay + idx + 1}
                </div>
              ))}
              {Array.from({ length: miniDaysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const isSelected = selectedCalendarDate === day;
                const hasMeeting = meetingDaysSet.has(day);
                return (
                  <div
                    key={`curr-${day}`}
                    className={`mini-cal-day-cell ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedCalendarDate(day)}
                  >
                    <span>{day}</span>
                    {hasMeeting && <span className="mini-cal-event-dot" />}
                  </div>
                );
              })}
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

            <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="quick-action-item">
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
            <button className="ai-promo-btn" onClick={() => navigate('/notes')}>
              Learn more →
            </button>
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
              <button onClick={() => setSelectedNoteMeeting(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
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
                <a href={selectedNoteMeeting.meetLink} target="_blank" rel="noopener noreferrer" className="btn-join-meet" style={{ textDecoration: 'none' }}>
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Meeting Title</label>
                <input type="text" required placeholder="e.g. Sprint Architecture Review" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Date & Time</label>
                <input type="datetime-local" required value={newDate} onChange={(e) => setNewDate(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Duration (Minutes)</label>
                <input type="number" min="5" max="300" value={newDuration} onChange={(e) => setNewDuration(Number(e.target.value))} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Google Meet Link</label>
                <input type="url" required value={newMeetLink} onChange={(e) => setNewMeetLink(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowNewMeetingModal(false)} style={{ background: '#f1f5f9', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Create Meeting</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
