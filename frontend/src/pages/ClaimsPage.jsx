import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function ClaimsPage() {
  const { claims, foundItems, reviewClaim } = useApp();

  return (
    <section className="view-section active">
      {/* Editorial Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span className="hero-pill" style={{ marginBottom: 0 }}>
            <span>●</span> PHYSICAL RELEASE DESK
          </span>
          <span className="handwritten-annotation" style={{ fontSize: '1rem', color: 'var(--accent-emerald)' }}>
            custodial gatekeeping & anti-fraud verification
          </span>
        </div>
        <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
          Custody & Claim Verification
        </h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '680px' }}>
          Review ownership claims against custodian challenge questions, lockscreen descriptions, receipts, and Gemini AI fraud detection before releasing secured physical items.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {claims.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-subtle)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📑</div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.35rem' }}>
              No active claims submitted yet
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
              When a student or owner files an ownership claim on a secured found item, it will appear here for verification.
            </p>
          </div>
        ) : (
          claims.map((claim) => {
            const found = foundItems.find((i) => i.id === claim.foundItemId) || foundItems[0];
            const ai = claim.aiVerification;
            const isSubmitted = claim.status === 'SUBMITTED';
            const isApproved = claim.status === 'APPROVED';

            return (
              <div
                key={claim.id}
                style={{
                  background: 'var(--bg-card)',
                  border: isApproved ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                      <span className="hero-pill" style={{ marginBottom: 0 }}>
                        CLAIM DOSSIER #C-{claim.id}
                      </span>
                      <span
                        className="tag-pill"
                        style={{
                          fontWeight: 700,
                          background: isApproved ? 'rgba(16,185,129,0.15)' : 'rgba(255,87,34,0.15)',
                          color: isApproved ? 'var(--accent-emerald)' : 'var(--accent-coral)',
                          borderColor: isApproved ? 'rgba(16,185,129,0.3)' : 'rgba(255,87,34,0.3)'
                        }}
                      >
                        {claim.status}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '0.2rem' }}>
                      Claim for: {found?.title || 'Secured Item'}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Filed by <strong>{claim.claimantName}</strong> · {new Date(claim.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    {isSubmitted ? (
                      <>
                        <button
                          className="btn btn-sm btn-emerald"
                          onClick={() => reviewClaim(claim.id, 'APPROVED', 'Verified by custodian')}
                        >
                          Approve Claim ✓
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          style={{ color: 'var(--accent-coral)' }}
                          onClick={() => reviewClaim(claim.id, 'REJECTED', 'Insufficient proof')}
                        >
                          Reject ✕
                        </button>
                      </>
                    ) : (
                      <div style={{
                        padding: '0.4rem 0.8rem',
                        background: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        fontFamily: 'var(--font-mono)',
                        border: '1px solid var(--border-subtle)',
                        color: isApproved ? 'var(--accent-emerald)' : 'var(--accent-coral)'
                      }}>
                        Status: {claim.status}
                      </div>
                    )}
                  </div>
                </div>

                {/* Proof & Challenge Answers Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{
                    background: 'var(--bg-elevated)',
                    padding: '1.1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>
                      Challenge Question Answer
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {claim.verificationAnswers || 'No answer recorded.'}
                    </p>
                  </div>

                  <div style={{
                    background: 'var(--bg-elevated)',
                    padding: '1.1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>
                      Claimant Proof & Serial Marks
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {claim.proofDescription || 'No additional proof submitted.'}
                    </p>
                  </div>
                </div>

                {/* AI Verification Assessment */}
                {ai && (
                  <div style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>🤖</span> AI Claim Verification: {ai.verdict} ({Math.round(ai.confidenceScore * 100)}% Confidence)
                      </span>
                      <span className="tag-pill" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)', fontWeight: 700, borderColor: 'transparent' }}>
                        Action: {ai.recommendedAction}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: 1.5 }}>
                      {ai.reasoning}
                    </p>

                    {ai.matchedEvidence?.length > 0 && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--accent-emerald)' }}>
                        <strong>Verifiable Evidence:</strong> {ai.matchedEvidence.join('; ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
