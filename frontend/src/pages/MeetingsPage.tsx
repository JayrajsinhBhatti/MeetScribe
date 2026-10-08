import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Clock,
  Users,
  Video,
  Trash2,
  Copy,
  CalendarDays,
  X,
  RefreshCw,
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { meetingService } from '../services/api';
import type { Meeting } from '../types/meeting';
import './MeetingsPage.css';

type SubTab = 'all' | 'upcoming' | 'completed' | 'missed';

export const MeetingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SubTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newMeetLink, setNewMeetLink] = useState('https://meet.google.com/new');
  const [newDuration, setNewDuration] = useState(30);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const limit = 20;

  const loadMeetings = async (resetSkip = false) => {
    try {
      setLoading(true);
      const currentSkip = resetSkip ? 0 : skip;
      const params: Record<string, string | number> = { skip: currentSkip, limit };
      if (activeTab !== 'all') params.status = activeTab;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await meetingService.list(params as any);
      if (resetSkip) {
        setMeetings(res.items || []);
        setSkip(0);
      } else if (currentSkip > 0) {
        setMeetings((prev) => [...prev, ...(res.items || [])]);
      } else {
        setMeetings(res.items || []);
      }
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings(true);
  }, [activeTab, searchQuery]);

  const handleLoadMore = () => {
    const nextSkip = skip + limit;
    setSkip(nextSkip);
  };

  useEffect(() => {
    if (skip > 0) loadMeetings();
  }, [skip]);

  const handleCreate = async (e: React.FormEvent) => {
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
      setShowNewModal(false);
      setNewTitle('');
      setNewDate('');
      setNewDuration(30);
      setNewMeetLink('https://meet.google.com/new');
      loadMeetings(true);
    } catch (err) {
      console.error('Error creating meeting:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this meeting and all associated data?')) return;
    try {
      await meetingService.delete(id);
      setMeetings((prev) => prev.filter((m) => m.meetingId !== id));
    } catch (err) {
      console.error('Error deleting meeting:', err);
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
  };

  // Count per tab
  const allCount = total;
  const upcomingCount = meetings.filter((m) => m.status === 'upcoming').length;
  const completedCount = meetings.filter((m) => m.status === 'completed').length;
  const missedCount = meetings.filter((m) => m.status === 'missed').length;

  const tabs: { key: SubTab; label: string; count: number }[] = [
    { key: 'all', label: 'All Meetings', count: allCount },
    { key: 'upcoming', label: 'Upcoming', count: upcomingCount },
    { key: 'completed', label: 'Completed', count: completedCount },
    { key: 'missed', label: 'Missed', count: missedCount },
  ];

  const getIconClass = (status: string) => {
    switch (status) {
      case 'upcoming': return 'icon-upcoming';
      case 'completed': return 'icon-completed';
      case 'missed': return 'icon-missed';
      default: return 'icon-upcoming';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming': return <span className="status-badge-upcoming">Upcoming</span>;
      case 'completed': return <span className="status-badge-completed">Completed</span>;
      case 'missed': return <span className="status-badge-missed">Missed</span>;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="meetings-page">
        {/* Header */}
        <div className="meetings-page-header">
          <h1>My Meetings</h1>
          <button className="btn-new-meeting" onClick={() => setShowNewModal(true)}>
            <Plus size={18} /> New Meeting
          </button>
        </div>

        {/* Filter Bar */}
        <div className="meetings-filter-bar">
          <div className="meetings-sub-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`meetings-sub-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                <span className="tab-count-badge">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="meetings-search-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="meetings-search-input"
              placeholder="Search by title or participant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Meeting List */}
        <div className="meetings-list-card">
          {loading && meetings.length === 0 ? (
            <div className="meetings-empty-state">
              <RefreshCw size={40} className="animate-spin" />
              <h3>Loading meetings...</h3>
            </div>
          ) : meetings.length === 0 ? (
            <div className="meetings-empty-state">
              <CalendarDays size={48} />
              <h3>
                {activeTab === 'all'
                  ? 'No meetings found'
                  : `No ${activeTab} meetings`}
              </h3>
              <p>
                {activeTab === 'upcoming'
                  ? 'Schedule a new meeting or sync your Google Calendar.'
                  : 'Try adjusting your filters or search query.'}
              </p>
            </div>
          ) : (
            <>
              {meetings.map((item) => {
                const start = new Date(item.scheduledAt);
                const time = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const end = new Date(start.getTime() + (item.duration || 30) * 60000);
                const endTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const attendeesCount = item.participants?.length || 0;
                const firstLetter = item.title[0]?.toUpperCase() || 'M';

                return (
                  <div className="meeting-card-row" key={item.meetingId}>
                    <div className="meeting-info-left">
                      <div className={`meeting-icon-box ${getIconClass(item.status)}`}>
                        {firstLetter}
                      </div>
                      <div className="meeting-title-box">
                        <div className="meeting-row-title">{item.title}</div>
                        <div className="meeting-meta-row">
                          <span className="meta-item">
                            <Clock size={13} /> {dateStr} · {time} – {endTime}
                          </span>
                          {attendeesCount > 0 && (
                            <span className="meta-item">
                              <Users size={13} /> {attendeesCount} participant{attendeesCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="meeting-action-right">
                      {getStatusBadge(item.status)}

                      {item.status === 'upcoming' && (
                        <a href={item.meetLink} target="_blank" rel="noopener noreferrer" className="btn-join-meet">
                          <Video size={14} /> Join
                        </a>
                      )}

                      {item.status === 'completed' && (
                        <button className="btn-view-note" onClick={() => navigate(`/notes`)}>
                          View Note
                        </button>
                      )}

                      <button className="btn-icon-action" title="Copy Meet Link" onClick={() => handleCopyLink(item.meetLink)}>
                        <Copy size={14} />
                      </button>
                      <button className="btn-icon-action" title="Delete Meeting" onClick={() => handleDelete(item.meetingId)} style={{ borderColor: '#fecaca', color: '#ef4444' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {meetings.length < total && (
                <div className="load-more-row">
                  <button className="btn-load-more" onClick={handleLoadMore}>
                    Load more meetings ({total - meetings.length} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Schedule New Meeting</h3>
              <button onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Meeting Title</label>
                <input type="text" required placeholder="e.g. Sprint Review" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
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
                <button type="button" onClick={() => setShowNewModal(false)} style={{ background: '#f1f5f9', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Create Meeting</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
