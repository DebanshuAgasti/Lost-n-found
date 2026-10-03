import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function LostFeedPage() {
  const { lostItems, setIsReportLostOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'ELECTRONICS', label: 'Electronics' },
    { id: 'WALLET_AND_PURSE', label: 'Wallets' },
    { id: 'BAGS_AND_BACKPACKS', label: 'Bags' },
    { id: 'DOCUMENTS_AND_ID', label: 'ID & Keys' },
    { id: 'OTHER', label: 'Other' }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Lost Items Feed</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Browse active missing items reported by students, faculty, and campus guests.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsReportLostOpen(true)}>
          <span>+</span> Report Lost Item
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by brand, item title, marks, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="pill-filters">
          {categories.map((c) => (
            <button
              key={c.id}
              className={`filter-pill ${selectedCategory === c.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lost Items Grid */}
      <div className="item-grid">
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>No matching lost reports found</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Try changing your search terms or category filter.</p>
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
                  <span>{item.lostDate} {item.lostTime || ''}</span>
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
                  <div className="location-snippet">
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
