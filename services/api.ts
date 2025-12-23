const API_BASE = '/api';

export const api = {
  // Auth
  async register(username, password, email) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email })
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async getMe(token) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  // Family
  async createFamily(token, name) {
    const res = await fetch(`${API_BASE}/family/create`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async getMyFamily(token) {
    const res = await fetch(`${API_BASE}/family/my`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async inviteMember(token, username) {
    const res = await fetch(`${API_BASE}/family/invite`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ username })
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async getNotifications(token) {
    const res = await fetch(`${API_BASE}/user/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async respondToInvite(token, notificationId, accept) {
    const res = await fetch(`${API_BASE}/user/notifications/${notificationId}/respond`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ accept })
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async setRole(token, targetUserId, role) {
    const res = await fetch(`${API_BASE}/family/role`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ targetUserId, role })
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  // Upload
  async uploadPhoto(token, file) {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await fetch(`${API_BASE}/upload/photo`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  // Diagnosis
  async getDiagnosisHistory(token) {
    const res = await fetch(`${API_BASE}/diagnosis`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async saveDiagnosis(token, diagnosis) {
    const res = await fetch(`${API_BASE}/diagnosis`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(diagnosis)
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async deleteDiagnosis(token, id) {
    const res = await fetch(`${API_BASE}/diagnosis/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw await res.json();
    return res.json();
  }
};
