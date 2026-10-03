import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function ClaimsPage() {
  const { claims, foundItems, reviewClaim } = useApp();

  return (
    <section className="view-section active">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Custody & Claim Verification</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Review ownership claims backed by AI challenge answer verification and custodian release controls.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {claims.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No active claims submitted yet.</p>
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
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                      <span className="hero-pill" style={{ marginBottom: 0 }}>
                        CLAIM #C-{claim.id}
                      </span>
                      <span
                        className="tag-pill"
                        style={{
                          fontWeight: 700,
                          background: isApproved ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)',
                          color: isApproved ? 'var(--accent-emerald)' : '#c7d2fe'
                        }}
                      >
                        {claim.status}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Claim for: {found?.title || 'Secured Item'}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Filed by <strong>{claim.claimantName}</strong> • {new Date(claim.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    {isSubmitted ? (
                      <>
                        <button
                          className="btn btn-sm btn-emerald"
                          onClick={() => reviewClaim(claim.id, 'APPROVED', 'Verified by custodian')}
                        >
                          Approve Claim ✓
                        </button>
                        <button
                          className="btn btn-sm btn-coral"
                          onClick={() => reviewClaim(claim.id, 'REJECTED', 'Insufficient proof')}
                        >
                          Reject ✕
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Status: {claim.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Answers & Proof */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'rgba(8,12,21,0.5)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 700 }}>
                      Challenge Question Answer
                    </div>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {claim.verificationAnswers || 'No answer recorded.'}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(8,12,21,0.5)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 700 }}>
                      Claimant Proof & Notes
                    </div>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {claim.proofDescription || 'No additional proof submitted.'}
                    </p>
                  </div>
                </div>

                {/* AI Verification Box */}
                {ai && (
                  <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>
                        🤖 AI Claim Verification: {ai.verdict} ({Math.round(ai.confidenceScore * 100)}% Confidence)
                      </span>
                      <span className="tag-pill" style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                        Action: {ai.recommendedAction}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                      {ai.reasoning}
                    </p>
                    {ai.matchedEvidence?.length > 0 && (
                      <div style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>
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
