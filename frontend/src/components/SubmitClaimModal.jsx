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
          <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📑</span> File Ownership Claim
          </h3>
          <button className="modal-close" onClick={closeClaimModal}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem', background: 'rgba(8,12,21,0.5)', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Claiming item:</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{claimModalData.foundTitle}</div>
          </div>

          <div className="form-group">
            <label className="form-label">Challenge Question from Custodian:</label>
            <div
              style={{
                fontSize: '0.9rem',
                color: '#a5b4fc',
                padding: '0.6rem',
                background: 'rgba(99,102,241,0.1)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-glow)',
                marginBottom: '0.75rem'
              }}
            >
              {claimModalData.question}
            </div>
            <label className="form-label">Your Answer *</label>
            <textarea
              className="form-control"
              placeholder="Provide exact, unambiguous answers to the challenge question..."
              value={answers}
              onChange={(e) => setAnswers(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Proof of Ownership</label>
            <textarea
              className="form-control"
              placeholder="Mention serial numbers, receipts, unique markings, or lockscreen credentials..."
              value={proof}
              onChange={(e) => setProof(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={closeClaimModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying with AI...' : 'Submit for AI Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
