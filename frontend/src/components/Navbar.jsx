import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { MOCK_USERS } from '../mock-data.js';

export default function Navbar() {
  const { currentUser, switchUser, isBackendOnline, notifications, setNotifications, showToast } = useApp();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const initials = currentUser.fullName.split(' ').map((n) => n[0]).join('').toUpperCase();

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked as read', 'info');
  };

  return (
    <>
      {/* Top Live Network Strip */}
      <div className="top-status-bar">
        <div className="ticker-left">
          <span className={`status-dot ${isBackendOnline === false ? 'offline' : ''}`}></span>
          <span>CAMPUS MESH NODE #04</span>
          <span style={{ color: 'var(--border-strong)' }}>/</span>
          <span style={{ color: 'var(--text-muted)' }}>LIVE DISPATCH ACTIVE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="handwritten-annotation" style={{ fontSize: '0.95rem' }}>
            reunited 14 items this week ⚡
          </span>
          <span style={{ color: 'var(--border-strong)' }}>|</span>
          <span>{isBackendOnline ? 'API :8080 CONNECTED' : 'LOCAL SIMULATOR'}</span>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="navbar">
        {/* Brand */}
        <Link to="/" className="brand">
          <div className="brand-icon">⚡</div>
          <span className="brand-name">
            Lost<span className="radar-tag">Radar</span>
          </span>
          <span className="brand-version">v2.4</span>
        </Link>

        {/* Real React Router Navigation Tabs */}
        <nav className="nav-links" id="main-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
            <span>📊</span> Dashboard
          </NavLink>
          <NavLink to="/lost" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
            <span>🔍</span> Lost Feed
          </NavLink>
          <NavLink to="/found" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
            <span>📦</span> Found Feed
          </NavLink>
          <NavLink to="/matches" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
            <span>🎯</span> Match Radar
          </NavLink>
          <NavLink to="/claims" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
            <span>📑</span> Claims
          </NavLink>
          <NavLink to="/ai-hub" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
            <span>🤖</span> AI Hub
          </NavLink>
        </nav>

        {/* Nav Actions: Persona Switcher & Notifications */}
        <div className="nav-actions">
          {/* Persona Switcher Pill */}
          <div
            className="user-badge"
            onClick={() => {
              setShowPersonaMenu(!showPersonaMenu);
              setShowNotifPopover(false);
            }}
            title="Switch Persona"
          >
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <span className="user-name">{currentUser.fullName}</span>
              <span className="user-role">{currentUser.role === 'ROLE_ADMIN' ? 'Staff Security' : 'Verified Student'}</span>
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '0.2rem' }}>▾</span>
          </div>

          {/* Notification Button */}
          <button
            className="icon-btn notif-btn"
            onClick={() => {
              setShowNotifPopover(!showNotifPopover);
              setShowPersonaMenu(false);
            }}
            title="Notifications"
          >
            <span>🔔</span>
            {unreadCount > 0 && <span className="icon-badge notif-badge">{unreadCount}</span>}
          </button>
        </div>
      </header>

      {/* Notifications Popover */}
      {showNotifPopover && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '1.5rem',
            width: '360px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-popover)',
            zIndex: 150,
            padding: '1.25rem',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.65rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Live Dispatches</h4>
              <span className="brand-version" style={{ color: 'var(--accent-primary)' }}>{notifications.length}</span>
            </div>
            <button
              onClick={handleMarkAllRead}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}
            >
              Clear unread
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              maxHeight: '300px',
              overflowY: 'auto'
            }}
          >
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span className="handwritten-annotation">All quiet right now. No active alerts.</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    background: n.isRead ? 'var(--bg-surface)' : 'rgba(212, 249, 51, 0.05)',
                    border: `1px solid ${n.isRead ? 'var(--border-subtle)' : 'var(--border-strong)'}`,
                    borderLeft: n.isRead ? '1px solid var(--border-subtle)' : '3px solid var(--accent-primary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onClick={() => {
                    setNotifications((prev) =>
                      prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
                    );
                    setShowNotifPopover(false);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.84rem', color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                      {n.title}
                    </span>
                    <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{n.createdAt}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Persona Menu */}
      {showPersonaMenu && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '7rem',
            width: '280px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-popover)',
            zIndex: 150,
            padding: '0.85rem',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0.5rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Switch Persona
            </span>
            <span className="handwritten-annotation" style={{ fontSize: '0.9rem' }}>testing mode</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {MOCK_USERS.map((u) => (
              <div
                key={u.id}
                onClick={() => {
                  switchUser(u);
                  setShowPersonaMenu(false);
                }}
                style={{
                  padding: '0.65rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'background var(--transition-fast)',
                  background: u.id === currentUser.id ? 'var(--bg-surface-active)' : 'transparent',
                  border: u.id === currentUser.id ? '1px solid var(--border-strong)' : '1px solid transparent'
                }}
              >
                <div
                  className="user-avatar"
                  style={{
                    width: '28px',
                    height: '28px',
                    fontSize: '0.75rem',
                    background: u.id === currentUser.id ? 'var(--accent-primary)' : 'var(--border-strong)',
                    color: u.id === currentUser.id ? '#0c0e12' : '#fff'
                  }}
                >
                  {u.fullName.split(' ').map((n) => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{u.fullName}</div>
                  <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {u.role === 'ROLE_ADMIN' ? 'Staff Security Custodian' : 'Student / Finder'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
