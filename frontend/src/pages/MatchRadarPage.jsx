import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function MatchRadarPage() {
  const { matches, lostItems, foundItems, openClaimModal } = useApp();

  return (
    <section className="view-section active">
      {/* Editorial Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span className="hero-pill" style={{ marginBottom: 0 }}>
            <span>●</span> MULTIMODAL 6-DIMENSIONAL MATCHING ENGINE
          </span>
          <span className="handwritten-annotation" style={{ fontSize: '1rem', color: 'var(--accent-primary)' }}>
            cross-referencing vision vectors, geo-grids & timelines
          </span>
        </div>
        <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
          Candidate Match Radar
        </h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '720px' }}>
          Every item pair is dynamically evaluated across 6 independent dimensions with automatic weight rebalancing: visual cosine embeddings, strict category gates, attribute marks, textual semantics, geographic proximity, and chronological windows.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {matches.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-subtle)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎯</div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.35rem' }}>
              No correlation matches recorded yet
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
              When lost and found items are registered, our multi-modal engine evaluates them against all existing inventory automatically.
            </p>
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
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2rem',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative'
                }}
              >
                {/* Dossier Header Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '1.75rem',
                    paddingBottom: '1.25rem',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                      <span className="hero-pill" style={{ marginBottom: 0 }}>
                        MATCH DOSSIER #{m.id}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        UUID: 7a8f-{m.id}09-rec
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.45rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
                      Multimodal Correlation Analysis
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
                        CONFIDENCE SCORE
                      </div>
                      <div style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
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
                          found.verificationQuestion || 'Describe unique attributes and prove ownership.'
                        )
                      }
                    >
                      Initiate Claim 🚀
                    </button>
                  </div>
                </div>

                {/* Side-by-side Evidence Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  {/* Lost Item Dossier Half */}
                  <div style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid rgba(255, 87, 34, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <img
                        src={lost.imageUrl}
                        alt={lost.title}
                        style={{ width: '74px', height: '74px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                      />
                      <div>
                        <span className="tag-pill" style={{ background: 'rgba(255,87,34,0.15)', color: 'var(--accent-coral)', fontWeight: 700, borderColor: 'transparent' }}>
                          LOST REPORT #{lost.id}
                        </span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.25rem' }}>{lost.title}</h4>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          📍 {lost.locationName} · {lost.lostDate}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {lost.description}
                    </p>
                  </div>

                  {/* Found Item Dossier Half */}
                  <div style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <img
                        src={found.imageUrl}
                        alt={found.title}
                        style={{ width: '74px', height: '74px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                      />
                      <div>
                        <span className="tag-pill" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)', fontWeight: 700, borderColor: 'transparent' }}>
                          FOUND IN CUSTODY #{found.id}
                        </span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.25rem' }}>{found.title}</h4>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          📍 {found.locationName} · {found.foundDate}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {found.description}
                    </p>
                  </div>
                </div>

                {/* 6D Radar Breakdown Bars */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>📊</span> 6-Dimensional Matching Breakdown
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Sum of normalized weighted vectors = 100%
                    </span>
                  </div>

                  <div className="radar-grid">
                    <div className="radar-bar-row">
                      <div className="radar-label-row">
                        <span>Visual Similarity (35% weight)</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)', fontWeight: 700 }}>
                          {Math.round(bd.visualScore * 100)}%
                        </span>
                      </div>
                      <div className="radar-track">
                        <div className="radar-fill" style={{ width: `${bd.visualScore * 100}%`, background: 'var(--accent-purple)' }}></div>
                      </div>
                    </div>

                    <div className="radar-bar-row">
                      <div className="radar-label-row">
                        <span>Category Compatibility (20% weight)</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                          {Math.round(bd.categoryScore * 100)}%
                        </span>
                      </div>
                      <div className="radar-track">
                        <div className="radar-fill" style={{ width: `${bd.categoryScore * 100}%`, background: 'var(--accent-emerald)' }}></div>
                      </div>
                    </div>

                    <div className="radar-bar-row">
                      <div className="radar-label-row">
                        <span>Physical Attributes & Marks (20% weight)</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                          {Math.round(bd.attributesScore * 100)}%
                        </span>
                      </div>
                      <div className="radar-track">
                        <div className="radar-fill" style={{ width: `${bd.attributesScore * 100}%`, background: 'var(--accent-cyan)' }}></div>
                      </div>
                    </div>

                    <div className="radar-bar-row">
                      <div className="radar-label-row">
                        <span>Textual Semantic Correlation (10% weight)</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', fontWeight: 700 }}>
                          {Math.round(bd.textScore * 100)}%
                        </span>
                      </div>
                      <div className="radar-track">
                        <div className="radar-fill" style={{ width: `${bd.textScore * 100}%`, background: 'var(--accent-blue)' }}></div>
                      </div>
                    </div>

                    <div className="radar-bar-row">
                      <div className="radar-label-row">
                        <span>Geographic Proximity (10% weight)</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                          {Math.round(bd.locationScore * 100)}%
                        </span>
                      </div>
                      <div className="radar-track">
                        <div className="radar-fill" style={{ width: `${bd.locationScore * 100}%`, background: 'var(--accent-emerald)' }}></div>
                      </div>
                    </div>

                    <div className="radar-bar-row">
                      <div className="radar-label-row">
                        <span>Chronological Timeline Proximity (5% weight)</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontWeight: 700 }}>
                          {Math.round(bd.temporalScore * 100)}%
                        </span>
                      </div>
                      <div className="radar-track">
                        <div className="radar-fill" style={{ width: `${bd.temporalScore * 100}%`, background: 'var(--accent-amber)' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gemini AI Deep Explanation Card */}
                <div style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🤖</span>
                    <span style={{ fontWeight: 700, fontSize: '0.98rem' }}>Gemini AI Match Explanation</span>
                    <span className="tag-pill" style={{ marginLeft: 'auto', background: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                      Grade: {ai.confidenceGrade}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                    {ai.executiveSummary}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', fontSize: '0.84rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>✓</span> Supporting Correlation Factors:
                      </div>
                      <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {ai.matchingFactors.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-coral)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>⚠</span> Potential Discrepancies:
                      </div>
                      <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {ai.conflictingFactors.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Advisor Recommendation:</strong> {ai.recommendation}
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
