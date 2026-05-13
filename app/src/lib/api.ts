// Unified API — yakabass FastAPI backend serves all clubs
const API_URL = __DEV__ ? 'http://localhost:8000' : 'https://yakabass-api-production.up.railway.app';

// Token getter — set by auth provider so API calls can attach Clerk JWT
let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(getter: () => Promise<string | null>) {
  _getToken = getter;
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

  // Attach Clerk JWT if available
  if (_getToken) {
    const token = await _getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.detail || error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Tournament API
export const tournamentApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api(`/api/tournaments${qs}`);
  },
  get: (id: string) => api(`/api/tournaments/${id}`),
  register: (id: string) => api(`/api/tournaments/${id}/register`, { method: 'POST' }),
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
