import {
  MOCK_USERS,
  MOCK_LOST_ITEMS,
  MOCK_FOUND_ITEMS,
  MOCK_MATCHES,
  MOCK_CLAIMS,
  MOCK_NOTIFICATIONS
} from './mock-data.js';

const API_BASE_URL = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('lf_token') || '';
    this.isBackendOnline = null;
    this.currentUser = JSON.parse(localStorage.getItem('lf_user') || 'null') || MOCK_USERS[0];
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('lf_token', token);
  }

  setUser(user) {
    this.currentUser = user;
    localStorage.setItem('lf_user', JSON.stringify(user));
  }

  logout() {
    this.token = '';
    this.currentUser = null;
    localStorage.removeItem('lf_token');
    localStorage.removeItem('lf_user');
  }

  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        signal: controller.signal,
        headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {}
      });
      clearTimeout(timeoutId);
      this.isBackendOnline = res.status !== 502 && res.status !== 503;
      return this.isBackendOnline;
    } catch {
      this.isBackendOnline = false;
      return false;
    }
  }

  async request(endpoint, options = {}) {
    const headers = {
      ...(options.headers || {})
    };

    if (this.token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: options.signal || controller.signal,
        headers
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }

      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    } catch (err) {
      console.warn(`[API] Fallback for ${endpoint} due to:`, err.message);
      return this.handleFallback(endpoint, options);
    }
  }

  handleFallback(endpoint, options) {
    // Auth Fallbacks
    if (endpoint === '/auth/login') {
      const body = JSON.parse(options.body || '{}');
      const user = MOCK_USERS.find(u => u.email === body.email) || MOCK_USERS[0];
      return { token: 'mock-jwt-token-xyz-12345', user };
    }
    if (endpoint === '/auth/register') {
      const body = JSON.parse(options.body || '{}');
      const newUser = { id: Date.now(), email: body.email, fullName: body.fullName, role: 'ROLE_USER' };
      return { token: 'mock-jwt-token-xyz-12345', user: newUser };
    }
    if (endpoint === '/auth/me') {
      return this.currentUser || MOCK_USERS[0];
    }

    // Items Fallbacks
    if (endpoint.startsWith('/lost-items')) {
      if (options.method === 'POST') {
        const isMultipart = options.body instanceof FormData;
        const newLost = isMultipart 
          ? JSON.parse(options.body.get('item') || '{}')
          : JSON.parse(options.body || '{}');
        const created = {
          id: Date.now(),
          ...newLost,
          status: 'ACTIVE',
          imageUrl: newLost.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
          attributes: newLost.attributes || {}
        };
        MOCK_LOST_ITEMS.unshift(created);
        return created;
      }
      return { content: MOCK_LOST_ITEMS, totalElements: MOCK_LOST_ITEMS.length };
    }

    if (endpoint.startsWith('/found-items')) {
      if (options.method === 'POST') {
        const isMultipart = options.body instanceof FormData;
        const newFound = isMultipart 
          ? JSON.parse(options.body.get('item') || '{}')
          : JSON.parse(options.body || '{}');
        const created = {
          id: Date.now(),
          ...newFound,
          status: 'ACTIVE',
          imageUrl: newFound.imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80',
          attributes: newFound.attributes || {}
        };
        MOCK_FOUND_ITEMS.unshift(created);
        return created;
      }
      return { content: MOCK_FOUND_ITEMS, totalElements: MOCK_FOUND_ITEMS.length };
    }

    // Matches Fallbacks
    if (endpoint.startsWith('/matches/lost/')) {
      return MOCK_MATCHES;
    }

    // Claims Fallbacks
    if (endpoint.startsWith('/claims')) {
      if (options.method === 'POST') {
        const newClaim = JSON.parse(options.body || '{}');
        const created = {
          id: Date.now(),
          ...newClaim,
          claimantName: this.currentUser?.fullName || 'Alex Mercer',
          status: 'SUBMITTED',
          createdAt: new Date().toISOString()
        };
        MOCK_CLAIMS.unshift(created);
        return created;
      }
      return MOCK_CLAIMS;
    }

    // Notifications Fallbacks
    if (endpoint.startsWith('/notifications/unread-count')) {
      return { unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length };
    }
    if (endpoint.startsWith('/notifications')) {
      return { content: MOCK_NOTIFICATIONS };
    }

    // AI Fallbacks
    if (endpoint === '/ai/extract-attributes') {
      return {
        category: 'ELECTRONICS',
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        primaryColor: 'Space Gray',
        secondaryColor: 'Black',
        distinctiveMarks: 'Holographic sticker on lower rear glass',
        scratchesOrDamage: 'Light micro-abrasions along upper edge',
        stickersOrAccessories: 'Clear shockproof protective bumper',
        suggestedTitle: 'Space Gray Apple iPhone 15 Pro with Clear Case',
        suggestedDescription: 'Detected flagship smartphone in Space Gray finish with visible protective case and custom sticker.',
        confidenceScore: 0.94
      };
    }
    if (endpoint === '/ai/parse-report') {
      const body = JSON.parse(options.body || '{}');
      const text = (body.text || '').toLowerCase();
      const isFound = text.includes('found');
      return {
        reportType: isFound ? 'FOUND' : 'LOST',
        category: text.includes('phone') ? 'ELECTRONICS' : (text.includes('wallet') ? 'WALLET_AND_PURSE' : 'BAGS_AND_BACKPACKS'),
        title: isFound ? 'Found Item Near Campus' : 'Lost Personal Item',
        description: body.text || 'User report',
        reportedDate: '2026-10-03',
        reportedTime: '15:00',
        locationName: text.includes('library') ? 'Central Campus Library' : 'Student Union',
        city: 'San Jose',
        attributes: {
          brand: text.includes('apple') ? 'Apple' : (text.includes('fossil') ? 'Fossil' : 'Generic'),
          model: text.includes('15') ? '15 Pro' : 'Standard',
          primaryColor: text.includes('blue') ? 'Blue' : (text.includes('brown') ? 'Brown' : 'Black'),
          distinctiveMarks: text.includes('sticker') ? 'Visible stickers' : 'None',
          scratchesOrDamage: text.includes('scratch') ? 'Scratch observed' : 'None'
        },
        confidenceScore: 0.92
      };
    }
    if (endpoint.startsWith('/ai/verify-claim/')) {
      return MOCK_CLAIMS[0].aiVerification;
    }
    if (endpoint.startsWith('/ai/explain-match/')) {
      return MOCK_MATCHES[0].aiExplanation;
    }

    return {};
  }

  // --- High Level Client Convenience Methods ---
  async getLostItems(params = {}) {
    const q = new URLSearchParams(params).toString();
    const res = await this.request(`/lost-items${q ? '?' + q : ''}`);
    return Array.isArray(res) ? res : (res?.content || MOCK_LOST_ITEMS);
  }

  async getLostItem(id) {
    const items = await this.getLostItems();
    return items.find(i => i.id == id) || MOCK_LOST_ITEMS[0];
  }

  async createLostItem(itemData, imageFile = null) {
    if (imageFile) {
      const formData = new FormData();
      formData.append('item', JSON.stringify(itemData));
      formData.append('image', imageFile);
      return this.request('/lost-items', { method: 'POST', body: formData });
    }
    return this.request('/lost-items', { method: 'POST', body: JSON.stringify(itemData) });
  }

  async getFoundItems(params = {}) {
    const q = new URLSearchParams(params).toString();
    const res = await this.request(`/found-items${q ? '?' + q : ''}`);
    return Array.isArray(res) ? res : (res?.content || MOCK_FOUND_ITEMS);
  }

  async getFoundItem(id) {
    const items = await this.getFoundItems();
    return items.find(i => i.id == id) || MOCK_FOUND_ITEMS[0];
  }

  async createFoundItem(itemData, imageFile = null) {
    if (imageFile) {
      const formData = new FormData();
      formData.append('item', JSON.stringify(itemData));
      formData.append('image', imageFile);
      return this.request('/found-items', { method: 'POST', body: formData });
    }
    return this.request('/found-items', { method: 'POST', body: JSON.stringify(itemData) });
  }

  async getMatches(lostItemId = 1) {
    const res = await this.request(`/matches/lost/${lostItemId}`);
    return Array.isArray(res) ? res : MOCK_MATCHES;
  }

  async explainMatch(matchId = 501) {
    return this.request(`/ai/explain-match/${matchId}`);
  }

  async getClaims() {
    const res = await this.request('/claims');
    return Array.isArray(res) ? res : MOCK_CLAIMS;
  }

  async createClaim(claimData) {
    return this.request('/claims', {
      method: 'POST',
      body: JSON.stringify(claimData)
    });
  }

  async verifyClaim(claimId = 301) {
    return this.request(`/ai/verify-claim/${claimId}`);
  }

  async updateClaimStatus(claimId, status, notes = '') {
    return this.request(`/claims/${claimId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ status, reviewerNotes: notes })
    });
  }

  async extractAttributes(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.request('/ai/extract-attributes', {
      method: 'POST',
      body: formData
    });
  }

  async parseNaturalLanguage(text) {
    return this.request('/ai/parse-report', {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }

  async getNotifications() {
    const res = await this.request('/notifications');
    return Array.isArray(res) ? res : (res?.content || MOCK_NOTIFICATIONS);
  }

  async getUnreadCount() {
    const res = await this.request('/notifications/unread-count');
    return res?.unreadCount !== undefined ? res.unreadCount : 2;
  }
}

export const api = new ApiClient();
