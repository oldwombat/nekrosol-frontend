// lib/api.ts
// Centralised API client. Single source of truth for base URL, credentials,
// and error normalisation. All API calls in hooks should use these functions.

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export type PlayerMe = {
  id?: string | number;
  email?: string;
  displayName?: string | null;
  credits?: number | null;
  creditsMax?: number | null;
  energy?: number | null;
  energyMax?: number | null;
  health?: number | null;
  healthMax?: number | null;
  radiation?: number | null;
  radiationMax?: number | null;
  thug?: number | null;
  thief?: number | null;
  grifter?: number | null;
  pilot?: number | null;
  medic?: number | null;
  hacker?: number | null;
  technician?: number | null;
  chemist?: number | null;
  physicist?: number | null;
  scavenger?: number | null;
  mechanic?: number | null;
  smuggler?: number | null;
};

export type ActionResult = {
  player?: PlayerMe;
  gain?: number;
  inventoryCounts?: Record<string, number>;
  error?: string;
};

export type InventoryItem = {
  id?: string | number;
  itemKey: string;
  quantity: number;
};

export type InventoryResult = {
  items?: InventoryItem[];
};

type ApiResponse<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${BASE}${path}`, init);
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      return {
        ok: false,
        status: response.status,
        error: (body as { error?: string } | null)?.error ?? response.statusText,
      };
    }
    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch (err) {
    return { ok: false, status: 0, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export const api = {
  players: {
    me: () => request<PlayerMe>('/api/players/me', { credentials: 'include' }),
    login: (email: string, password: string) =>
      request('/api/players/login', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
      }),
    signup: (email: string, password: string) =>
      request('/api/players', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
      }),
    logout: () => request('/api/players/logout', { method: 'POST', credentials: 'include' }),
  },
  game: {
    action: (action: string) =>
      request<ActionResult>('/api/player-actions', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ action }),
        headers: { 'Content-Type': 'application/json' },
      }),
    inventory: () => request<InventoryResult>('/api/player-inventory', { credentials: 'include' }),
  },
};
