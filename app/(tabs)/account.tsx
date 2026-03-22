import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { base, buttons, Colors, form } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getSkillRank, skillItems, type PlayerProfile as FullPlayerProfile } from './home-data';

type PlayerProfile = FullPlayerProfile & {
  email?: string;
  createdAt?: string;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const formatDate = (input?: string) => {
  if (!input) return 'Unknown';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatAge = (input?: string) => {
  if (!input) return 'Unknown';
  const created = new Date(input);
  if (Number.isNaN(created.getTime())) return 'Unknown';

  const now = new Date();
  const ms = now.getTime() - created.getTime();
  if (ms < 0) return 'Unknown';

  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days < 1) return 'Today';
  if (days === 1) return '1 day';
  return `${days} days`;
};

export default function AccountScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingTitle, setSavingTitle] = useState(false);
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [titleMessage, setTitleMessage] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = Colors[isDark ? 'dark' : 'light'];

  const authUrl = useMemo(
    () => ({
      me: `${API_BASE_URL}/api/players/me`,
      title: `${API_BASE_URL}/api/players/title`,
    }),
    [],
  );

  /** All rank names the player has currently earned (one per skilled skill). */
  const earnedRanks = useMemo<string[]>(() => {
    if (!player) return [];
    return skillItems
      .map((s) => {
        const value = Number(player[s.key as keyof PlayerProfile] ?? 0);
        const prestige = Number(player[`${s.key}Prestige` as keyof PlayerProfile] ?? 0);
        return getSkillRank(s.key, value, prestige);
      })
      .filter((r): r is string => r !== null);
  }, [player]);

  const loadPlayer = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(authUrl.me, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Please sign in to view account settings.');
      }

      const data = await response.json();
      const nextPlayer = data?.user ?? null;
      setPlayer(nextPlayer);
      setDisplayName(nextPlayer?.displayName ?? '');
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Unable to load account.';
      setErrorMessage(messageText);
    } finally {
      setLoading(false);
    }
  }, [authUrl]);

  useEffect(() => {
    loadPlayer();
  }, [loadPlayer]);

  const onSave = async () => {
    if (!player?.id) return;

    setSaving(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/players/${player.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          displayName: displayName.trim(),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.errors?.[0]?.message || 'Unable to save account settings.');
      }

      const data = await response.json();
      setPlayer(data?.doc ?? player);
      setDisplayName(data?.doc?.displayName ?? displayName.trim());
      setMessage('Account settings updated.');
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Unable to save account settings.';
      setErrorMessage(messageText);
    } finally {
      setSaving(false);
    }
  };

  const onSetTitle = async (title: string | null) => {
    setSavingTitle(true);
    setTitleMessage(null);
    try {
      const res = await fetch(authUrl.title, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: title ?? '' }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? 'Failed to set title.');
      setPlayer((prev) => prev ? { ...prev, displayTitle: data.displayTitle } : prev);
      setTitleMessage(title ? `Title set to "${title}".` : 'Title cleared.');
    } catch (err) {
      setTitleMessage(err instanceof Error ? err.message : 'Failed to set title.');
    } finally {
      setSavingTitle(false);
    }
  };

  const inputStyle = [
    form.input,
    {
      borderColor: palette.tabIconDefault,
      color: palette.text,
      backgroundColor: palette.background,
    },
  ];

  if (loading) {
    return (
      <View style={base.container}>
        <Text style={[base.paragraph, { color: palette.text }]}>Loading account…</Text>
      </View>
    );
  }

  if (!player) {
    return (
      <View style={base.container}>
        <Text style={[base.paragraph, { color: palette.text }]}>No active player session.</Text>
        {errorMessage ? <Text style={form.error}>{errorMessage}</Text> : null}
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: palette.background }}>
      <View style={[base.container, { paddingBottom: 40 }]}>
        <Text style={[base.title, { color: palette.text }]}>Account</Text>
        <View style={form.inputGroup}>
          <Text style={[base.subtitle, { color: palette.text }]}>Email</Text>
          <Text style={[base.paragraph, { color: palette.icon }]}>{player.email ?? 'Unknown'}</Text>

          <Text style={[base.subtitle, { color: palette.text }]}>Display Name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Choose a display name"
            placeholderTextColor={palette.icon}
            style={inputStyle}
          />

          <Text style={[base.subtitle, { color: palette.text }]}>Created</Text>
          <Text style={[base.paragraph, { color: palette.icon }]}>{formatDate(player.createdAt)}</Text>

          <Text style={[base.subtitle, { color: palette.text }]}>Account Age</Text>
          <Text style={[base.paragraph, { color: palette.icon }]}>{formatAge(player.createdAt)}</Text>

          <Pressable
            style={[buttons.primary, { backgroundColor: palette.link }, saving && buttons.disabled]}
            onPress={onSave}
            disabled={saving}
          >
            <Text style={[buttons.text, { color: Colors.light.background }]}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Text>
          </Pressable>

          {message ? <Text style={[base.comments, { color: palette.icon }]}>{message}</Text> : null}
          {errorMessage ? <Text style={form.error}>{errorMessage}</Text> : null}
        </View>

        {/* ── Title Chooser ─────────────────────────────────────────── */}
        <View style={[form.inputGroup, { marginTop: 24 }]}>
          <Text style={[base.subtitle, { color: palette.text }]}>Display Title</Text>
          <Text style={[base.paragraph, { color: palette.icon }]}>
            Active: {player.displayTitle ? (
              <Text style={{ color: palette.link, fontStyle: 'italic' }}>{player.displayTitle}</Text>
            ) : (
              <Text style={{ fontStyle: 'italic' }}>None set</Text>
            )}
          </Text>

          {earnedRanks.length === 0 ? (
            <Text style={[base.comments, { color: palette.icon }]}>
              Complete skill missions to earn rank titles.
            </Text>
          ) : (
            <>
              <Text style={[base.comments, { color: palette.icon, marginBottom: 4 }]}>
                Tap a rank to set it as your title:
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {earnedRanks.map((rank) => {
                  const isActive = player.displayTitle === rank;
                  return (
                    <Pressable
                      key={rank}
                      onPress={() => onSetTitle(isActive ? null : rank)}
                      disabled={savingTitle}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: isActive ? palette.link : palette.tabIconDefault,
                        backgroundColor: isActive ? `${palette.link}22` : 'transparent',
                      }}
                    >
                      <Text style={[base.comments, { color: isActive ? palette.link : palette.text, fontStyle: 'normal' }]}>
                        {isActive ? '✓ ' : ''}{rank}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
          {titleMessage ? <Text style={[base.comments, { color: palette.icon, marginTop: 4 }]}>{titleMessage}</Text> : null}
        </View>
      </View>
    </ScrollView>
  );
}
