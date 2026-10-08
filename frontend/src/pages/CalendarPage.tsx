import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Video,
  Clock,
  FileText,
  X,
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { meetingService, calendarService } from '../services/api';
import type { Meeting } from '../types/meeting';
import './CalendarPage.css';

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Modal for new meeting
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDateStr, setNewDateStr] = useState('');
  const [newDuration, setNewDuration] = useState(30);
  const [newMeetLink, setNewMeetLink] = useState('https://meet.google.com/new');

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const res = await meetingService.list({ skip: 0, limit: 100 });
      setMeetings(res.items || []);
    } catch (err) {
      console.error('Failed to load meetings for calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      await calendarService.syncMeetings(30, 60);
      await loadMeetings();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to format Date to YYYY-MM-DD
  const formatYMD = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const selectedDateStr = formatYMD(selectedDate);
  const todayDateStr = formatYMD(new Date());

  // Filter meetings for selected date
  const selectedDateMeetings = meetings.filter((m) => {
    const mDate = new Date(m.scheduledAt);
    return formatYMD(mDate) === selectedDateStr;
  });

  // Map meetings by date string for preview pills
  const meetingsByDate: Record<string, Meeting[]> = {};
  meetings.forEach((m) => {
    const dStr = formatYMD(new Date(m.scheduledAt));
    if (!meetingsByDate[dStr]) meetingsByDate[dStr] = [];
    meetingsByDate[dStr].push(m);
  });

  // Open modal pre-filled with selected date
  const handleOpenScheduleModal = () => {
    const defaultTime = `${selectedDateStr}T10:00`;
    setNewDateStr(defaultTime);
    setNewTitle('');
    setShowNewModal(true);
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await meetingService.create({
        title: newTitle.trim(),
        scheduledAt: new Date(newDateStr || `${selectedDateStr}T10:00`).toISOString(),
        duration: Number(newDuration),
        meetLink: newMeetLink || 'https://meet.google.com/new',
        status: 'upcoming',
        participants: [],
      });
      setShowNewModal(false);
      loadMeetings();
    } catch (err) {
      console.error('Failed to create meeting:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="calendar-page">
        {/* Header */}
        <div className="calendar-page-header">
          <div>
            <h1>Calendar</h1>
            <p>View your schedule, track meetings density, and manage upcoming syncs</p>
          </div>
          <div className="calendar-header-actions">
            <button
              className="cal-sync-btn"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw size={15} className={syncing ? 'spin' : ''} />
              <span>{syncing ? 'Syncing...' : 'Sync Calendar'}</span>
            </button>
            <button
              className="cal-new-btn"
              onClick={handleOpenScheduleModal}
            >
              <Plus size={16} />
              <span>Schedule Meeting</span>
            </button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="calendar-controls-bar">
          <div className="cal-nav-group">
            <button className="cal-nav-btn" onClick={prevMonth} title="Previous Month">
              <ChevronLeft size={16} />
            </button>
            <div className="cal-month-title">
              {monthNames[month]} {year}
            </div>
            <button className="cal-nav-btn" onClick={nextMonth} title="Next Month">
              <ChevronRight size={16} />
            </button>
            <button className="cal-today-btn" onClick={jumpToToday}>
              Today
            </button>
          </div>

          <div className="cal-view-modes">
            <button
              className={`cal-view-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button
              className={`cal-view-mode-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button
              className={`cal-view-mode-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
          </div>
        </div>

        {/* Split Layout: Grid + Schedule */}
        <div className="calendar-layout-split">
          {/* Calendar Month Grid */}
          <div className="calendar-grid-card">
            <div className="cal-weekdays-row">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="cal-days-grid">
              {/* Previous month trailing days */}
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => {
                const dayNum = daysInPrevMonth - firstDayOfMonth + idx + 1;
                return (
                  <div key={`prev-${idx}`} className="cal-day-cell other-month">
                    <span className="cal-day-num">{dayNum}</span>
                  </div>
                );
              })}

              {/* Current month days */}
              {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const cellDate = new Date(year, month, dayNum);
                const cellDateStr = formatYMD(cellDate);
                const isToday = cellDateStr === todayDateStr;
                const isSelected = cellDateStr === selectedDateStr;
                const dayMeetings = meetingsByDate[cellDateStr] || [];

                return (
                  <div
                    key={`day-${dayNum}`}
                    className={`cal-day-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedDate(cellDate)}
                  >
                    <span className="cal-day-num">{dayNum}</span>

                    <div className="cal-day-meetings-preview">
                      {dayMeetings.slice(0, 2).map((m) => (
                        <div
                          key={m.meetingId}
                          className={`cal-meeting-pill ${m.status}`}
                          title={m.title}
                        >
                          {m.title}
                        </div>
                      ))}
                      {dayMeetings.length > 2 && (
                        <span className="cal-more-dots">
                          +{dayMeetings.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Schedule Side Panel */}
          <div className="calendar-side-panel">
            <div className="side-panel-header">
              <div className="side-panel-date">
                {selectedDate.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <span className="side-panel-count">
                {selectedDateMeetings.length} {selectedDateMeetings.length === 1 ? 'Meeting' : 'Meetings'}
              </span>
            </div>

            <div className="side-panel-meetings-list">
              {selectedDateMeetings.length === 0 ? (
                <div className="empty-schedule">
                  <CalendarDays size={40} strokeWidth={1.5} color="#475569" />
                  <p>No meetings scheduled for this date</p>
                  <button
                    className="cal-today-btn"
                    onClick={handleOpenScheduleModal}
                  >
                    + Schedule on this Day
                  </button>
                </div>
              ) : (
                selectedDateMeetings.map((meeting) => (
                  <div key={meeting.meetingId} className="cal-event-card">
                    <div className="cal-event-time">
                      <Clock size={13} />
                      <span>
                        {new Date(meeting.scheduledAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        ({meeting.duration || 30}m)
                      </span>
                    </div>

                    <div className="cal-event-title">{meeting.title}</div>

                    <div className="cal-event-actions">
                      {meeting.meetLink && (
                        <a
                          href={meeting.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="cal-join-btn"
                        >
                          <Video size={13} /> Join
                        </a>
                      )}
                      <button
                        className="cal-notes-btn"
                        onClick={() => navigate(`/notes?meetingId=${meeting.meetingId}`)}
                      >
                        <FileText size={13} /> Notes
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Schedule Meeting Modal */}
        {showNewModal && (
          <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Schedule New Meeting</h2>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowNewModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateMeeting}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Meeting Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Sprint Planning, Client Demo"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Date & Time</label>
                    <input
                      type="datetime-local"
                      value={newDateStr}
                      onChange={(e) => setNewDateStr(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Duration (minutes)</label>
                    <select
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>1 Hour</option>
                      <option value={90}>1.5 Hours</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Meet Link</label>
                    <input
                      type="url"
                      value={newMeetLink}
                      onChange={(e) => setNewMeetLink(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowNewModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
