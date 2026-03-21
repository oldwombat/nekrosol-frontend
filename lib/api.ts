// lib/api.ts
// Centralised API client. Single source of truth for base URL, credentials,
// and error normalisation. All API calls in hooks should use these functions.

import type { PlayerProfile } from '@/app/(tabs)/home-data';

// PlayerMe is an alias for the canonical PlayerProfile type from home-data.
export type PlayerMe = PlayerProfile;

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export type ActionResult = {
  player?: PlayerMe;
  gain?: number;
  inventoryCounts?: Record<string, number>;
  radiationTick?: { decayed: number; damage: 0 | 2 };
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

export type PrestigeResult = {
  success?: boolean;
  skill?: string;
  prestige?: number;
  player?: PlayerMe;
  error?: string;
  // Returned when prestige is blocked by an incomplete quest
  questId?: string | null;
  questTitle?: string | null;
  hint?: string;
};

export type PlayerQuest = {
  id: string;
  status: 'locked' | 'available' | 'completed';
  completedAt?: string | null;
  quest: {
    id: string;
    skill: string;
    prestigeLevel: number;
    title: string;
    description: string;
    requirementType: string;
    requirementData?: Record<string, unknown> | null;
  };
};

export type QuestsResult = {
  quests?: PlayerQuest[];
  error?: string;
};

export type CompleteQuestResult = {
  success?: boolean;
  questProgress?: PlayerQuest;
  error?: string;
};

export type MissionCost = { type: string; amount?: number };
export type MissionReward = { type: string; min?: number; max?: number; stat?: string; value?: number; itemKey?: string; probability?: number };

export type LiveMission = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  category?: string | null;
  primarySkill?: string | null;
  tier?: number | null;
  costs?: MissionCost[] | null;
  rewards?: MissionReward[] | null;
  available: boolean;
  blockedReasons: string[];
  hideAfterCompletion?: boolean;
};

export type MissionsResult = {
  missions?: LiveMission[];
  unreadMessages?: number;
  error?: string;
};

export type NpcMessage = {
  id: string;
  npcSlug?: string | null;
  npcName?: string | null;
  subject?: string | null;
  body?: string | null;
  type?: string | null;
  isRead?: boolean | null;
  createdAt?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type MessagesResult = {
  messages?: NpcMessage[];
  unreadCount?: number;
  error?: string;
};

export type ShopItem = {
  id: string | number;
  key: string;
  name: string;
  description: string | null;
  category: string;
  maxStack: number;
  value: number;
};

export type ShopResult = {
  items?: ShopItem[];
  error?: string;
};

export type PurchaseResult = {
  ok?: boolean;
  purchased?: { itemKey: string; quantity: number; totalCost: number };
  credits?: number;
  inventory?: Record<string, number>;
  error?: string;
  creditsNeeded?: number;
  creditsHave?: number;
};

export type BankTerm = {
  id: string;
  label: string;
  durationMs: number;
  interestRate: number;
};

export type BankDeposit = {
  id: string | number;
  amount: number;
  interestRate: number;
  depositedAt: string;
  maturesAt: string;
  matured: boolean;
  return: number;
};

export type BankResult = {
  ok?: boolean;
  credits?: number;
  terms?: BankTerm[];
  activeDeposit?: BankDeposit | null;
  error?: string;
};

export type BankDepositResult = {
  ok?: boolean;
  deposit?: BankDeposit;
  credits?: number;
  error?: string;
};

export type BankWithdrawResult = {
  ok?: boolean;
  deposited?: number;
  earned?: number;
  returned?: number;
  credits?: number;
  error?: string;
};

export type NpcInteractResult = {
  ok?: boolean;
  npc?: { id: string; name: string };
  dialogue?: string;
  unlockedMissions?: { slug: string; name: string }[];
  error?: string;
};

export const api = {
  players: {
    me: () => request<{ user: PlayerMe }>('/api/players/me', { credentials: 'include' }),
    login: (email: string, password: string) =>
      request<{ user: PlayerMe }>('/api/players/login', {
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
    prestige: (skill: string) =>
      request<PrestigeResult>('/api/player-prestige', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ skill }),
        headers: { 'Content-Type': 'application/json' },
      }),
    quests: () => request<QuestsResult>('/api/player-quests', { credentials: 'include' }),
    completeQuest: (id: string) =>
      request<CompleteQuestResult>(`/api/player-quests/${id}/complete`, {
        method: 'POST',
        credentials: 'include',
      }),
    missions: () => request<MissionsResult>('/api/missions', { credentials: 'include' }),
    messages: () => request<MessagesResult>('/api/messages', { credentials: 'include' }),
    markMessageRead: (id: string) =>
      request<{ success: boolean }>(`/api/messages/${id}/read`, {
        method: 'POST',
        credentials: 'include',
      }),
    shop: () => request<ShopResult>('/api/shop', { credentials: 'include' }),
    purchase: (itemKey: string, quantity = 1) =>
      request<PurchaseResult>('/api/shop/purchase', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ itemKey, quantity }),
        headers: { 'Content-Type': 'application/json' },
      }),
    bank: () => request<BankResult>('/api/bank', { credentials: 'include' }),
    bankDeposit: (termId: string, amount: number) =>
      request<BankDepositResult>('/api/bank/deposit', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ termId, amount }),
        headers: { 'Content-Type': 'application/json' },
      }),
    bankWithdraw: () =>
      request<BankWithdrawResult>('/api/bank/withdraw', {
        method: 'POST',
        credentials: 'include',
      }),
    npcInteract: (npcId: string) =>
      request<NpcInteractResult>('/api/npc/interact', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ npcId }),
        headers: { 'Content-Type': 'application/json' },
      }),
  },
};
