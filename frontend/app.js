import { api } from './api.js';
import {
  MOCK_USERS,
  MOCK_LOST_ITEMS,
  MOCK_FOUND_ITEMS,
  MOCK_MATCHES,
  MOCK_CLAIMS,
  MOCK_NOTIFICATIONS
} from './mock-data.js';

// Global Application State
const state = {
  currentPage: document.body?.dataset?.page || 'dashboard',
  lostItems: [...MOCK_LOST_ITEMS],
  foundItems: [...MOCK_FOUND_ITEMS],
  matches: [...MOCK_MATCHES],
  claims: [...MOCK_CLAIMS],
  notifications: [...MOCK_NOTIFICATIONS],
  selectedLostCategory: 'ALL',
  selectedFoundCategory: 'ALL',
  lostSearchQuery: '',
  foundSearchQuery: '',
  currentUser: api.currentUser || MOCK_USERS[0],
  extractedAiReport: null,
  activeVisionFile: null
};

// ==================== TOAST SYSTEM ====================
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️');
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3800);
}

// ==================== MODALS ====================
function openModal(modal) {
  if (modal) modal.classList.add('active');
}

function closeModal(modal) {
  if (modal) modal.classList.remove('active');
}

function openClaimModal(foundId, lostId, foundTitle, question) {
  const modal = document.getElementById('modal-submit-claim');
  if (!modal) {
    window.location.href = `./claims.html?foundId=${foundId}`;
    return;
  }
  const fId = document.getElementById('claim-form-found-id');
  const lId = document.getElementById('claim-form-lost-id');
  const title = document.getElementById('claim-modal-item-title');
  const q = document.getElementById('claim-modal-question');
  const ans = document.getElementById('claim-form-answers');
  const prf = document.getElementById('claim-form-proof');

  if (fId) fId.value = foundId;
  if (lId) lId.value = lostId || 1;
  if (title) title.textContent = foundTitle || 'Secured Item';
  if (q) q.textContent = question || 'What is the sticker, color, or engraving on the item?';
  if (ans) ans.value = '';
  if (prf) prf.value = '';

  openModal(modal);
}

// ==================== PERSONA SWITCHER ====================
function updatePersonaDisplay() {
  const user = state.currentUser;
  const nameEl = document.getElementById('nav-user-name');
  const avatarEl = document.getElementById('nav-avatar');
  if (nameEl) nameEl.textContent = user.fullName;
  if (avatarEl) {
    const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    avatarEl.textContent = initials;
  }
}

function renderPersonaMenu() {
  const listEl = document.getElementById('persona-list');
  if (!listEl) return;

  listEl.innerHTML = MOCK_USERS.map(u => `
    <div class="auth-persona-option" data-user-id="${u.id}" style="padding:0.6rem 0.8rem; border-radius:var(--radius-md); cursor:pointer; display:flex; align-items:center; gap:0.6rem; transition:0.15s; background:${u.id === state.currentUser.id ? 'rgba(99,102,241,0.2)' : 'transparent'};">
      <div class="user-avatar" style="width:24px; height:24px; font-size:0.7rem;">${u.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
      <div>
        <div style="font-weight:600; font-size:0.85rem;">${u.fullName}</div>
        <div style="font-size:0.72rem; color:var(--text-muted);">${u.role}</div>
      </div>
    </div>
  `).join('');

  listEl.querySelectorAll('.auth-persona-option').forEach(el => {
    el.addEventListener('click', () => {
      const id = parseInt(el.dataset.userId);
      const user = MOCK_USERS.find(u => u.id === id);
      if (user) {
        state.currentUser = user;
        api.setUser(user);
        updatePersonaDisplay();
        const menu = document.getElementById('persona-menu');
        if (menu) menu.style.display = 'none';
        showToast(`Switched active persona to ${user.fullName} (${user.role})`, 'info');
        if (state.currentPage === 'claims') renderClaims();
      }
    });
  });
}

// ==================== NOTIFICATIONS ====================
function renderNotifications() {
  const counter = document.getElementById('notif-counter');
  const list = document.getElementById('notifs-list');
  if (!counter || !list) return;

  const unreadCount = state.notifications.filter(n => !n.isRead).length;
  counter.textContent = unreadCount;
  counter.style.display = unreadCount > 0 ? 'inline-block' : 'none';

  if (state.notifications.length === 0) {
    list.innerHTML = `<div style="text-align:center; padding:1.5rem 0; color:var(--text-muted); font-size:0.85rem;">No notifications yet</div>`;
    return;
  }

  list.innerHTML = state.notifications.map(n => `
    <div style="background:${n.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.1)'}; border:1px solid ${n.isRead ? 'var(--border-subtle)' : 'var(--border-glow)'}; border-radius:var(--radius-md); padding:0.75rem; cursor:pointer;" data-notif-id="${n.id}">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
        <span style="font-weight:700; font-size:0.84rem; color:${n.isRead ? 'var(--text-secondary)' : '#c7d2fe'};">${n.title}</span>
        <span style="font-size:0.7rem; color:var(--text-muted);">${n.createdAt}</span>
      </div>
      <p style="font-size:0.78rem; color:var(--text-secondary); line-height:1.4;">${n.message}</p>
    </div>
  `).join('');

  list.querySelectorAll('[data-notif-id]').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.notifId);
      const notif = state.notifications.find(n => n.id === id);
      if (notif) {
        notif.isRead = true;
        renderNotifications();
        const popover = document.getElementById('notif-popover');
        if (popover) popover.style.display = 'none';
        if (notif.referenceType === 'MATCH') window.location.href = './matches.html';
        if (notif.referenceType === 'CLAIM') window.location.href = './claims.html';
      }
    });
  });
}

// ==================== DASHBOARD PAGE ====================
function updateDashboard() {
  const statLost = document.getElementById('stat-lost-count');
  const statFound = document.getElementById('stat-found-count');
  const statMatch = document.getElementById('stat-match-count');
  const lostGrid = document.getElementById('dash-lost-grid');
  const foundGrid = document.getElementById('dash-found-grid');

  if (statLost) statLost.textContent = state.lostItems.length;
  if (statFound) statFound.textContent = state.foundItems.length;
  if (statMatch) statMatch.textContent = state.matches.length;

  if (lostGrid) {
    lostGrid.innerHTML = state.lostItems.slice(0, 2).map(item => `
      <div style="display:flex; gap:1rem; background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:0.9rem; align-items:center;">
        <img src="${item.imageUrl}" alt="${item.title}" style="width:64px; height:64px; border-radius:var(--radius-sm); object-fit:cover;">
        <div style="flex:1;">
          <div style="display:flex; justify-content:space-between;">
            <h4 style="font-size:0.92rem; font-weight:700;">${item.title}</h4>
            ${item.rewardAmount ? `<span style="font-size:0.75rem; color:var(--accent-amber); font-weight:700;">$${item.rewardAmount} Reward</span>` : ''}
          </div>
          <p style="font-size:0.78rem; color:var(--text-secondary); margin:0.2rem 0 0.4rem;">${item.locationName} • ${item.lostDate}</p>
          <span class="tag-pill">${item.category}</span>
        </div>
      </div>
    `).join('');
  }

  if (foundGrid) {
    foundGrid.innerHTML = state.foundItems.slice(0, 2).map(item => `
      <div style="display:flex; gap:1rem; background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:0.9rem; align-items:center;">
        <img src="${item.imageUrl}" alt="${item.title}" style="width:64px; height:64px; border-radius:var(--radius-sm); object-fit:cover;">
        <div style="flex:1;">
          <h4 style="font-size:0.92rem; font-weight:700;">${item.title}</h4>
          <p style="font-size:0.78rem; color:var(--text-secondary); margin:0.2rem 0 0.4rem;">Held at: ${item.storageLocation} by ${item.currentCustodian}</p>
          <span class="tag-pill" style="color:var(--accent-emerald);">${item.category}</span>
        </div>
      </div>
    `).join('');
  }
}

// ==================== LOST ITEMS PAGE ====================
function renderLostItems() {
  const grid = document.getElementById('lost-items-grid');
  if (!grid) return;

  const query = state.lostSearchQuery.toLowerCase();
  const category = state.selectedLostCategory;

  const filtered = state.lostItems.filter(item => {
    const matchesCat = category === 'ALL' || item.category === category;
    const matchesQuery = !query || 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      (item.locationName && item.locationName.toLowerCase().includes(query)) ||
      (item.attributes?.brand && item.attributes.brand.toLowerCase().includes(query));
    return matchesCat && matchesQuery;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:3rem; background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-subtle);">
        <div style="font-size:2.5rem; margin-bottom:0.5rem;">🔍</div>
        <h3 style="font-size:1.15rem; margin-bottom:0.25rem;">No matching lost reports found</h3>
        <p style="font-size:0.85rem; color:var(--text-secondary);">Try changing your search terms or category filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="item-card">
      <div class="item-media">
        <img src="${item.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600'}" alt="${item.title}" loading="lazy">
        <span class="item-badge-top-left badge-lost">LOST</span>
        ${item.rewardAmount ? `<span class="badge-reward">💰 $${item.rewardAmount} Reward</span>` : ''}
      </div>
      <div class="item-content">
        <div class="item-meta-row">
          <span>${item.lostDate} ${item.lostTime || ''}</span>
          <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--accent-coral); font-weight:700;">#L-${item.id}</span>
        </div>
        <h3 class="item-title">${item.title}</h3>
        <p class="item-desc">${item.description}</p>

        <div class="item-tags">
          <span class="tag-pill">${item.category}</span>
          ${item.attributes?.brand ? `<span class="tag-pill">🏷️ ${item.attributes.brand}</span>` : ''}
          ${item.attributes?.primaryColor ? `<span class="tag-pill">🎨 ${item.attributes.primaryColor}</span>` : ''}
          ${item.attributes?.distinctiveMarks ? `<span class="tag-pill">✨ ${item.attributes.distinctiveMarks}</span>` : ''}
        </div>

        <div class="item-footer">
          <div class="location-snippet">
            <span>📍</span>
            <span>${item.locationName}</span>
          </div>
          <a href="./matches.html?lostId=${item.id}" class="btn btn-sm btn-secondary">
            Radar Match 🎯
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

// ==================== FOUND ITEMS PAGE ====================
function renderFoundItems() {
  const grid = document.getElementById('found-items-grid');
  if (!grid) return;

  const query = state.foundSearchQuery.toLowerCase();
  const category = state.selectedFoundCategory;

  const filtered = state.foundItems.filter(item => {
    const matchesCat = category === 'ALL' || item.category === category;
    const matchesQuery = !query || 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      (item.locationName && item.locationName.toLowerCase().includes(query)) ||
      (item.storageLocation && item.storageLocation.toLowerCase().includes(query)) ||
      (item.attributes?.brand && item.attributes.brand.toLowerCase().includes(query));
    return matchesCat && matchesQuery;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:3rem; background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-subtle);">
        <div style="font-size:2.5rem; margin-bottom:0.5rem;">📦</div>
        <h3 style="font-size:1.15rem; margin-bottom:0.25rem;">No secured items found</h3>
        <p style="font-size:0.85rem; color:var(--text-secondary);">Try changing your search terms or category filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="item-card">
      <div class="item-media">
        <img src="${item.imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600'}" alt="${item.title}" loading="lazy">
        <span class="item-badge-top-left badge-found">FOUND & SECURED</span>
      </div>
      <div class="item-content">
        <div class="item-meta-row">
          <span>${item.foundDate} ${item.foundTime || ''}</span>
          <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--accent-emerald); font-weight:700;">#F-${item.id}</span>
        </div>
        <h3 class="item-title">${item.title}</h3>
        <p class="item-desc">${item.description}</p>

        <div class="item-tags">
          <span class="tag-pill">${item.category}</span>
          ${item.storageLocation ? `<span class="tag-pill" style="border-color:rgba(16,185,129,0.3); color:#a7f3d0;">🛡️ Locker: ${item.storageLocation}</span>` : ''}
          ${item.currentCustodian ? `<span class="tag-pill">👤 Custodian: ${item.currentCustodian}</span>` : ''}
        </div>

        <div class="item-footer">
          <div class="location-snippet">
            <span>📍</span>
            <span>${item.locationName}</span>
          </div>
          <button class="btn btn-sm btn-emerald btn-claim-item" data-found-id="${item.id}" data-found-title="${item.title}" data-question="${item.verificationQuestion || 'Describe unique attributes and prove ownership.'}">
            Claim Item 📑
          </button>
        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.btn-claim-item').forEach(btn => {
    btn.addEventListener('click', () => {
      openClaimModal(btn.dataset.foundId, 1, btn.dataset.foundTitle, btn.dataset.question);
    });
  });
}

// ==================== MATCH RADAR PAGE ====================
function renderRadarMatches() {
  const container = document.getElementById('radar-container');
  if (!container) return;

  if (state.matches.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:3rem; background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-subtle);">
        <p style="font-size:1.1rem; color:var(--text-secondary);">No match radar correlations calculated yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = state.matches.map(m => {
    const lost = state.lostItems.find(i => i.id === m.lostItemId) || state.lostItems[0];
    const found = state.foundItems.find(i => i.id === m.foundItemId) || state.foundItems[0];
    const scorePct = Math.round(m.overallScore * 1000) / 10;
    const bd = m.breakdown;
    const ai = m.aiExplanation;

    return `
      <div style="background:var(--bg-card); border:1px solid var(--border-glow); border-radius:var(--radius-xl); padding:2rem; box-shadow:var(--shadow-md);">
        
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem; padding-bottom:1.2rem; border-bottom:1px solid var(--border-subtle);">
          <div>
            <span class="hero-pill" style="margin-bottom:0.4rem;">AI CANDIDATE MATCH #M-${m.id}</span>
            <h3 style="font-size:1.45rem; font-weight:800;">Multimodal Correlation Analysis</h3>
          </div>
          <div style="display:flex; align-items:center; gap:1rem;">
            <div style="text-align:right;">
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">CONFIDENCE SCORE</div>
              <div style="font-size:1.8rem; font-weight:900; color:var(--accent-emerald); font-family:var(--font-heading);">${scorePct}%</div>
            </div>
            <button class="btn btn-primary btn-claim-from-radar" data-found-id="${found.id}" data-lost-id="${lost.id}" data-found-title="${found.title}" data-question="${found.verificationQuestion || ''}">
              Initiate Claim 🚀
            </button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:2rem;">
          <div style="background:rgba(8,12,21,0.6); border:1px solid rgba(244,63,94,0.3); border-radius:var(--radius-lg); padding:1.25rem;">
            <div style="display:flex; gap:1rem; align-items:center; margin-bottom:0.8rem;">
              <img src="${lost.imageUrl}" alt="${lost.title}" style="width:70px; height:70px; border-radius:var(--radius-md); object-fit:cover;">
              <div>
                <span class="tag-pill" style="background:rgba(244,63,94,0.2); color:var(--accent-coral); font-weight:700;">LOST REPORT</span>
                <h4 style="font-size:1.05rem; font-weight:700; margin-top:0.2rem;">${lost.title}</h4>
                <div style="font-size:0.78rem; color:var(--text-muted);">${lost.locationName} • ${lost.lostDate}</div>
              </div>
            </div>
            <p style="font-size:0.82rem; color:var(--text-secondary);">${lost.description}</p>
          </div>

          <div style="background:rgba(8,12,21,0.6); border:1px solid rgba(16,185,129,0.3); border-radius:var(--radius-lg); padding:1.25rem;">
            <div style="display:flex; gap:1rem; align-items:center; margin-bottom:0.8rem;">
              <img src="${found.imageUrl}" alt="${found.title}" style="width:70px; height:70px; border-radius:var(--radius-md); object-fit:cover;">
              <div>
                <span class="tag-pill" style="background:rgba(16,185,129,0.2); color:var(--accent-emerald); font-weight:700;">FOUND IN CUSTODY</span>
                <h4 style="font-size:1.05rem; font-weight:700; margin-top:0.2rem;">${found.title}</h4>
                <div style="font-size:0.78rem; color:var(--text-muted);">${found.locationName} • ${found.foundDate}</div>
              </div>
            </div>
            <p style="font-size:0.82rem; color:var(--text-secondary);">${found.description}</p>
          </div>
        </div>

        <h4 style="font-size:1rem; margin-bottom:0.8rem; display:flex; align-items:center; gap:0.5rem;">
          <span>📊</span> 6-Dimensional Matching Breakdown
        </h4>
        <div class="radar-grid">
          <div class="radar-bar-row">
            <div class="radar-label-row">
              <span>Visual Similarity (35% weight)</span>
              <span style="font-family:var(--font-mono); color:var(--accent-purple);">${Math.round(bd.visualScore * 100)}%</span>
            </div>
            <div class="radar-track">
              <div class="radar-fill" style="width:${bd.visualScore * 100}%; background:linear-gradient(90deg, #8b5cf6, #d946ef);"></div>
            </div>
          </div>

          <div class="radar-bar-row">
            <div class="radar-label-row">
              <span>Category Compatibility (20% weight)</span>
              <span style="font-family:var(--font-mono); color:var(--accent-emerald);">${Math.round(bd.categoryScore * 100)}%</span>
            </div>
            <div class="radar-track">
              <div class="radar-fill" style="width:${bd.categoryScore * 100}%; background:var(--gradient-emerald);"></div>
            </div>
          </div>

          <div class="radar-bar-row">
            <div class="radar-label-row">
              <span>Physical Attributes & Marks (20% weight)</span>
              <span style="font-family:var(--font-mono); color:var(--accent-cyan);">${Math.round(bd.attributesScore * 100)}%</span>
            </div>
            <div class="radar-track">
              <div class="radar-fill" style="width:${bd.attributesScore * 100}%; background:var(--gradient-cyan);"></div>
            </div>
          </div>

          <div class="radar-bar-row">
            <div class="radar-label-row">
              <span>Textual Semantic Correlation (10% weight)</span>
              <span style="font-family:var(--font-mono); color:var(--accent-indigo);">${Math.round(bd.textScore * 100)}%</span>
            </div>
            <div class="radar-track">
              <div class="radar-fill" style="width:${bd.textScore * 100}%; background:var(--gradient-primary);"></div>
            </div>
          </div>

          <div class="radar-bar-row">
            <div class="radar-label-row">
              <span>Geographic Proximity (10% weight)</span>
              <span style="font-family:var(--font-mono); color:var(--accent-emerald);">${Math.round(bd.locationScore * 100)}%</span>
            </div>
            <div class="radar-track">
              <div class="radar-fill" style="width:${bd.locationScore * 100}%; background:var(--gradient-emerald);"></div>
            </div>
          </div>

          <div class="radar-bar-row">
            <div class="radar-label-row">
              <span>Chronological Timeline Proximity (5% weight)</span>
              <span style="font-family:var(--font-mono); color:var(--accent-amber);">${Math.round(bd.temporalScore * 100)}%</span>
            </div>
            <div class="radar-track">
              <div class="radar-fill" style="width:${bd.temporalScore * 100}%; background:linear-gradient(90deg, #f59e0b, #fbbf24);"></div>
            </div>
          </div>
        </div>

        <div style="background:rgba(8,12,21,0.85); border:1px solid var(--border-glow); border-radius:var(--radius-lg); padding:1.25rem; margin-top:1.5rem;">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.75rem;">
            <span style="font-size:1.2rem;">🤖</span>
            <span style="font-weight:700; color:#c7d2fe;">Gemini AI Match Explanation</span>
            <span class="tag-pill" style="margin-left:auto; background:rgba(16,185,129,0.15); color:var(--accent-emerald); font-weight:700;">Grade: ${ai.confidenceGrade}</span>
          </div>

          <p style="font-size:0.88rem; color:var(--text-primary); margin-bottom:1rem; line-height:1.5;">${ai.executiveSummary}</p>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; font-size:0.82rem;">
            <div>
              <div style="font-weight:700; color:var(--accent-emerald); margin-bottom:0.35rem;">✓ Supporting Correlation Factors:</div>
              <ul style="padding-left:1.2rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:0.25rem;">
                ${ai.matchingFactors.map(f => `<li>${f}</li>`).join('')}
              </ul>
            </div>
            <div>
              <div style="font-weight:700; color:var(--accent-coral); margin-bottom:0.35rem;">⚠ Potential Discrepancies:</div>
              <ul style="padding-left:1.2rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:0.25rem;">
                ${ai.conflictingFactors.map(c => `<li>${c}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid var(--border-subtle); font-size:0.82rem; color:#cbd5e1;">
            <strong>Advisor Recommendation:</strong> ${ai.recommendation}
          </div>
        </div>

      </div>
    `;
  }).join('');

  container.querySelectorAll('.btn-claim-from-radar').forEach(btn => {
    btn.addEventListener('click', () => {
      openClaimModal(btn.dataset.foundId, btn.dataset.lostId, btn.dataset.foundTitle, btn.dataset.question);
    });
  });
}

// ==================== CLAIMS & CUSTODY PAGE ====================
function renderClaims() {
  const container = document.getElementById('claims-container');
  if (!container) return;

  if (state.claims.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:3rem; background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-subtle);">
        <p style="font-size:1.1rem; color:var(--text-secondary);">No active claims submitted yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = state.claims.map(claim => {
    const found = state.foundItems.find(i => i.id === claim.foundItemId) || state.foundItems[0];
    const ai = claim.aiVerification;
    const isSubmitted = claim.status === 'SUBMITTED';
    const isApproved = claim.status === 'APPROVED';

    return `
      <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--radius-xl); padding:1.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.2rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.35rem;">
              <span class="hero-pill" style="margin-bottom:0;">CLAIM #C-${claim.id}</span>
              <span class="tag-pill" style="font-weight:700; ${isApproved ? 'background:rgba(16,185,129,0.2); color:var(--accent-emerald);' : 'background:rgba(99,102,241,0.2); color:#c7d2fe;'}">${claim.status}</span>
            </div>
            <h3 style="font-size:1.2rem; font-weight:700;">Claim for: ${found.title}</h3>
            <div style="font-size:0.8rem; color:var(--text-muted);">Filed by <strong>${claim.claimantName}</strong> • ${new Date(claim.createdAt).toLocaleDateString()}</div>
          </div>

          <div style="display:flex; gap:0.6rem;">
            ${isSubmitted ? `
              <button class="btn btn-sm btn-emerald btn-approve-claim" data-claim-id="${claim.id}">Approve Claim ✓</button>
              <button class="btn btn-sm btn-coral btn-reject-claim" data-claim-id="${claim.id}">Reject ✕</button>
            ` : `<span style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">Status: ${claim.status}</span>`}
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; margin-bottom:1.25rem;">
          <div style="background:rgba(8,12,21,0.5); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.25rem; font-weight:700;">Challenge Question Answer</div>
            <p style="font-size:0.86rem; color:var(--text-primary); line-height:1.4;">${claim.verificationAnswers || 'No answer recorded.'}</p>
          </div>
          <div style="background:rgba(8,12,21,0.5); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.25rem; font-weight:700;">Claimant Proof & Notes</div>
            <p style="font-size:0.86rem; color:var(--text-primary); line-height:1.4;">${claim.proofDescription || 'No additional proof submitted.'}</p>
          </div>
        </div>

        ${ai ? `
          <div style="background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.3); border-radius:var(--radius-md); padding:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
              <span style="font-weight:700; color:var(--accent-emerald); font-size:0.85rem;">🤖 AI Claim Verification: ${ai.verdict} (${Math.round(ai.confidenceScore * 100)}% Confidence)</span>
              <span class="tag-pill" style="background:rgba(16,185,129,0.2); color:var(--accent-emerald); font-weight:700;">Action: ${ai.recommendedAction}</span>
            </div>
            <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:0.6rem;">${ai.reasoning}</p>
            ${ai.matchedEvidence?.length ? `
              <div style="font-size:0.78rem; color:#a7f3d0;">
                <strong>Verifiable Evidence:</strong> ${ai.matchedEvidence.join('; ')}
              </div>
            ` : ''}
          </div>
        ` : ''}

      </div>
    `;
  }).join('');

  container.querySelectorAll('.btn-approve-claim').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.claimId);
      const claim = state.claims.find(c => c.id === id);
      if (claim) {
        claim.status = 'APPROVED';
        await api.updateClaimStatus(id, 'APPROVED', 'Verified by custodian');
        showToast(`Claim #C-${id} has been APPROVED! Item released to owner.`, 'success');
        renderClaims();
      }
    });
  });

  container.querySelectorAll('.btn-reject-claim').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.claimId);
      const claim = state.claims.find(c => c.id === id);
      if (claim) {
        claim.status = 'REJECTED';
        await api.updateClaimStatus(id, 'REJECTED', 'Insufficient verification evidence');
        showToast(`Claim #C-${id} was REJECTED.`, 'error');
        renderClaims();
      }
    });
  });
}

// ==================== EVENT LISTENERS & SETUP ====================
function initEventListeners() {
  // Brand Logo Click
  const brand = document.getElementById('brand-link');
  if (brand) {
    brand.addEventListener('click', () => {
      window.location.href = './index.html';
    });
  }

  // Dashboard modal triggers
  const dashBtnReportLost = document.getElementById('dash-btn-report-lost');
  if (dashBtnReportLost) {
    dashBtnReportLost.addEventListener('click', () => openModal(document.getElementById('modal-report-lost')));
  }

  const dashBtnReportFound = document.getElementById('dash-btn-report-found');
  if (dashBtnReportFound) {
    dashBtnReportFound.addEventListener('click', () => openModal(document.getElementById('modal-report-found')));
  }

  // Lost feed actions
  const btnOpenReportLost = document.getElementById('btn-open-report-lost');
  if (btnOpenReportLost) {
    btnOpenReportLost.addEventListener('click', () => openModal(document.getElementById('modal-report-lost')));
  }

  const lostSearch = document.getElementById('lost-search-input');
  if (lostSearch) {
    lostSearch.addEventListener('input', (e) => {
      state.lostSearchQuery = e.target.value;
      renderLostItems();
    });
  }

  const lostPills = document.getElementById('lost-category-pills');
  if (lostPills) {
    lostPills.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        lostPills.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.selectedLostCategory = pill.dataset.category;
        renderLostItems();
      });
    });
  }

  // Found feed actions
  const btnOpenReportFound = document.getElementById('btn-open-report-found');
  if (btnOpenReportFound) {
    btnOpenReportFound.addEventListener('click', () => openModal(document.getElementById('modal-report-found')));
  }

  const foundSearch = document.getElementById('found-search-input');
  if (foundSearch) {
    foundSearch.addEventListener('input', (e) => {
      state.foundSearchQuery = e.target.value;
      renderFoundItems();
    });
  }

  const foundPills = document.getElementById('found-category-pills');
  if (foundPills) {
    foundPills.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        foundPills.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.selectedFoundCategory = pill.dataset.category;
        renderFoundItems();
      });
    });
  }

  // Persona menu
  const personaPill = document.getElementById('persona-pill');
  const personaMenu = document.getElementById('persona-menu');
  if (personaPill && personaMenu) {
    personaPill.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = personaMenu.style.display === 'none';
      personaMenu.style.display = isHidden ? 'block' : 'none';
      const notifPopover = document.getElementById('notif-popover');
      if (notifPopover) notifPopover.style.display = 'none';
    });
  }

  // Notifications popover
  const notifBell = document.getElementById('notif-bell-btn');
  const notifPopover = document.getElementById('notif-popover');
  if (notifBell && notifPopover) {
    notifBell.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = notifPopover.style.display === 'none';
      notifPopover.style.display = isHidden ? 'block' : 'none';
      if (personaMenu) personaMenu.style.display = 'none';
    });
  }

  const clearNotifs = document.getElementById('clear-notifs-btn');
  if (clearNotifs) {
    clearNotifs.addEventListener('click', () => {
      state.notifications.forEach(n => n.isRead = true);
      renderNotifications();
      showToast('All notifications marked as read', 'info');
    });
  }

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    if (personaMenu) personaMenu.style.display = 'none';
    if (notifPopover) notifPopover.style.display = 'none';
  });

  // Modal dismiss buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.closeModal;
      closeModal(document.getElementById(modalId));
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  // Report Lost Form submission
  const formReportLost = document.getElementById('form-report-lost');
  if (formReportLost) {
    formReportLost.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newItem = {
        title: document.getElementById('lost-form-title')?.value || 'Lost Item',
        category: document.getElementById('lost-form-category')?.value || 'OTHER',
        rewardAmount: parseFloat(document.getElementById('lost-form-reward')?.value) || 0,
        description: document.getElementById('lost-form-description')?.value || '',
        lostDate: document.getElementById('lost-form-date')?.value || new Date().toISOString().split('T')[0],
        lostTime: document.getElementById('lost-form-time')?.value || '12:00',
        locationName: document.getElementById('lost-form-location')?.value || 'Campus',
        city: document.getElementById('lost-form-city')?.value || 'San Jose',
        imageUrl: document.getElementById('lost-form-image')?.value || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600',
        status: 'ACTIVE',
        attributes: {
          brand: document.getElementById('lost-form-brand')?.value || 'Generic',
          model: document.getElementById('lost-form-model')?.value || 'Standard',
          primaryColor: document.getElementById('lost-form-color')?.value || 'Dark',
          distinctiveMarks: document.getElementById('lost-form-marks')?.value || 'None'
        }
      };

      const created = await api.createLostItem(newItem);
      state.lostItems.unshift(created);
      closeModal(document.getElementById('modal-report-lost'));
      formReportLost.reset();
      showToast(`Lost report "${created.title}" successfully published! 🚀`, 'success');
      if (state.currentPage === 'lost') {
        renderLostItems();
      } else {
        window.location.href = './lost.html';
      }
    });
  }

  // Report Found Form submission
  const formReportFound = document.getElementById('form-report-found');
  if (formReportFound) {
    formReportFound.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newItem = {
        title: document.getElementById('found-form-title')?.value || 'Found Item',
        category: document.getElementById('found-form-category')?.value || 'OTHER',
        currentCustodian: document.getElementById('found-form-custodian')?.value || 'Desk',
        description: document.getElementById('found-form-description')?.value || '',
        foundDate: document.getElementById('found-form-date')?.value || new Date().toISOString().split('T')[0],
        foundTime: document.getElementById('found-form-time')?.value || '14:00',
        locationName: document.getElementById('found-form-location')?.value || 'Campus',
        storageLocation: document.getElementById('found-form-storage')?.value || 'Desk',
        verificationQuestion: document.getElementById('found-form-verification-question')?.value || '',
        city: 'San Jose',
        imageUrl: document.getElementById('found-form-image')?.value || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600',
        status: 'ACTIVE',
        attributes: {
          brand: 'Generic',
          model: 'Standard',
          primaryColor: 'Mixed',
          distinctiveMarks: 'Custody secured'
        }
      };

      const created = await api.createFoundItem(newItem);
      state.foundItems.unshift(created);
      closeModal(document.getElementById('modal-report-found'));
      formReportFound.reset();
      showToast(`Found item "${created.title}" recorded in custody! 📦`, 'success');
      if (state.currentPage === 'found') {
        renderFoundItems();
      } else {
        window.location.href = './found.html';
      }
    });
  }

  // Submit Claim Form submission
  const formSubmitClaim = document.getElementById('form-submit-claim');
  if (formSubmitClaim) {
    formSubmitClaim.addEventListener('submit', async (e) => {
      e.preventDefault();
      const claimData = {
        foundItemId: parseInt(document.getElementById('claim-form-found-id')?.value) || 101,
        lostItemId: parseInt(document.getElementById('claim-form-lost-id')?.value) || 1,
        claimantName: state.currentUser.fullName,
        verificationAnswers: document.getElementById('claim-form-answers')?.value || '',
        proofDescription: document.getElementById('claim-form-proof')?.value || ''
      };

      const created = await api.createClaim(claimData);
      closeModal(document.getElementById('modal-submit-claim'));
      showToast('Ownership claim submitted! AI Verification queued.', 'success');
      if (state.currentPage === 'claims') {
        renderClaims();
      } else {
        window.location.href = './claims.html';
      }
    });
  }

  // AI Hub: Vision Dropzone & Presets
  const aiDropzone = document.getElementById('ai-dropzone');
  const aiFileInput = document.getElementById('ai-file-input');
  const aiImagePreview = document.getElementById('ai-image-preview');
  if (aiDropzone && aiFileInput) {
    aiDropzone.addEventListener('click', () => aiFileInput.click());
    aiFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && aiImagePreview) {
        state.activeVisionFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
          aiImagePreview.src = ev.target.result;
          aiImagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const pIphone = document.getElementById('preset-iphone');
  if (pIphone && aiImagePreview) {
    pIphone.addEventListener('click', () => {
      aiImagePreview.src = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600';
      aiImagePreview.style.display = 'block';
      state.activeVisionFile = new File(['mock'], 'iphone.jpg', { type: 'image/jpeg' });
    });
  }

  const pWallet = document.getElementById('preset-wallet');
  if (pWallet && aiImagePreview) {
    pWallet.addEventListener('click', () => {
      aiImagePreview.src = 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600';
      aiImagePreview.style.display = 'block';
      state.activeVisionFile = new File(['mock'], 'wallet.jpg', { type: 'image/jpeg' });
    });
  }

  const pBottle = document.getElementById('preset-bottle');
  if (pBottle && aiImagePreview) {
    pBottle.addEventListener('click', () => {
      aiImagePreview.src = 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600';
      aiImagePreview.style.display = 'block';
      state.activeVisionFile = new File(['mock'], 'bottle.jpg', { type: 'image/jpeg' });
    });
  }

  // AI Hub: Run Vision
  const btnRunVision = document.getElementById('btn-run-vision');
  const visionResults = document.getElementById('vision-results');
  const visionJson = document.getElementById('vision-json-content');
  if (btnRunVision) {
    btnRunVision.addEventListener('click', async () => {
      btnRunVision.innerHTML = `<span>⏳</span> Extracting Attributes with Gemini...`;
      btnRunVision.disabled = true;

      try {
        const res = await api.extractAttributes(state.activeVisionFile || new File([''], 'sample.jpg'));
        state.extractedAiReport = res;

        if (visionResults && visionJson) {
          visionResults.style.display = 'block';
          visionJson.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              <div><strong style="color:var(--accent-purple);">Suggested Title:</strong> ${res.suggestedTitle}</div>
              <div><strong style="color:var(--accent-cyan);">Category:</strong> ${res.category}</div>
              <div><strong style="color:var(--accent-cyan);">Brand & Model:</strong> ${res.brand} ${res.model}</div>
              <div><strong style="color:var(--accent-cyan);">Colors:</strong> ${res.primaryColor} (Primary), ${res.secondaryColor || 'None'}</div>
              <div><strong style="color:var(--accent-amber);">Distinctive Marks:</strong> ${res.distinctiveMarks}</div>
              <div><strong style="color:var(--accent-coral);">Scratches/Damage:</strong> ${res.scratchesOrDamage}</div>
              <div><strong style="color:var(--accent-emerald);">Protection/Case:</strong> ${res.stickersOrAccessories}</div>
            </div>
          `;
        }
        showToast('Multimodal attributes extracted with 94% confidence!', 'success');
      } catch {
        showToast('Vision extraction failed, check connection', 'error');
      } finally {
        btnRunVision.innerHTML = `<span>⚡</span> Run Gemini Vision Analysis`;
        btnRunVision.disabled = false;
      }
    });
  }

  const btnUseVision = document.getElementById('btn-use-vision-report');
  if (btnUseVision) {
    btnUseVision.addEventListener('click', () => {
      if (!state.extractedAiReport) return;
      const r = state.extractedAiReport;
      const t = document.getElementById('lost-form-title');
      const c = document.getElementById('lost-form-category');
      const d = document.getElementById('lost-form-description');
      const b = document.getElementById('lost-form-brand');
      const m = document.getElementById('lost-form-model');
      const clr = document.getElementById('lost-form-color');
      const mrk = document.getElementById('lost-form-marks');
      const img = document.getElementById('lost-form-image');

      if (t) t.value = r.suggestedTitle;
      if (c) c.value = r.category;
      if (d) d.value = r.suggestedDescription;
      if (b) b.value = r.brand;
      if (m) m.value = r.model;
      if (clr) clr.value = r.primaryColor;
      if (mrk) mrk.value = r.distinctiveMarks;
      if (img && aiImagePreview?.src) img.value = aiImagePreview.src;

      openModal(document.getElementById('modal-report-lost'));
      showToast('Report form pre-filled with AI Vision attributes!', 'info');
    });
  }

  // AI Hub: Natural Language Parser
  const nlInput = document.getElementById('nl-report-input');
  const sampleLost = document.getElementById('sample-nl-lost');
  const sampleFound = document.getElementById('sample-nl-found');

  if (sampleLost && nlInput) {
    sampleLost.addEventListener('click', () => {
      nlInput.value = 'I misplaced my navy blue Herschel Little America backpack on the second floor library quiet zone around 3:30pm yesterday. Contains an Apple MacBook Air with a GitHub sticker.';
    });
  }

  if (sampleFound && nlInput) {
    sampleFound.addEventListener('click', () => {
      nlInput.value = 'Found a set of silver Toyota car keys with a red carabiner clip near the Student Union dining hall cashier around 12:15pm today.';
    });
  }

  const btnRunNl = document.getElementById('btn-run-nl-parse');
  const nlResults = document.getElementById('nl-results');
  const nlJson = document.getElementById('nl-json-content');

  if (btnRunNl && nlInput) {
    btnRunNl.addEventListener('click', async () => {
      const text = nlInput.value.trim();
      if (!text) {
        showToast('Please enter report text to parse', 'error');
        return;
      }

      btnRunNl.innerHTML = `<span>⏳</span> Parsing Report Entities...`;
      btnRunNl.disabled = true;

      try {
        const res = await api.parseNaturalLanguage(text);
        if (nlResults && nlJson) {
          nlResults.style.display = 'block';
          nlJson.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              <div><strong style="color:var(--accent-emerald);">Detected Intent:</strong> ${res.reportType} REPORT (${Math.round(res.confidenceScore * 100)}% confidence)</div>
              <div><strong style="color:var(--accent-cyan);">Title:</strong> ${res.title}</div>
              <div><strong style="color:var(--accent-cyan);">Category:</strong> ${res.category}</div>
              <div><strong style="color:var(--accent-cyan);">Location:</strong> ${res.locationName}, ${res.city}</div>
              <div><strong style="color:var(--accent-purple);">Timestamp:</strong> ${res.reportedDate} at ${res.reportedTime}</div>
              <div><strong style="color:var(--accent-amber);">Extracted Attributes:</strong> ${JSON.stringify(res.attributes)}</div>
            </div>
          `;
        }
        showToast('Conversational text converted to structured entity JSON!', 'success');
      } catch {
        showToast('Failed to parse text', 'error');
      } finally {
        btnRunNl.innerHTML = `<span>✨</span> Parse with LLM Client`;
        btnRunNl.disabled = false;
      }
    });
  }

  const btnUseNl = document.getElementById('btn-use-nl-report');
  if (btnUseNl && nlInput) {
    btnUseNl.addEventListener('click', () => {
      const t = document.getElementById('lost-form-title');
      const d = document.getElementById('lost-form-description');
      const l = document.getElementById('lost-form-location');
      if (t) t.value = 'Reported Item';
      if (d) d.value = nlInput.value;
      if (l) l.value = 'Campus Library';
      openModal(document.getElementById('modal-report-lost'));
      showToast('Form filled from conversational text!', 'info');
    });
  }
}

// ==================== APP BOOTSTRAP ====================
function initApp() {
  console.log(`⚡ Initializing LostRadar AI — Page: ${state.currentPage}`);

  // Set default dates on modal forms
  const today = new Date().toISOString().split('T')[0];
  const lostDate = document.getElementById('lost-form-date');
  const foundDate = document.getElementById('found-form-date');
  if (lostDate) lostDate.value = today;
  if (foundDate) foundDate.value = today;

  // Initialize common UI components
  updatePersonaDisplay();
  renderPersonaMenu();
  renderNotifications();
  initEventListeners();

  // Render current page content immediately
  if (state.currentPage === 'dashboard') updateDashboard();
  if (state.currentPage === 'lost') renderLostItems();
  if (state.currentPage === 'found') renderFoundItems();
  if (state.currentPage === 'matches') renderRadarMatches();
  if (state.currentPage === 'claims') renderClaims();

  // Background non-blocking check for backend health
  api.checkHealth().then(isOnline => {
    const dot = document.getElementById('backend-status-dot');
    const txt = document.getElementById('backend-status-text');
    if (dot && txt) {
      if (isOnline) {
        dot.style.background = '#10b981';
        txt.textContent = 'Backend Online (Port 8080)';
      } else {
        dot.style.background = '#f59e0b';
        txt.textContent = 'Offline / Local Fast-Sim';
      }
    }
  }).catch(() => {});

  // Background non-blocking sync with API
  Promise.all([
    api.getLostItems(),
    api.getFoundItems(),
    api.getMatches(1),
    api.getClaims()
  ]).then(([lost, found, matches, claims]) => {
    if (lost && lost.length) state.lostItems = lost;
    if (found && found.length) state.foundItems = found;
    if (matches && matches.length) state.matches = matches;
    if (claims && claims.length) state.claims = claims;

    // Refresh active page view
    if (state.currentPage === 'dashboard') updateDashboard();
    if (state.currentPage === 'lost') renderLostItems();
    if (state.currentPage === 'found') renderFoundItems();
    if (state.currentPage === 'matches') renderRadarMatches();
    if (state.currentPage === 'claims') renderClaims();
  }).catch(e => {
    console.warn('Seeded fallback records in use:', e);
  });
}

// Robust Kickoff (handles DOMContentLoaded already fired or pending)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
