import { useCallback, useState } from 'react';

import { api } from '@/lib/api';
import type { PlayerQuest, LiveMission } from '@/lib/api';
import type { PlayerProfile } from './home-data';
import { type SkillKey } from './home-data';
import { useHomeInventory } from './home-inventory';
import { useToasts } from '@/hooks/use-toast-queue';

export type { };

type SubmitArgs = {
  email: string;
  password: string;
  onAuthenticated?: () => void;
};

type SignOutArgs = {
  onSignedOut?: () => void;
};

export function useHomeAuth() {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [quests, setQuests] = useState<PlayerQuest[]>([]);
  const [missions, setMissions] = useState<LiveMission[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const { inventoryItems, inventoryCounts, loadInventory, resetInventory, mergeInventoryCounts } =
    useHomeInventory();

  const { addToast } = useToasts();

  const loadQuests = useCallback(async () => {
    try {
      const result = await api.game.quests();
      if (result.ok) setQuests(result.data?.quests ?? []);
    } catch {
      // Non-fatal — quests just won't show until next load
    }
  }, []);

  const loadMissions = useCallback(async () => {
    try {
      const result = await api.game.missions();
      if (result.ok) {
        setMissions(result.data?.missions ?? []);
        setUnreadMessages(result.data?.unreadMessages ?? 0);
      }
    } catch {
      // Non-fatal
    }
  }, []);

  const loadCurrentPlayer = useCallback(async () => {
    try {
      const result = await api.players.me();

      if (!result.ok) {
        setPlayer(null);
        return;
      }

      setPlayer(result.data?.user ?? null);
      await Promise.all([loadInventory(), loadQuests(), loadMissions()]);
    } catch (error) {
      console.error('Error loading player session:', error);
      setPlayer(null);
    }
  }, [loadInventory, loadQuests, loadMissions]);

  const onSubmit = useCallback(async ({ email, password, onAuthenticated }: SubmitArgs) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const loginResult = await api.players.login(email, password);

      if (loginResult.ok) {
        setPlayer(loginResult.data?.user ?? null);
        await Promise.all([loadInventory(), loadQuests(), loadMissions()]);
        onAuthenticated?.();
        return;
      }

      if (loginResult.status !== 401) {
        throw new Error('Unable to authenticate with these credentials');
      }

      const signupResult = await api.players.signup(email, password);

      if (!signupResult.ok) {
        throw new Error('Unable to authenticate with these credentials');
      }

      const secondLoginResult = await api.players.login(email, password);

      if (!secondLoginResult.ok) {
        throw new Error('Unable to authenticate with these credentials');
      }

      setPlayer(secondLoginResult.data?.user ?? null);
      await Promise.all([loadInventory(), loadQuests(), loadMissions()]);
      onAuthenticated?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [loadInventory, loadQuests, loadMissions]);

  const onSignOut = useCallback(async ({ onSignedOut }: SignOutArgs = {}) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      await api.players.logout();
      setPlayer(null);
      setMissions([]);
      setUnreadMessages(0);
      resetInventory();
      onSignedOut?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign out';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [resetInventory]);

  const onAction = useCallback(async (action: string): Promise<boolean> => {
    setActionLoading(action);
    setErrorMessage(null);
    setActionMessage(null);

    try {
      const result = await api.game.action(action);

      if (!result.ok) {
        throw new Error(result.error || 'Action failed');
      }

      const data = result.data;
      setPlayer(data?.player ?? null);
      mergeInventoryCounts(data?.inventoryCounts);

      // Reload missions + messages after any action (availability may have changed)
      await Promise.all([loadInventory(), loadMissions()]);

      // Fire toast notifications for notable events
      const sc = data?.statChanges ?? {};
      if ((sc.health ?? 0) < 0) addToast(`❤️ ${Math.abs(sc.health!)} health lost`, 'red');
      if ((sc.health ?? 0) > 0) addToast(`❤️ +${sc.health} health restored`, 'green');
      if ((sc.radiation ?? 0) > 0) addToast(`☢ +${sc.radiation} radiation`, 'red');
      for (const delta of (data?.inventoryDeltas ?? [])) {
        if (delta.direction === 'add') addToast(`📦 +${delta.quantity}× ${delta.itemKey}`, 'blue');
        else addToast(`📦 Used ${delta.quantity}× ${delta.itemKey}`, 'blue');
      }

      const radiationTick = data?.radiationTick;
      const radDamageMsg = (radiationTick?.damage ?? 0) > 0 ? ' ⚠️ Radiation sickness: -2 health' : '';
      const radDecayMsg = (radiationTick?.decayed ?? 0) > 0 ? ` (radiation decayed by ${radiationTick?.decayed})` : '';
      const newMsgs = data?.newMessages ?? 0;
      const newMsgNote = newMsgs > 0 ? ` 📬 ${newMsgs} new message${newMsgs > 1 ? 's' : ''}` : '';

      const slug = action.toLowerCase();
      switch (slug) {
        case 'beg':
          setActionMessage(`You begged and received ${data?.gain ?? 0} credits.${radDamageMsg}${radDecayMsg}${newMsgNote}`);
          break;
        case 'escort':
          setActionMessage(
            `Convoy escorted. +${data?.gain ?? 0} credits.${(radiationTick?.damage ?? 0) > 0 ? ' ⚠️ Took 2 damage!' : ''}${radDecayMsg}${newMsgNote}`,
          );
          break;
        default:
          setActionMessage(`${action} applied successfully.${radDamageMsg}${radDecayMsg}${newMsgNote}`);
          break;
      }

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Action failed';
      setErrorMessage(message);
      return false;
    } finally {
      setActionLoading(null);
    }
  }, [addToast, loadInventory, loadMissions, mergeInventoryCounts]);

  const onPrestige = useCallback(async (skill: SkillKey): Promise<boolean> => {
    setActionLoading(skill);
    setErrorMessage(null);
    setActionMessage(null);

    try {
      const result = await api.game.prestige(skill);

      if (!result.ok) {
        // If blocked by quest (403), surface the quest title — caller will open the modal
        throw new Error(result.error || 'Prestige failed');
      }

      setPlayer(result.data?.player ?? null);
      // Unlock next prestige level's quest is handled server-side; refresh quests
      await loadQuests();
      setActionMessage(`🌟 ${skill.charAt(0).toUpperCase() + skill.slice(1)} prestiged! Rank advanced — skill reset to 1.`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Prestige failed';
      setErrorMessage(message);
      return false;
    } finally {
      setActionLoading(null);
    }
  }, [loadQuests]);

  const onCompleteQuest = useCallback(async (questProgressId: string): Promise<boolean> => {
    try {
      const result = await api.game.completeQuest(questProgressId);
      if (!result.ok) {
        setErrorMessage(result.error || 'Could not complete quest');
        return false;
      }
      await loadQuests();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Quest completion failed';
      setErrorMessage(message);
      return false;
    }
  }, [loadQuests]);

  return {
    loading,
    actionLoading,
    player,
    quests,
    missions,
    unreadMessages,
    inventoryItems,
    inventoryCounts,
    errorMessage,
    actionMessage,
    loadCurrentPlayer,
    loadInventory,
    loadMissions,
    onSubmit,
    onSignOut,
    onAction,
    onPrestige,
    onCompleteQuest,
  };
}
