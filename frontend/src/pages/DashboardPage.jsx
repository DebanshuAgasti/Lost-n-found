import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function DashboardPage() {
  const { lostItems, foundItems, matches, setIsReportLostOpen, setIsReportFoundOpen } = useApp();

  return (
    <section className="view-section active">
      {/* Hero Header */}
      <div className="hero">
        <div className="hero-pill">
          <span>✨</span> Powered by Spring Boot 3.3.4 & Gemini Multimodal AI
        </div>
        <h1 className="hero-title">
          Lost Something? <br />
          <span className="text-gradient">Matched In Seconds.</span>
        </h1>
        <p className="hero-subtitle">
          Next-generation multimodal retrieval uniting computer vision, geographic proximity, and semantic deep-matching across campus.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => setIsReportLostOpen(true)}>
            <span>🚨</span> Report Lost Item
          </button>
          <button className="btn btn-emerald" onClick={() => setIsReportFoundOpen(true)}>
            <span>📦</span> Report Found Item
          </button>
          <Link to="/ai-hub" className="btn btn-secondary">
            <span>🤖</span> Open AI Intelligence Hub
          </Link>
        </div>
      </div>

      {/* Quick Stats Strip */}
      <div className="stats-strip">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(244,63,94,0.15)', color: 'var(--accent-coral)' }}>🔍</div>
          <div>
            <div className="stat-val">{lostItems.length}</div>
            <div className="stat-label">Active Lost Reports</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)' }}>📦</div>
          <div>
            <div className="stat-val">{foundItems.length}</div>
            <div className="stat-label">Recovered Custodies</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent-indigo)' }}>🎯</div>
          <div>
            <div className="stat-val">{matches.length}</div>
            <div className="stat-label">High-Confidence Matches</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.15)', color: 'var(--accent-cyan)' }}>⚡</div>
          <div>
            <div className="stat-val">93.5%</div>
            <div className="stat-label">AI Match Accuracy</div>
          </div>
        </div>
      </div>

      {/* Match Spotlight Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(217,70,239,0.1) 100%)',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            🎯
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <span className="hero-pill" style={{ marginBottom: 0, padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                RADAR ALERT
              </span>
              <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>93.5% Match Probability</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Space Gray iPhone 15 Pro matched at Central Campus Library</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Physical visual similarity, spatial proximity (50m), and matching Cyberpunk sticker detected.
            </p>
          </div>
        </div>
        <Link to="/matches" className="btn btn-primary">
          Inspect 6D Radar Breakdown →
        </Link>
      </div>

      {/* Dual Activity Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🚨</span> Recent Lost Gear
            </h3>
            <Link to="/lost" className="btn btn-sm btn-secondary">
              View All Feed →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {lostItems.slice(0, 2).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.9rem',
                  alignItems: 'center'
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>{item.title}</h4>
                    {item.rewardAmount ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
                        ${item.rewardAmount} Reward
                      </span>
                    ) : null}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0.4rem' }}>
                    {item.locationName} • {item.lostDate}
                  </p>
                  <span className="tag-pill">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📦</span> Recently Found & Safe
            </h3>
            <Link to="/found" className="btn btn-sm btn-secondary">
              View All Custodies →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {foundItems.slice(0, 2).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.9rem',
                  alignItems: 'center'
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>{item.title}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0.4rem' }}>
                    Held at: {item.storageLocation} by {item.currentCustodian}
                  </p>
                  <span className="tag-pill" style={{ color: 'var(--accent-emerald)' }}>
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
