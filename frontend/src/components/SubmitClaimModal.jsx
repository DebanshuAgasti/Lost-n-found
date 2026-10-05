import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function SubmitClaimModal() {
  const { claimModalData, closeClaimModal, submitClaim } = useApp();
  const [answers, setAnswers] = useState('');
  const [proof, setProof] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!claimModalData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitClaim({
        foundItemId: claimModalData.foundId,
        lostItemId: claimModalData.lostId || 1,
        verificationAnswers: answers,
        proofDescription: proof
      });
      setAnswers('');
      setProof('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && closeClaimModal()}>
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span className="hero-pill" style={{ marginBottom: 0, padding: '0.15rem 0.5rem', fontSize: '0.68rem' }}>
                OWNERSHIP VERIFICATION PETITION
              </span>
              <span className="handwritten-annotation" style={{ fontSize: '0.88rem', color: 'var(--accent-primary)' }}>
                instant AI review
              </span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
              File Ownership Claim
            </h3>
          </div>
          <button className="modal-close" onClick={closeClaimModal}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem', background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Secured Item in Custody:
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              {claimModalData.foundTitle}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Challenge Question from Custodian:</label>
            <div
              style={{
                fontSize: '0.9rem',
                color: 'var(--accent-primary)',
                padding: '0.85rem 1rem',
                background: 'rgba(212, 249, 51, 0.05)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                marginBottom: '0.85rem',
                lineHeight: 1.5
              }}
            >
              ❓ {claimModalData.question}
            </div>

            <label className="form-label">Your Specific Answer *</label>
            <textarea
              className="form-control"
              placeholder="Provide exact, unambiguous answers (e.g. description of wallpaper, specific stickers, contents)..."
              value={answers}
              onChange={(e) => setAnswers(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Proof of Ownership (Receipts, Serial #, Details)</label>
            <textarea
              className="form-control"
              placeholder="Mention purchase invoice details, IMEI/serial digits, unique scratches, or student ID matches..."
              value={proof}
              onChange={(e) => setProof(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={closeClaimModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying with AI...' : 'Submit for AI Verification →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
