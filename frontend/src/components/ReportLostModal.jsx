import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function ReportLostModal() {
  const { isReportLostOpen, setIsReportLostOpen, addLostItem, aiExtractedData } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ELECTRONICS');
  const [rewardAmount, setRewardAmount] = useState('');
  const [description, setDescription] = useState('');
  const [lostDate, setLostDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [lostTime, setLostTime] = useState('12:00');
  const [locationName, setLocationName] = useState('');
  const [city, setCity] = useState('San Jose');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [distinctiveMarks, setDistinctiveMarks] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill if AI extracted data is available
  useEffect(() => {
    if (aiExtractedData) {
      if (aiExtractedData.suggestedTitle) setTitle(aiExtractedData.suggestedTitle);
      if (aiExtractedData.category) setCategory(aiExtractedData.category);
      if (aiExtractedData.suggestedDescription) setDescription(aiExtractedData.suggestedDescription);
      if (aiExtractedData.brand) setBrand(aiExtractedData.brand);
      if (aiExtractedData.model) setModel(aiExtractedData.model);
      if (aiExtractedData.primaryColor) setPrimaryColor(aiExtractedData.primaryColor);
      if (aiExtractedData.distinctiveMarks) setDistinctiveMarks(aiExtractedData.distinctiveMarks);
    }
  }, [aiExtractedData]);

  if (!isReportLostOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addLostItem({
        title,
        category,
        rewardAmount: parseFloat(rewardAmount) || 0,
        description,
        lostDate,
        lostTime,
        locationName,
        city,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600',
        status: 'ACTIVE',
        attributes: {
          brand: brand || 'Generic',
          model: model || 'Standard',
          primaryColor: primaryColor || 'Dark',
          distinctiveMarks: distinctiveMarks || 'None'
        }
      });
      // Reset
      setTitle('');
      setDescription('');
      setRewardAmount('');
      setLocationName('');
      setBrand('');
      setModel('');
      setPrimaryColor('');
      setDistinctiveMarks('');
      setImageUrl('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setIsReportLostOpen(false)}>
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span className="hero-pill" style={{ marginBottom: 0, padding: '0.15rem 0.5rem', fontSize: '0.68rem' }}>
                LOST DISPATCH DOCKET
              </span>
              <span className="handwritten-annotation" style={{ fontSize: '0.88rem', color: 'var(--accent-coral)' }}>
                we'll alert you on match
              </span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
              Report Lost Item
            </h3>
          </div>
          <button className="modal-close" onClick={() => setIsReportLostOpen(false)}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Space Gray Apple iPhone 15 Pro"
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
              <label className="form-label">Reward Offer ($ optional)</label>
              <input
                type="number"
                className="form-control"
                placeholder="0.00"
                min="0"
                step="5"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-control"
              placeholder="Describe the item, circumstances, where you last had it, and any distinctive traits..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Lost Date *</label>
              <input
                type="date"
                className="form-control"
                value={lostDate}
                onChange={(e) => setLostDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lost Time</label>
              <input
                type="time"
                className="form-control"
                value={lostTime}
                onChange={(e) => setLostTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location / Campus Building *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Central Library 2nd Floor Study Desk"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-control"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Physical Attributes */}
          <div style={{ background: 'var(--bg-elevated)', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Physical Distinctive Identifiers (Boosts 6D Accuracy)
            </h4>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Brand</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Apple, Sony, Bellroy..."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Model</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="iPhone 15 Pro, WH-1000XM5..."
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Primary Color</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Space Gray, Navy, Matte Black..."
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Distinctive Marks / Stickers</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Cyberpunk sticker, scratch on corner..."
                  value={distinctiveMarks}
                  onChange={(e) => setDistinctiveMarks(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Photo Image URL</label>
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
              onClick={() => setIsReportLostOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish Lost Report →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
