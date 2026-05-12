import * as SecureStore from 'expo-secure-store';

// Unified API — yakabass FastAPI backend serves all clubs
const API_URL = __DEV__ ? 'http://localhost:8000' : 'https://yakabass-api-production.up.railway.app';

let accessToken: string | null = null;
let refreshToken: string | null = null;

export async function loadTokens() {
  accessToken = await SecureStore.getItemAsync('accessToken');
  refreshToken = await SecureStore.getItemAsync('refreshToken');
}

export async function saveTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  await SecureStore.setItemAsync('accessToken', access);
  await SecureStore.setItemAsync('refreshToken', refresh);
}

export async function clearTokens() {
  accessToken = null;
  refreshToken = null;
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
}

export function getAccessToken() {
  return accessToken;
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    await saveTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function api<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Don't set Content-Type for FormData (multipart)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      res = await fetch(`${API_URL}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth API
export const authApi = {
  register: (data: any) => api('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (email: string, password: string) => api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => api('/api/auth/logout', { method: 'POST' }),
};

// Tournament API
export const tournamentApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api(`/api/tournaments${qs}`);
  },
  get: (id: string) => api(`/api/tournaments/${id}`),
  create: (data: any) => api('/api/tournaments', { method: 'POST', body: JSON.stringify(data) }),
  register: (id: string) => api(`/api/tournaments/${id}/register`, { method: 'POST' }),
  leaderboard: (id: string) => api(`/api/tournaments/${id}/leaderboard`),
};

// Catch API — GPS-verified submissions
export const catchApi = {
  submit: (formData: FormData) => api('/api/catches/submit', { method: 'POST', body: formData }),
  forTournament: (tournamentId: string) => api(`/api/catches/tournament/${tournamentId}`),
};

// Angler API
export const anglerApi = {
  profile: (id: string) => api(`/api/anglers/${id}/profile`),
  catches: (id: string) => api(`/api/anglers/${id}/catches`),
};

// Club API
export const clubApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api(`/api/clubs${qs}`);
  },
  get: (id: string) => api(`/api/clubs/${id}`),
  standings: (id: string, year?: number) => api(`/api/clubs/${id}/standings${year ? `?year=${year}` : ''}`),
};
