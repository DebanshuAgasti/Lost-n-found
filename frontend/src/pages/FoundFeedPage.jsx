import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function FoundFeedPage() {
  const { foundItems, setIsReportFoundOpen, openClaimModal } = useApp();
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

  const filtered = foundItems.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      !query ||
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.locationName?.toLowerCase().includes(query) ||
      item.storageLocation?.toLowerCase().includes(query) ||
      item.attributes?.brand?.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  return (
    <section className="view-section active">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Found & Secured Items</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Items safely held at library desks, student centers, and security lockups.
          </p>
        </div>
        <button className="btn btn-emerald" onClick={() => setIsReportFoundOpen(true)}>
          <span>+</span> Report Found Item
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search found items, custody location, or details..."
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

      {/* Found Items Grid */}
      <div className="item-grid">
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>No secured items found</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Try changing your search terms or category filter.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-media">
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600'}
                  alt={item.title}
                  loading="lazy"
                />
                <span className="item-badge-top-left badge-found">FOUND & SECURED</span>
              </div>
              <div className="item-content">
                <div className="item-meta-row">
                  <span>{item.foundDate} {item.foundTime || ''}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                    #F-{item.id}
                  </span>
                </div>
                <h3 className="item-title">{item.title}</h3>
                <p className="item-desc">{item.description}</p>

                <div className="item-tags">
                  <span className="tag-pill">{item.category}</span>
                  {item.storageLocation && (
                    <span className="tag-pill" style={{ borderColor: 'rgba(16,185,129,0.3)', color: '#a7f3d0' }}>
                      🛡️ Locker: {item.storageLocation}
                    </span>
                  )}
                  {item.currentCustodian && (
                    <span className="tag-pill">👤 Custodian: {item.currentCustodian}</span>
                  )}
                </div>

                <div className="item-footer">
                  <div className="location-snippet">
                    <span>📍</span>
                    <span>{item.locationName}</span>
                  </div>
                  <button
                    className="btn btn-sm btn-emerald"
                    onClick={() =>
                      openClaimModal(
                        item.id,
                        1,
                        item.title,
                        item.verificationQuestion || 'Describe unique attributes and prove ownership.'
                      )
                    }
                  >
                    Claim Item 📑
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
