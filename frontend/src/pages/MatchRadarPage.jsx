import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function MatchRadarPage() {
  const { matches, lostItems, foundItems, openClaimModal } = useApp();

  return (
    <section className="view-section active">
      <div style={{ marginBottom: '1.75rem' }}>
        <div className="hero-pill">⚡ Multimodal 6-Dimensional Matching Engine</div>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>Candidate Match Radar</h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
          Our weighted AI engine cross-references visual vectors, category filters, physical attributes, textual semantics, GPS geolocation, and chronological timelines.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No match radar correlations calculated yet.</p>
          </div>
        ) : (
          matches.map((m) => {
            const lost = lostItems.find((i) => i.id === m.lostItemId) || lostItems[0];
            const found = foundItems.find((i) => i.id === m.foundItemId) || foundItems[0];
            const scorePct = Math.round(m.overallScore * 1000) / 10;
            const bd = m.breakdown;
            const ai = m.aiExplanation;

            return (
              <div
                key={m.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-glow)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '2rem',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    paddingBottom: '1.2rem',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <span className="hero-pill" style={{ marginBottom: '0.4rem' }}>
                      AI CANDIDATE MATCH #M-{m.id}
                    </span>
                    <h3 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Multimodal Correlation Analysis</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONFIDENCE SCORE</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)' }}>
                        {scorePct}%
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        openClaimModal(
                          found.id,
                          lost.id,
                          found.title,
                          found.verificationQuestion || ''
                        )
                      }
                    >
                      Initiate Claim 🚀
                    </button>
                  </div>
                </div>

                {/* Side-by-side comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  {/* Lost Item Card */}
                  <div style={{ background: 'rgba(8,12,21,0.6)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.8rem' }}>
                      <img
                        src={lost.imageUrl}
                        alt={lost.title}
                        style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                      />
                      <div>
                        <span className="tag-pill" style={{ background: 'rgba(244,63,94,0.2)', color: 'var(--accent-coral)', fontWeight: 700 }}>
                          LOST REPORT
                        </span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.2rem' }}>{lost.title}</h4>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {lost.locationName} • {lost.lostDate}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{lost.description}</p>
                  </div>

                  {/* Found Item Card */}
                  <div style={{ background: 'rgba(8,12,21,0.6)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.8rem' }}>
                      <img
                        src={found.imageUrl}
                        alt={found.title}
                        style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                      />
                      <div>
                        <span className="tag-pill" style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                          FOUND IN CUSTODY
                        </span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.2rem' }}>{found.title}</h4>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {found.locationName} • {found.foundDate}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{found.description}</p>
                  </div>
                </div>

                {/* 6D Radar Breakdown Bars */}
                <h4 style={{ fontSize: '1rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📊</span> 6-Dimensional Matching Breakdown
                </h4>
                <div className="radar-grid">
                  <div className="radar-bar-row">
                    <div className="radar-label-row">
                      <span>Visual Similarity (35% weight)</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)' }}>{Math.round(bd.visualScore * 100)}%</span>
                    </div>
                    <div className="radar-track">
                      <div className="radar-fill" style={{ width: `${bd.visualScore * 100}%`, background: 'linear-gradient(90deg, #8b5cf6, #d946ef)' }}></div>
                    </div>
                  </div>

                  <div className="radar-bar-row">
                    <div className="radar-label-row">
                      <span>Category Compatibility (20% weight)</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>{Math.round(bd.categoryScore * 100)}%</span>
                    </div>
                    <div className="radar-track">
                      <div className="radar-fill" style={{ width: `${bd.categoryScore * 100}%`, background: 'var(--gradient-emerald)' }}></div>
                    </div>
                  </div>

                  <div className="radar-bar-row">
                    <div className="radar-label-row">
                      <span>Physical Attributes & Marks (20% weight)</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{Math.round(bd.attributesScore * 100)}%</span>
                    </div>
                    <div className="radar-track">
                      <div className="radar-fill" style={{ width: `${bd.attributesScore * 100}%`, background: 'var(--gradient-cyan)' }}></div>
                    </div>
                  </div>

                  <div className="radar-bar-row">
                    <div className="radar-label-row">
                      <span>Textual Semantic Correlation (10% weight)</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-indigo)' }}>{Math.round(bd.textScore * 100)}%</span>
                    </div>
                    <div className="radar-track">
                      <div className="radar-fill" style={{ width: `${bd.textScore * 100}%`, background: 'var(--gradient-primary)' }}></div>
                    </div>
                  </div>

                  <div className="radar-bar-row">
                    <div className="radar-label-row">
                      <span>Geographic Proximity (10% weight)</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>{Math.round(bd.locationScore * 100)}%</span>
                    </div>
                    <div className="radar-track">
                      <div className="radar-fill" style={{ width: `${bd.locationScore * 100}%`, background: 'var(--gradient-emerald)' }}></div>
                    </div>
                  </div>

                  <div className="radar-bar-row">
                    <div className="radar-label-row">
                      <span>Chronological Timeline Proximity (5% weight)</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>{Math.round(bd.temporalScore * 100)}%</span>
                    </div>
                    <div className="radar-track">
                      <div className="radar-fill" style={{ width: `${bd.temporalScore * 100}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}></div>
                    </div>
                  </div>
                </div>

                {/* AI Deep Explanation */}
                <div style={{ background: 'rgba(8,12,21,0.85)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🤖</span>
                    <span style={{ fontWeight: 700, color: '#c7d2fe' }}>Gemini AI Match Explanation</span>
                    <span className="tag-pill" style={{ marginLeft: 'auto', background: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                      Grade: {ai.confidenceGrade}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {ai.executiveSummary}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem', fontSize: '0.82rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.35rem' }}>
                        ✓ Supporting Correlation Factors:
                      </div>
                      <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {ai.matchingFactors.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-coral)', marginBottom: '0.35rem' }}>
                        ⚠ Potential Discrepancies:
                      </div>
                      <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {ai.conflictingFactors.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: '#cbd5e1' }}>
                    <strong>Advisor Recommendation:</strong> {ai.recommendation}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
