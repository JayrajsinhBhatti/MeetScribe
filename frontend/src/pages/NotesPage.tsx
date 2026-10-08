import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Sparkles,
  CheckCircle2,
  Circle,
  BrainCircuit,
  ListTodo,
  FileCheck,
  AlignLeft,
  Copy,
  Check,
  Clock,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Download,
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { meetingService } from '../services/api';
import type { Meeting, AIOutput, TranscriptSegment } from '../types/meeting';
import './NotesPage.css';

type DetailSubTab = 'summary' | 'actions' | 'decisions' | 'flashcards' | 'document' | 'transcript';

export const NotesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlMeetingId = searchParams.get('meetingId');

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'processed'>('all');

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [currentOutput, setCurrentOutput] = useState<AIOutput | null>(null);
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([]);
  const [loadingOutput, setLoadingOutput] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<DetailSubTab>('summary');

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Copy state
  const [copied, setCopied] = useState(false);

  // Load meetings
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const res = await meetingService.list({ skip: 0, limit: 50 });
        const items = res.items || [];
        setMeetings(items);

        if (urlMeetingId) {
          const matched = items.find((m) => m.meetingId === urlMeetingId);
          if (matched) setSelectedMeeting(matched);
          else if (items.length > 0) setSelectedMeeting(items[0]);
        } else if (items.length > 0) {
          setSelectedMeeting(items[0]);
        }
      } catch (err) {
        console.error('Failed to load meetings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [urlMeetingId]);

  // Load AI output & transcript for selected meeting
  useEffect(() => {
    if (!selectedMeeting) return;

    const fetchDetail = async () => {
      try {
        setLoadingOutput(true);
        setCurrentCardIndex(0);
        setIsCardFlipped(false);

        // Fetch outputs
        const out = await meetingService.getOutputs(selectedMeeting.meetingId);
        setCurrentOutput(out);

        // Fetch transcript
        const tr = await meetingService.getTranscript(selectedMeeting.meetingId);
        if (tr && tr.segments) {
          setTranscriptSegments(tr.segments);
        } else {
          setTranscriptSegments([]);
        }
      } catch (err) {
        console.error('Failed to fetch meeting outputs:', err);
        setCurrentOutput(null);
      } finally {
        setLoadingOutput(false);
      }
    };

    fetchDetail();
  }, [selectedMeeting]);

  // Generate / refresh AI notes
  const handleGenerateAI = async () => {
    if (!selectedMeeting) return;
    try {
      setGenerating(true);
      const out = await meetingService.processMeeting(selectedMeeting.meetingId);
      setCurrentOutput(out);

      // Refresh transcript
      const tr = await meetingService.getTranscript(selectedMeeting.meetingId);
      if (tr && tr.segments) setTranscriptSegments(tr.segments);
    } catch (err) {
      console.error('Failed to process AI notes:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Toggle action item completion
  const handleToggleAction = async (idx: number) => {
    if (!selectedMeeting || !currentOutput) return;
    try {
      const updated = await meetingService.toggleActionItem(selectedMeeting.meetingId, idx);
      setCurrentOutput(updated);
    } catch (err) {
      console.error('Failed to toggle action item:', err);
    }
  };

  // Copy full document
  const handleCopyDocument = () => {
    if (!currentOutput) return;
    navigator.clipboard.writeText(currentOutput.meetingDocument || currentOutput.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download markdown
  const handleDownloadMarkdown = () => {
    if (!currentOutput || !selectedMeeting) return;
    const blob = new Blob([currentOutput.meetingDocument], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedMeeting.title.toLowerCase().replace(/\s+/g, '_')}_notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter meetings
  const filteredMeetings = meetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.participants && m.participants.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="notes-page">
        {/* Header */}
        <div className="notes-page-header">
          <div>
            <h1>Notes & Summaries</h1>
            <p>Explore AI-generated executive summaries, action items, key decisions, and study flashcards</p>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="notes-filter-bar">
          <div className="notes-search-wrapper">
            <Search size={15} className="notes-search-icon" />
            <input
              type="text"
              placeholder="Search meetings by title or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="notes-filter-pills">
            <button
              className={`notes-pill-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All Meetings ({meetings.length})
            </button>
          </div>
        </div>

        {/* Split View */}
        <div className="notes-layout-split">
          {/* Left Column: Meeting List */}
          <div className="notes-list-column">
            {loading ? (
              <div className="empty-notes-view" style={{ padding: '40px 20px' }}>
                <Sparkles size={28} className="spin" color="#818cf8" />
                <p style={{ marginTop: 12 }}>Loading meetings...</p>
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="empty-notes-view">
                <FileText size={36} color="#475569" />
                <h3>No meetings found</h3>
                <p>Try searching for a different keyword or sync your calendar.</p>
              </div>
            ) : (
              filteredMeetings.map((m) => {
                const isSelected = selectedMeeting?.meetingId === m.meetingId;
                return (
                  <div
                    key={m.meetingId}
                    className={`note-item-card ${isSelected ? 'is-active' : ''}`}
                    onClick={() => setSelectedMeeting(m)}
                  >
                    <div className="note-card-header">
                      <div className="note-card-title">{m.title}</div>
                      <span className="note-badge has-ai">AI Ready</span>
                    </div>

                    <div className="note-card-time">
                      <Clock size={12} />
                      <span>
                        {new Date(m.scheduledAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        • {m.duration || 30} mins
                      </span>
                    </div>

                    <div className="note-card-preview">
                      Click to inspect AI meeting intelligence, actionable checklists, and flashcards.
                    </div>

                    <div className="note-card-badges">
                      <span className="note-badge">
                        <ListTodo size={11} /> Actions
                      </span>
                      <span className="note-badge">
                        <BrainCircuit size={11} /> Flashcards
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detail Panel */}
          <div className="notes-detail-panel">
            {selectedMeeting ? (
              <>
                <div className="detail-top-bar">
                  <div>
                    <div className="detail-meeting-title">{selectedMeeting.title}</div>
                    <div className="detail-meeting-meta">
                      <Clock size={13} />
                      <span>
                        {new Date(selectedMeeting.scheduledAt).toLocaleDateString(undefined, {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span>{selectedMeeting.duration || 30} min duration</span>
                    </div>
                  </div>

                  <div className="detail-actions-group">
                    <button
                      className="btn-generate-ai"
                      onClick={handleGenerateAI}
                      disabled={generating}
                    >
                      <Sparkles size={15} />
                      <span>{generating ? 'Synthesizing AI...' : currentOutput ? 'Regenerate AI Notes' : 'Generate AI Notes'}</span>
                    </button>

                    {currentOutput && (
                      <>
                        <button
                          className="btn-icon-action"
                          onClick={handleCopyDocument}
                          title="Copy Full Document"
                        >
                          {copied ? <Check size={16} color="#4ade80" /> : <Copy size={16} />}
                        </button>
                        <button
                          className="btn-icon-action"
                          onClick={handleDownloadMarkdown}
                          title="Download Markdown (.md)"
                        >
                          <Download size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Sub-tabs Navigation */}
                <div className="detail-subtabs">
                  <button
                    className={`detail-subtab-btn ${activeSubTab === 'summary' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('summary')}
                  >
                    <AlignLeft size={15} /> Summary
                  </button>
                  <button
                    className={`detail-subtab-btn ${activeSubTab === 'actions' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('actions')}
                  >
                    <ListTodo size={15} /> Action Items ({currentOutput?.actionItems?.length || 0})
                  </button>
                  <button
                    className={`detail-subtab-btn ${activeSubTab === 'decisions' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('decisions')}
                  >
                    <FileCheck size={15} /> Key Decisions ({currentOutput?.keyDecisions?.length || 0})
                  </button>
                  <button
                    className={`detail-subtab-btn ${activeSubTab === 'flashcards' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('flashcards')}
                  >
                    <BrainCircuit size={15} /> Flashcards ({currentOutput?.flashcards?.length || 0})
                  </button>
                  <button
                    className={`detail-subtab-btn ${activeSubTab === 'document' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('document')}
                  >
                    <FileText size={15} /> Full Document
                  </button>
                  <button
                    className={`detail-subtab-btn ${activeSubTab === 'transcript' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('transcript')}
                  >
                    <Volume2 size={15} /> Transcript
                  </button>
                </div>

                {/* Sub-tab Content Pane */}
                {loadingOutput ? (
                  <div className="empty-notes-view">
                    <Sparkles size={36} className="spin" color="#818cf8" />
                    <h3>Loading meeting intelligence...</h3>
                  </div>
                ) : !currentOutput ? (
                  <div className="empty-notes-view">
                    <BrainCircuit size={44} color="#6366f1" />
                    <h3>No AI Notes Generated Yet</h3>
                    <p>
                      Click "Generate AI Notes" above to synthesize an executive summary, action items,
                      key decisions, and flashcards for this meeting.
                    </p>
                    <button
                      className="btn-generate-ai"
                      onClick={handleGenerateAI}
                      disabled={generating}
                    >
                      <Sparkles size={15} />
                      <span>{generating ? 'Processing with AI...' : 'Generate Now'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="tab-content-pane">
                    {/* 1. Summary */}
                    {activeSubTab === 'summary' && (
                      <div className="summary-container">
                        <div className="summary-lead-box">
                          {currentOutput.summary}
                        </div>

                        {currentOutput.importantPoints && currentOutput.importantPoints.length > 0 && (
                          <div>
                            <div className="summary-section-title">
                              <Sparkles size={16} color="#818cf8" />
                              <span>Key Takeaways & Context</span>
                            </div>
                            <div className="takeaways-list">
                              {currentOutput.importantPoints.map((pt, i) => (
                                <div key={i} className="takeaway-item">
                                  <span>•</span>
                                  <span>{pt}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. Action Items */}
                    {activeSubTab === 'actions' && (
                      <div className="action-items-list">
                        {currentOutput.actionItems?.length === 0 ? (
                          <p style={{ color: '#94a3b8' }}>No action items recorded for this meeting.</p>
                        ) : (
                          currentOutput.actionItems.map((item, idx) => {
                            const isDone = item.status === 'completed';
                            return (
                              <div
                                key={idx}
                                className={`action-item-row ${isDone ? 'is-done' : ''}`}
                                onClick={() => handleToggleAction(idx)}
                              >
                                <div className={`action-checkbox ${isDone ? 'checked' : ''}`}>
                                  {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                </div>
                                <div className="action-task-text">{item.task}</div>
                                {item.assignee && (
                                  <span className="action-assignee-pill">
                                    @{item.assignee}
                                  </span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}

                    {/* 3. Key Decisions */}
                    {activeSubTab === 'decisions' && (
                      <div className="decisions-list">
                        {currentOutput.keyDecisions?.length === 0 ? (
                          <p style={{ color: '#94a3b8' }}>No specific key decisions logged yet.</p>
                        ) : (
                          currentOutput.keyDecisions.map((dec, idx) => (
                            <div key={idx} className="decision-card">
                              <div className="decision-number">{idx + 1}</div>
                              <div className="decision-text">{dec}</div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* 4. Flashcards */}
                    {activeSubTab === 'flashcards' && (
                      <div className="flashcards-container">
                        {currentOutput.flashcards && currentOutput.flashcards.length > 0 ? (
                          <>
                            <div
                              className="flashcard-stage"
                              onClick={() => setIsCardFlipped(!isCardFlipped)}
                            >
                              <div className={`flashcard-inner ${isCardFlipped ? 'is-flipped' : ''}`}>
                                <div className="flashcard-front">
                                  <span className="card-label">Question</span>
                                  <div className="card-text">
                                    {currentOutput.flashcards[currentCardIndex]?.question}
                                  </div>
                                  <span className="card-flip-prompt">Click to flip and reveal answer ↻</span>
                                </div>

                                <div className="flashcard-back">
                                  <span className="card-label">Answer</span>
                                  <div className="card-text">
                                    {currentOutput.flashcards[currentCardIndex]?.answer}
                                  </div>
                                  <span className="card-flip-prompt">Click to flip back ↺</span>
                                </div>
                              </div>
                            </div>

                            <div className="flashcard-nav-controls">
                              <button
                                className="flashcard-btn"
                                disabled={currentCardIndex === 0}
                                onClick={() => {
                                  setIsCardFlipped(false);
                                  setCurrentCardIndex((prev) => prev - 1);
                                }}
                              >
                                <ChevronLeft size={16} /> Prev
                              </button>

                              <span className="card-counter">
                                {currentCardIndex + 1} / {currentOutput.flashcards.length}
                              </span>

                              <button
                                className="flashcard-btn"
                                disabled={currentCardIndex === currentOutput.flashcards.length - 1}
                                onClick={() => {
                                  setIsCardFlipped(false);
                                  setCurrentCardIndex((prev) => prev + 1);
                                }}
                              >
                                Next <ChevronRight size={16} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <p style={{ color: '#94a3b8' }}>No flashcards generated for this meeting.</p>
                        )}
                      </div>
                    )}

                    {/* 5. Document */}
                    {activeSubTab === 'document' && (
                      <div className="document-pre-box">
                        {currentOutput.meetingDocument || currentOutput.summary}
                      </div>
                    )}

                    {/* 6. Transcript */}
                    {activeSubTab === 'transcript' && (
                      <div className="transcript-box">
                        {transcriptSegments.length === 0 ? (
                          <p style={{ color: '#94a3b8' }}>
                            No raw transcript segments found for this meeting.
                          </p>
                        ) : (
                          transcriptSegments.map((seg, idx) => (
                            <div key={idx} className="transcript-segment-row">
                              <span className="transcript-speaker-chip">{seg.speaker}</span>
                              <div className="transcript-dialogue">{seg.text}</div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="empty-notes-view">
                <FileText size={48} color="#475569" />
                <h3>Select a meeting to view notes</h3>
                <p>Choose any meeting from the list on the left to inspect summaries and intelligence.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
