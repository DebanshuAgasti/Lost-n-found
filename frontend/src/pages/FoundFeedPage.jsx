import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function FoundFeedPage() {
  const { foundItems, setIsReportFoundOpen, openClaimModal } = useApp();
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
      {/* Editorial Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span className="hero-pill" style={{ marginBottom: 0 }}>
              <span>●</span> VERIFIED PHYSICAL CUSTODY
            </span>
            <span className="handwritten-annotation" style={{ fontSize: '1rem', color: 'var(--accent-emerald)' }}>
              safely held at staff desks & lockups
            </span>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            Found & Secured Items
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '640px' }}>
            Items safely turned in and locked at library desks, student union security, and campus lockups ready to be claimed with proof of ownership.
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
            placeholder="Search found items, custody location, locker ID, or details..."
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
              ? foundItems.length
              : foundItems.filter((i) => i.category === c.id).length;
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

      {/* Found Items Grid */}
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
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.35rem' }}>
              No secured items found
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Nothing in campus lockers matches this right now. If you turned in an item, register it to help its owner track it down.
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
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600'}
                  alt={item.title}
                  loading="lazy"
                />
                <span className="item-badge-top-left badge-found">FOUND & SECURED</span>
              </div>

              <div className="item-content">
                <div className="item-meta-row">
                  <span>{item.foundDate} {item.foundTime ? `· ${item.foundTime}` : ''}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                    #F-{item.id}
                  </span>
                </div>

                <h3 className="item-title">{item.title}</h3>
                <p className="item-desc">{item.description}</p>

                <div className="item-tags">
                  <span className="tag-pill">{item.category}</span>
                  {item.storageLocation && (
                    <span className="tag-pill" style={{ borderColor: 'rgba(16,185,129,0.3)', color: 'var(--accent-emerald)' }}>
                      🛡️ Locker: {item.storageLocation}
                    </span>
                  )}
                  {item.currentCustodian && (
                    <span className="tag-pill">👤 Custodian: {item.currentCustodian}</span>
                  )}
                </div>

                <div className="item-footer">
                  <div className="location-snippet" title={item.locationName}>
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
