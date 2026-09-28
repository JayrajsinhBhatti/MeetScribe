import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Mic,
  Video,
  Layout,
  PhoneOff,
  FileText,
  CheckCircle2,
  Lightbulb,
  Calendar,
  Share2,
  ChevronDown,
  Layers,
  Zap,
  HelpCircle,
  Mail,
} from 'lucide-react';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'home' | 'features' | 'how-it-works' | 'pricing' | 'support'>('home');
  const [summaryActiveSubTab, setSummaryActiveSubTab] = useState<'overview' | 'transcript' | 'actions'>('overview');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleTabClick = (tab: 'home' | 'features' | 'how-it-works' | 'pricing' | 'support') => {
    setActiveTab(tab);
    const element = document.getElementById(tab);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="landing-container">
      {/* 1. Header / Navigation */}
      <header className="landing-header">
        <Link to="/" className="brand-logo" onClick={() => handleTabClick('home')}>
          <div className="logo-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="brand-name">MeetScribe</span>
        </Link>

        {/* Pill-shaped Tabs */}
        <nav className="nav-pill-container">
          <button
            className={`nav-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => handleTabClick('home')}
          >
            Home
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => handleTabClick('features')}
          >
            Features
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'how-it-works' ? 'active' : ''}`}
            onClick={() => handleTabClick('how-it-works')}
          >
            How It Works
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => handleTabClick('pricing')}
          >
            Pricing
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => handleTabClick('support')}
          >
            Support
          </button>
        </nav>

        {/* Top Right Action Button */}
        <button className="get-started-btn" onClick={() => navigate('/login')}>
          Get Started <ArrowRight size={16} />
        </button>
      </header>

      {/* 2. Hero Section (Exact replication of provided image) */}
      <section id="home" className="hero-wrapper">
        <div className="hero-grid">
          {/* Left Hero Content */}
          <div className="hero-left">
            <div className="badges-row">
              <span className="badge-pill">
                <Sparkles size={14} /> AI-Powered Meeting Assistant
              </span>
              <span className="badge-pill">Turn meetings into action</span>
            </div>

            <h1 className="hero-headline">
              Meet Smarter,
              <span className="headline-gradient">Not Harder</span>
            </h1>

            <p className="hero-description">
              Automatically record, transcribe and summarize your Google Meet calls. Get key insights,
              action items and more — all in one place.
            </p>

            <button className="hero-cta-btn" onClick={() => navigate('/login')}>
              Get Started Free <ArrowRight size={18} />
            </button>

            {/* Floating Video Call Preview Card (Bottom Left of Hero) */}
            <div className="video-preview-card">
              <div className="video-attendees-row">
                <div className="attendee-box">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    alt="Attendee 1"
                  />
                </div>
                <div className="attendee-box">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                    alt="Attendee 2"
                  />
                </div>
                <div className="attendee-box">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
                    alt="Attendee 3"
                  />
                </div>
              </div>

              {/* Control buttons & soundwave */}
              <div className="video-controls-bar">
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="control-btn" title="Microphone Active">
                    <Mic size={15} />
                  </button>
                  <button className="control-btn" title="Camera Active">
                    <Video size={15} />
                  </button>
                  <button className="control-btn" title="Screen Share">
                    <Layout size={15} />
                  </button>
                  <button className="control-btn end-call" title="End Recording">
                    <PhoneOff size={15} />
                  </button>
                </div>

                <div className="waveform-bars">
                  <div className="wave-bar" />
                  <div className="wave-bar" />
                  <div className="wave-bar" />
                  <div className="wave-bar" />
                  <div className="wave-bar" />
                  <div className="wave-bar" />
                </div>
              </div>

              <div className="pipeline-subtext">Record → Transcribe → Summarize</div>
            </div>
          </div>

          {/* Right Hero Visuals */}
          <div className="hero-right">
            {/* Center Portrait Image of Headphone Man */}
            <div className="hero-portrait-container">
              <img
                src="/hero_man.jpg"
                alt="MeetScribe User with Headphones"
                className="hero-portrait-img"
              />
            </div>

            {/* Floating Meeting Summary Card (Top Right) */}
            <div className="floating-summary-card">
              <div className="summary-header">
                <Sparkles size={16} color="#3b82f6" />
                <span>Meeting Summary</span>
              </div>

              <div className="summary-tabs">
                <span
                  className={`summary-tab-item ${summaryActiveSubTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setSummaryActiveSubTab('overview')}
                >
                  Overview
                </span>
                <span
                  className={`summary-tab-item ${summaryActiveSubTab === 'transcript' ? 'active' : ''}`}
                  onClick={() => setSummaryActiveSubTab('transcript')}
                >
                  Transcript
                </span>
                <span
                  className={`summary-tab-item ${summaryActiveSubTab === 'actions' ? 'active' : ''}`}
                  onClick={() => setSummaryActiveSubTab('actions')}
                >
                  Action Items
                </span>
              </div>

              <div className="summary-items-list">
                {/* Item 1: Key Discussion Points */}
                <div className="summary-card-item">
                  <div className="summary-item-left">
                    <div className="summary-icon-box icon-blue">
                      <FileText size={17} />
                    </div>
                    <div>
                      <div className="summary-item-title">Key Discussion Points</div>
                      <div className="summary-item-desc">Project updates, next steps, blockers</div>
                    </div>
                  </div>
                  <span className="summary-item-time">12:34</span>
                </div>

                {/* Item 2: Action Items */}
                <div className="summary-card-item">
                  <div className="summary-item-left">
                    <div className="summary-icon-box icon-green">
                      <CheckCircle2 size={17} />
                    </div>
                    <div>
                      <div className="summary-item-title">Action Items</div>
                      <div className="summary-item-desc">3 tasks assigned, 2 pending</div>
                    </div>
                  </div>
                  <span className="summary-item-time">18:42</span>
                </div>

                {/* Item 3: Highlights */}
                <div className="summary-card-item">
                  <div className="summary-item-left">
                    <div className="summary-icon-box icon-purple">
                      <Lightbulb size={17} />
                    </div>
                    <div>
                      <div className="summary-item-title">Highlights</div>
                      <div className="summary-item-desc">Important insights & decisions</div>
                    </div>
                  </div>
                  <span className="summary-item-time">22:16</span>
                </div>
              </div>
            </div>

            {/* Floating Google Meet Connection Pill (Bottom Right) */}
            <div className="floating-meet-card">
              <div className="meet-logo-box">
                {/* Official Google Meet Multi-Color SVG Icon */}
                <svg width="28" height="28" viewBox="0 0 48 48">
                  <path fill="#00832d" d="M37 24v-8.5l-8-6v29l8-6V24z" />
                  <path fill="#0066da" d="M12 37h17V11H12c-2.2 0-4 1.8-4 4v18c0 2.2 1.8 4 4 4z" />
                  <path fill="#e53935" d="M29 37h9c1.7 0 3-1.3 3-3V14c0-1.7-1.3-3-3-3h-9v26z" />
                  <path fill="#ffba00" d="M38 11h-9v26h9c1.7 0 3-1.3 3-3V14c0-1.7-1.3-3-3-3z" />
                  <path fill="#2684fc" d="M12 11h17v26H12c-2.2 0-4-1.8-4-4V15c0-2.2 1.8-4 4-4z" />
                  <path fill="#00ac47" d="M12 37h17V11H12z" />
                </svg>
              </div>
              <div>
                <div className="meet-card-title">Works with</div>
                <div className="meet-card-name">Google Meet</div>
              </div>
              <div className="meet-status-dot">
                <span style={{ fontSize: '18px', lineHeight: 1 }}>•</span> Connected
              </div>
            </div>

            {/* Handwritten Note at Bottom Right */}
            <div className="handwritten-note">
              Your meetings,
              <br />
              now more productive.
              <span className="handwritten-underline" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section (Working Tab Section) */}
      <section id="features" className="section-wrapper">
        <div className="section-title-box">
          <span className="section-tag">Powerful AI Features</span>
          <h2 className="section-heading">Everything You Need for Effortless Meetings</h2>
          <p className="section-subtext">
            MeetScribe automates the busywork before, during, and after every Google Meet call so your team can focus on execution.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Zap size={24} />
            </div>
            <h3 className="feature-card-title">Real-Time Transcription</h3>
            <p className="feature-card-desc">
              High-accuracy speech-to-text with live streaming diarization, speaker attribution, and instant timestamping.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: '#faf5ff', color: '#9333ea' }}>
              <Sparkles size={24} />
            </div>
            <h3 className="feature-card-title">AI Executive Summaries</h3>
            <p className="feature-card-desc">
              Gemini & GPT-4 powered synthesis extracts key discussions, strategic decisions, and high-level summaries in seconds.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <CheckCircle2 size={24} />
            </div>
            <h3 className="feature-card-title">Action Items & Tasks</h3>
            <p className="feature-card-desc">
              Automatically identify task commitments, deadlines, and assignees without missing a beat.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: '#fff7ed', color: '#ea580c' }}>
              <Calendar size={24} />
            </div>
            <h3 className="feature-card-title">1-Click Google Calendar Sync</h3>
            <p className="feature-card-desc">
              Connect your calendar once to aggregate all upcoming and past Google Meet calls automatically.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: '#fdf2f8', color: '#db2777' }}>
              <Layers size={24} />
            </div>
            <h3 className="feature-card-title">Q&A Study Flashcards</h3>
            <p className="feature-card-desc">
              Turn long meeting discussions into bite-sized interactive flashcards for fast knowledge retention and onboardings.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: '#f0fdfa', color: '#0d9488' }}>
              <Share2 size={24} />
            </div>
            <h3 className="feature-card-title">Instant Export & Sharing</h3>
            <p className="feature-card-desc">
              Download styled PDF reports, Markdown documentation, or DOCX files to share with stakeholders seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section (Working Tab Section) */}
      <section id="how-it-works" className="section-wrapper" style={{ background: 'rgba(255,255,255,0.6)' }}>
        <div className="section-title-box">
          <span className="section-tag">How It Works</span>
          <h2 className="section-heading">From Call to Clarity in 3 Simple Steps</h2>
          <p className="section-subtext">
            No complex bot invites or awkward recordings. MeetScribe runs smoothly right in your browser.
          </p>
        </div>

        <div className="steps-row">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3 className="step-title">Connect Google Calendar</h3>
            <p className="step-desc">
              Sign in with your Google account to automatically sync your upcoming Google Meet schedule in real time.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3 className="step-title">Join Call & Capture Audio</h3>
            <p className="step-desc">
              Jump into your Google Meet session with 1 click while MeetScribe captures crystal-clear audio and transcribes live.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3 className="step-title">Get Instant AI Insights</h3>
            <p className="step-desc">
              When your meeting concludes, your executive summary, action items, and flashcards are ready to read and export.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Pricing Section (Working Tab Section) */}
      <section id="pricing" className="section-wrapper">
        <div className="section-title-box">
          <span className="section-tag">Simple Pricing</span>
          <h2 className="section-heading">Choose the Plan That Fits Your Workflow</h2>
          <p className="section-subtext">
            Start completely free. Upgrade when your team needs unlimited transcription and custom AI outputs.
          </p>

          {/* Billing Switch */}
          <div style={{ display: 'inline-flex', background: '#e2e8f0', padding: '4px', borderRadius: '9999px', marginTop: '20px' }}>
            <button
              onClick={() => setBillingPeriod('monthly')}
              style={{
                background: billingPeriod === 'monthly' ? '#ffffff' : 'transparent',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '9999px',
                fontWeight: 600,
                color: billingPeriod === 'monthly' ? '#0f172a' : '#64748b',
                cursor: 'pointer',
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              style={{
                background: billingPeriod === 'yearly' ? '#ffffff' : 'transparent',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '9999px',
                fontWeight: 600,
                color: billingPeriod === 'yearly' ? '#0f172a' : '#64748b',
                cursor: 'pointer',
              }}
            >
              Annual <span style={{ color: '#2563eb', fontSize: '12px' }}>(Save 20%)</span>
            </button>
          </div>
        </div>

        <div className="pricing-grid">
          {/* Starter Plan */}
          <div className="pricing-card">
            <h3 className="pricing-name">Free Starter</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>For individuals testing AI meeting notes.</p>
            <div className="pricing-price">$0 <span>/ month</span></div>

            <ul className="pricing-features-list">
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="#16a34a" /> Up to 5 meetings / month</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="#16a34a" /> 30 minutes max call duration</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="#16a34a" /> Google Calendar Integration</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="#16a34a" /> Basic AI Summaries</li>
            </ul>

            <button className="pricing-btn" onClick={() => navigate('/login')}>
              Start Free
            </button>
          </div>

          {/* Pro Plan */}
          <div className="pricing-card featured">
            <div className="popular-badge">Most Popular</div>
            <h3 className="pricing-name">Pro Professional</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>For busy professionals and founders.</p>
            <div className="pricing-price">
              {billingPeriod === 'monthly' ? '$15' : '$12'} <span>/ month</span>
            </div>

            <ul className="pricing-features-list">
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="#2563eb" /> Unlimited meeting recordings</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="#2563eb" /> Up to 2 hours per call</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="#2563eb" /> Advanced Gemini 1.5 Pro AI</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="#2563eb" /> Action Items & Flashcards</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="#2563eb" /> PDF & Markdown Downloads</li>
            </ul>

            <button className="pricing-btn" onClick={() => navigate('/login')}>
              Get Pro Now
            </button>
          </div>

          {/* Team Plan */}
          <div className="pricing-card">
            <h3 className="pricing-name">Enterprise</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>For teams that collaborate constantly.</p>
            <div className="pricing-price">
              {billingPeriod === 'monthly' ? '$49' : '$39'} <span>/ month</span>
            </div>

            <ul className="pricing-features-list">
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="#16a34a" /> Everything in Pro plan</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="#16a34a" /> Team shared meeting workspace</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="#16a34a" /> Custom AI prompt templates</li>
              <li className="pricing-feature-item"><CheckCircle2 size={16} color="#16a34a" /> Priority support & SLA</li>
            </ul>

            <button className="pricing-btn" onClick={() => navigate('/login')}>
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* 6. Support Section (Working Tab Section) */}
      <section id="support" className="section-wrapper" style={{ background: '#ffffff', borderRadius: '32px', margin: '40px auto' }}>
        <div className="section-title-box">
          <span className="section-tag">Frequently Asked Questions</span>
          <h2 className="section-heading">Have Questions? We're Here to Help</h2>
          <p className="section-subtext">
            Find answers to commonly asked questions about Google Meet integration and privacy.
          </p>
        </div>

        <div className="faq-list">
          {[
            {
              q: 'Do I need to install an extension or invite a bot to my Google Meet?',
              a: 'No bots required! MeetScribe captures browser-level meeting audio directly when you click "Join Meeting" from your dashboard, preserving normal meeting aesthetics.',
            },
            {
              q: 'Is my Google Calendar and meeting data secure?',
              a: 'Yes. All authentication is handled through Google OAuth 2.0 with read-only calendar scope. We never modify your calendar or share your meeting transcripts with third parties.',
            },
            {
              q: 'Can I export my meeting notes to other tools?',
              a: 'Absolutely. You can export any meeting document as a PDF, Markdown (.md), or DOCX file, or copy action items directly to your clipboard.',
            },
            {
              q: 'Which AI models power the summarization?',
              a: 'MeetScribe uses Google Gemini Pro and GPT-4 to provide deep semantic comprehension, speaker diarization synthesis, and precise action item extraction.',
            },
          ].map((faq, idx) => (
            <div className="faq-item" key={idx}>
              <button className="faq-question-btn" onClick={() => toggleFaq(idx)}>
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>
              {openFaq === idx && <div className="faq-answer">{faq.a}</div>}
            </div>
          ))}
        </div>

        {/* Quick Contact Form */}
        <div
          style={{
            marginTop: '50px',
            padding: '30px',
            background: '#f8fafc',
            borderRadius: '20px',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '50px auto 0',
          }}
        >
          <HelpCircle size={32} color="#2563eb" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: '#0f172a' }}>
            Still have questions?
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px 0' }}>
            Our engineering and support team is ready to help you get set up.
          </p>
          <a
            href="mailto:support@meetscribe.io"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#2563eb',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <Mail size={16} /> Contact Support
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 MeetScribe. Built for seamless Google Meet collaboration & AI insights.</p>
      </footer>
    </div>
  );
};
