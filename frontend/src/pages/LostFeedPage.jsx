import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function LostFeedPage() {
  const { lostItems, setIsReportLostOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = [
    { id: 'ALL', label: 'All Items' },
    { id: 'ELECTRONICS', label: 'Tech & Gadgets' },
    { id: 'WALLET_AND_PURSE', label: 'Wallets & Cards' },
    { id: 'BAGS_AND_BACKPACKS', label: 'Bags & Packs' },
    { id: 'DOCUMENTS_AND_ID', label: 'IDs & Keys' },
    { id: 'OTHER', label: 'Other Gear' }
  ];

  const filtered = lostItems.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      !query ||
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.locationName?.toLowerCase().includes(query) ||
      item.attributes?.brand?.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  return (
    <section className="view-section active">
      {/* Editorial Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span className="hero-pill" style={{ marginBottom: 0 }}>
              <span>●</span> LIVE MISSING INVENTORY
            </span>
            <span className="handwritten-annotation" style={{ fontSize: '1rem', color: 'var(--accent-coral)' }}>
              help reunite gear with owners
            </span>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            Lost Items Feed
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '640px' }}>
            Active missing items reported by students, faculty, and campus guests across academic halls, gyms, and transit lines.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsReportLostOpen(true)}>
          <span>+</span> Report Lost Item
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by brand, item title, marks, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: '0.2rem 0.5rem'
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div className="pill-filters">
          {categories.map((c) => {
            const count = c.id === 'ALL'
              ? lostItems.length
              : lostItems.filter((i) => i.category === c.id).length;
            return (
              <button
                key={c.id}
                className={`filter-pill ${selectedCategory === c.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(c.id)}
              >
                {c.label} <span style={{ opacity: 0.65, fontSize: '0.72rem', marginLeft: '0.25rem' }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lost Items Grid */}
      <div className="item-grid">
        {filtered.length === 0 ? (
          <div style={{
            gridColumn: '1/-1',
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-subtle)',
            margin: '1rem 0'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.35rem' }}>
              Nothing matches your query
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              No matching lost reports found right now. Either nobody lost anything matching this, or it's hiding under another keyword.
            </p>
            <button
              className="btn btn-secondary"
              onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-media">
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600'}
                  alt={item.title}
                  loading="lazy"
                />
                <span className="item-badge-top-left badge-lost">LOST</span>
                {item.rewardAmount ? (
                  <span className="badge-reward">💰 ${item.rewardAmount} Reward</span>
                ) : null}
              </div>

              <div className="item-content">
                <div className="item-meta-row">
                  <span>{item.lostDate} {item.lostTime ? `· ${item.lostTime}` : ''}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-coral)', fontWeight: 700 }}>
                    #L-{item.id}
                  </span>
                </div>

                <h3 className="item-title">{item.title}</h3>
                <p className="item-desc">{item.description}</p>

                <div className="item-tags">
                  <span className="tag-pill">{item.category}</span>
                  {item.attributes?.brand && <span className="tag-pill">🏷️ {item.attributes.brand}</span>}
                  {item.attributes?.primaryColor && <span className="tag-pill">🎨 {item.attributes.primaryColor}</span>}
                  {item.attributes?.distinctiveMarks && <span className="tag-pill">✨ {item.attributes.distinctiveMarks}</span>}
                </div>

                <div className="item-footer">
                  <div className="location-snippet" title={item.locationName}>
                    <span>📍</span>
                    <span>{item.locationName}</span>
                  </div>
                  <Link to="/matches" className="btn btn-sm btn-secondary">
                    Radar Match 🎯
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
