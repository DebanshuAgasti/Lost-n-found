import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function DashboardPage() {
  const { lostItems, foundItems, matches, setIsReportLostOpen, setIsReportFoundOpen, openClaimModal } = useApp();

  return (
    <section className="view-section active">
      {/* Editorial Asymmetric Hero */}
      <div className="hero-editorial">
        <div className="hero-content">
          <div className="hero-pill">
            <span>●</span> CAMPUS RECOVERY ENGINE · ACTIVE DISPATCH
          </div>
          <h1 className="hero-title">
            Lost Something? <br />
            <span className="title-accent">Let's track it down.</span>
          </h1>
          <p className="hero-subtitle">
            Don't stress. We scan physical lost-and-found custody, security lockers, and student reports across campus in real time with 6D multimodal radar.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => setIsReportLostOpen(true)}>
              <span>🚨</span> Report Lost Item
            </button>
            <button className="btn btn-secondary" onClick={() => setIsReportFoundOpen(true)}>
              <span>📦</span> Report Found Item
            </button>
            <Link to="/ai-hub" className="btn btn-secondary">
              <span>⚡</span> Open AI Intelligence Hub
            </Link>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <span className="handwritten-annotation">
              💡 Tip: Uploading a clear photo doubles match accuracy in under 60 seconds!
            </span>
          </div>
        </div>

        {/* Hero Right: Live Radar Spotlight Dispatch */}
        <div className="dispatch-spotlight">
          <div className="dispatch-header">
            <span className="dispatch-badge">
              <span className="status-dot"></span> LIVE RADAR ALERT
            </span>
            <div style={{ textAlign: 'right' }}>
              <div className="dispatch-match-pct">93.5%</div>
              <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                Match Probability
              </span>
            </div>
          </div>

          <h3 className="dispatch-headline">
            Space Gray iPhone 15 Pro matched at Library 2F
          </h3>
          <p className="dispatch-meta">
            Turned in to custodian Sarah Chen. Visual chassis geometry, spatial proximity (45m), and custom Cyberpunk sticker aligned.
          </p>

          <div className="score-breakdown-mini">
            <div className="score-mini-item">
              <span className="score-mini-label">Visual Cosine</span>
              <span className="score-mini-val" style={{ color: 'var(--accent-primary)' }}>94.0%</span>
            </div>
            <div className="score-mini-item">
              <span className="score-mini-label">Proximity</span>
              <span className="score-mini-val" style={{ color: 'var(--accent-emerald)' }}>45m</span>
            </div>
            <div className="score-mini-item">
              <span className="score-mini-label">Time Window</span>
              <span className="score-mini-val" style={{ color: 'var(--accent-coral)' }}>+2.1h</span>
            </div>
          </div>

          <Link to="/matches" className="btn btn-primary" style={{ width: '100%' }}>
            Inspect 6D Radar Breakdown →
          </Link>
        </div>
      </div>

      {/* Metrics Strip / Status Ledger */}
      <div className="stats-strip">
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--accent-coral)' }}>🔍</div>
          <div>
            <div className="stat-val">{lostItems.length}</div>
            <div className="stat-label">Active Lost Reports</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--accent-emerald)' }}>📦</div>
          <div>
            <div className="stat-val">{foundItems.length}</div>
            <div className="stat-label">Recovered Custodies</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--accent-primary)' }}>🎯</div>
          <div>
            <div className="stat-val">{matches.length}</div>
            <div className="stat-label">High-Confidence Matches</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--accent-blue)' }}>⚡</div>
          <div>
            <div className="stat-val">93.5%</div>
            <div className="stat-label">AI Match Accuracy</div>
          </div>
        </div>
      </div>

      {/* Dual Activity Feed: Recent Lost & Secured Custody */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem' }}>
        {/* Left Column: Recent Lost Items */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recently Reported Lost</h3>
                <span className="brand-version">{lostItems.length}</span>
              </div>
              <span className="handwritten-annotation" style={{ fontSize: '0.85rem' }}>keep your eyes peeled 👀</span>
            </div>
            <Link to="/lost" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-primary)', textDecoration: 'none' }}>
              View all lost feed →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {lostItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="item-card"
                style={{ flexDirection: 'row', alignItems: 'center', padding: '0.85rem', gap: '1rem' }}
              >
                <div style={{ width: '84px', height: '84px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-input)' }}>
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=300'}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className="card-badge lost" style={{ fontSize: '0.62rem' }}>LOST</span>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {item.lostDate}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    📍 {item.locationName}
                  </div>
                </div>
                {item.rewardAmount > 0 && (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className="card-badge reward" style={{ fontSize: '0.72rem' }}>
                      ${item.rewardAmount}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Items Secured in Custody */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>In Safe Custody</h3>
                <span className="brand-version" style={{ color: 'var(--accent-emerald)' }}>{foundItems.length}</span>
              </div>
              <span className="handwritten-annotation" style={{ fontSize: '0.85rem' }}>stored in physical lockers 🔒</span>
            </div>
            <Link to="/found" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-emerald)', textDecoration: 'none' }}>
              View all found feed →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {foundItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="item-card"
                style={{ flexDirection: 'row', alignItems: 'center', padding: '0.85rem', gap: '1rem' }}
              >
                <div style={{ width: '84px', height: '84px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-input)' }}>
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300'}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className="card-badge found" style={{ fontSize: '0.62rem' }}>SECURED</span>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {item.foundDate}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    🔒 {item.storageLocation} ({item.currentCustodian})
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-emerald"
                  style={{ flexShrink: 0 }}
                  onClick={() => openClaimModal(item.id, 1, item.title, item.verificationQuestion)}
                >
                  Claim
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
