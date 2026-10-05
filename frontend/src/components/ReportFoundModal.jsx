import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function ReportFoundModal() {
  const { isReportFoundOpen, setIsReportFoundOpen, addFoundItem, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ELECTRONICS');
  const [custodian, setCustodian] = useState(() => currentUser?.fullName ? `${currentUser.fullName} (Desk)` : 'Sarah Chen (Library Desk)');
  const [description, setDescription] = useState('');
  const [foundDate, setFoundDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [foundTime, setFoundTime] = useState('14:00');
  const [locationName, setLocationName] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [verificationQuestion, setVerificationQuestion] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isReportFoundOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addFoundItem({
        title,
        category,
        currentCustodian: custodian,
        description,
        foundDate,
        foundTime,
        locationName,
        storageLocation,
        verificationQuestion,
        city: 'San Jose',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600',
        status: 'ACTIVE',
        attributes: {
          brand: 'Generic',
          model: 'Standard',
          primaryColor: 'Mixed',
          distinctiveMarks: 'Custody secured'
        }
      });
      // Reset
      setTitle('');
      setDescription('');
      setLocationName('');
      setStorageLocation('');
      setVerificationQuestion('');
      setImageUrl('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setIsReportFoundOpen(false)}>
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span className="hero-pill" style={{ marginBottom: 0, padding: '0.15rem 0.5rem', fontSize: '0.68rem', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)', borderColor: 'rgba(16,185,129,0.3)' }}>
                PHYSICAL CUSTODY ENTRY
              </span>
              <span className="handwritten-annotation" style={{ fontSize: '0.88rem', color: 'var(--accent-emerald)' }}>
                safeguarded in campus lockers
              </span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
              Report Found Item
            </h3>
          </div>
          <button className="modal-close" onClick={() => setIsReportFoundOpen(false)}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Space Gray iPhone 15 Pro Found at 2F Quiet Lounge"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="ELECTRONICS">Electronics & Tech</option>
                <option value="WALLET_AND_PURSE">Wallet & Cards</option>
                <option value="BAGS_AND_BACKPACKS">Bags & Backpacks</option>
                <option value="DOCUMENTS_AND_ID">Documents & Student ID</option>
                <option value="KEYS">Keys & Fobs</option>
                <option value="CLOTHING">Clothing & Accessories</option>
                <option value="OTHER">Other Belongings</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Custodian *</label>
              <input
                type="text"
                className="form-control"
                value={custodian}
                onChange={(e) => setCustodian(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Public Description *</label>
            <textarea
              className="form-control"
              placeholder="Describe the item generally. Avoid revealing confidential details or passcodes needed to verify true ownership!"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Found Date *</label>
              <input
                type="date"
                className="form-control"
                value={foundDate}
                onChange={(e) => setFoundDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Found Time</label>
              <input
                type="time"
                className="form-control"
                value={foundTime}
                onChange={(e) => setFoundTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Discovery Location *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Study Cubicle #14, Library 2F"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Physical Locker / Shelf ID *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Locker L-04, Vault Bin #3"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Secret Ownership Challenge Question */}
          <div style={{ background: 'var(--bg-elevated)', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.84rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--accent-primary)', marginBottom: '0.35rem' }}>
              🔐 Secret Ownership Challenge Question
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
              Pose a specific challenge only the genuine owner can answer (e.g., lockscreen photo description, sticker pattern, engraved initials, or serial digits).
            </p>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. What sticker is affixed to the rear glass or what custom lockscreen is displayed?"
              value={verificationQuestion}
              onChange={(e) => setVerificationQuestion(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Item Photo URL</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsReportFoundOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-emerald" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Found Item →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
