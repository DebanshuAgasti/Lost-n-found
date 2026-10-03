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
      <header className="navbar">
        <Link to="/" className="brand">
          <div className="brand-icon">⚡</div>
          <span>Lost<span className="text-gradient">Radar</span></span>
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

        {/* Nav Actions */}
        <div className="nav-actions">
          {/* Backend Status */}
          <div className="auth-persona-pill" title="Backend Status">
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isBackendOnline ? '#10b981' : '#f59e0b'
              }}
            ></span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {isBackendOnline ? 'Online (8080)' : 'Offline / Sim'}
            </span>
          </div>

          {/* Persona Switcher Pill */}
          <div
            className="auth-persona-pill"
            onClick={() => {
              setShowPersonaMenu(!showPersonaMenu);
              setShowNotifPopover(false);
            }}
            title="Click to toggle persona"
          >
            <div className="user-avatar">{initials}</div>
            <span>{currentUser.fullName}</span>
            <span style={{ fontSize: '0.65rem', color: '#64748b' }}>▼</span>
          </div>

          {/* Notification Bell */}
          <button
            className="notif-btn"
            onClick={() => {
              setShowNotifPopover(!showNotifPopover);
              setShowPersonaMenu(false);
            }}
            title="Notifications"
          >
            <span>🔔</span>
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
        </div>
      </header>

      {/* Notifications Popover */}
      {showNotifPopover && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            right: '2rem',
            width: '340px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-bright)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 150,
            padding: '1.2rem',
            backdropFilter: 'blur(16px)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.8rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.5rem'
            }}
          >
            <h4 style={{ fontSize: '0.95rem' }}>Notifications</h4>
            <button
              onClick={handleMarkAllRead}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
            >
              Mark all read
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              maxHeight: '280px',
              overflowY: 'auto'
            }}
          >
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    background: n.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.1)',
                    border: `1px solid ${n.isRead ? 'var(--border-subtle)' : 'var(--border-glow)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setNotifications((prev) =>
                      prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
                    );
                    setShowNotifPopover(false);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.84rem', color: n.isRead ? 'var(--text-secondary)' : '#c7d2fe' }}>
                      {n.title}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.createdAt}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.message}</p>
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
            top: '70px',
            right: '7rem',
            width: '260px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-bright)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 150,
            padding: '0.8rem',
            backdropFilter: 'blur(16px)'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.3rem 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Switch Persona
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.4rem' }}>
            {MOCK_USERS.map((u) => (
              <div
                key={u.id}
                onClick={() => {
                  switchUser(u);
                  setShowPersonaMenu(false);
                }}
                style={{
                  padding: '0.6rem 0.8rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  transition: '0.15s',
                  background: u.id === currentUser.id ? 'rgba(99,102,241,0.2)' : 'transparent'
                }}
              >
                <div className="user-avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>
                  {u.fullName.split(' ').map((n) => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{u.fullName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
