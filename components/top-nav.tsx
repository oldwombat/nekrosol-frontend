import { useRouter, usePathname } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Colors, StatusColors, menu, typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type PlayerProfile = {
  id?: string | number;
  email?: string;
  credits?: number | null;
  creditsMax?: number | null;
  energy?: number | null;
  energyMax?: number | null;
  health?: number | null;
  healthMax?: number | null;
  radiation?: number | null;
  radiationMax?: number | null;
  thugPrestige?: number | null;
  thiefPrestige?: number | null;
  grifterPrestige?: number | null;
  pilotPrestige?: number | null;
  medicPrestige?: number | null;
  hackerPrestige?: number | null;
  technicianPrestige?: number | null;
  chemistPrestige?: number | null;
  physicistPrestige?: number | null;
  scavengerPrestige?: number | null;
  mechanicPrestige?: number | null;
  smugglerPrestige?: number | null;
};

function statColor(key: 'credits' | 'energy' | 'health' | 'radiation', value: number, max: number): string {
  const pct = max > 0 ? value / max : 0;
  if (key === 'health' || key === 'energy') {
    if (pct > 0.7) return StatusColors.safe;
    if (pct > 0.4) return StatusColors.caution;
    if (pct > 0.2) return StatusColors.warning;
    return StatusColors.danger;
  }
  if (key === 'radiation') {
    if (pct <= 0.2) return StatusColors.safe;
    if (pct <= 0.5) return StatusColors.caution;
    if (pct <= 0.8) return StatusColors.warning;
    return StatusColors.danger;
  }
  return StatusColors.info;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = Colors[isDark ? 'dark' : 'light'];

  const authUrl = useMemo(
    () => ({
      me: `${API_BASE_URL}/api/players/me`,
      logout: `${API_BASE_URL}/api/players/logout`,
    }),
    [],
  );

  const loadSession = async () => {
    try {
      const response = await fetch(authUrl.me, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        setPlayer(null);
        return;
      }

      const data = await response.json();
      setPlayer(data?.user ?? null);
    } catch {
      setPlayer(null);
    }
  };

  useEffect(() => {
    loadSession();
  }, [pathname]);

  const navigateTo = (path: '/' | '/lore' | '/account') => {
    setMenuOpen(false);
    router.push(path);
  };

  const onSignOut = async () => {
    try {
      await fetch(authUrl.logout, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setPlayer(null);
      setMenuOpen(false);
      router.replace('/');
    }
  };

  const hasStats =
    player &&
    player.credits != null &&
    player.energy != null &&
    player.health != null &&
    player.radiation != null;

  const stats = hasStats
    ? [
        {
          key: 'credits' as const,
          icon: '💰',
          label: 'CR',
          value: player.credits ?? 0,
          max: player.creditsMax ?? 1000000,
          display: (player.credits ?? 0).toLocaleString(),
        },
        {
          key: 'energy' as const,
          icon: '⚡',
          label: 'EN',
          value: player.energy ?? 0,
          max: player.energyMax ?? 10,
          display: `${player.energy ?? 0}/${player.energyMax ?? 10}`,
        },
        {
          key: 'health' as const,
          icon: '❤️',
          label: 'HP',
          value: player.health ?? 0,
          max: player.healthMax ?? 100,
          display: `${player.health ?? 0}/${player.healthMax ?? 100}`,
        },
        {
          key: 'radiation' as const,
          icon: '☢️',
          label: 'RAD',
          value: player.radiation ?? 0,
          max: player.radiationMax ?? 100,
          display: `${player.radiation ?? 0}/${player.radiationMax ?? 100}`,
        },
      ]
    : [];

  return (
    <View style={{ backgroundColor: palette.background, borderBottomWidth: 1, borderBottomColor: palette.tabIconDefault }}>
      <View
        style={{
          height: 56,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: palette.text, fontSize: typography.bodySize + 2, fontWeight: '700' }}>Nekrosol</Text>
        <Pressable
          style={menu.trigger}
          onPress={() => setMenuOpen((value) => !value)}
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
        >
          <Text style={{ color: palette.text, fontSize: 22, lineHeight: 22 }}>☰</Text>
        </Pressable>
      </View>

      {hasStats ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderTopWidth: 1,
            borderTopColor: palette.tabIconDefault,
            gap: 8,
          }}
        >
          {stats.map((stat) => {
            const color = statColor(stat.key, stat.value, stat.max);
            return (
              <View
                key={stat.key}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  paddingVertical: 3,
                  paddingHorizontal: 6,
                  borderRadius: 6,
                  backgroundColor: `${color}22`,
                  borderWidth: 1,
                  borderColor: `${color}55`,
                }}
              >
                <Text style={{ fontSize: 11 }}>{stat.icon}</Text>
                <Text style={{ color, fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
                  {stat.display}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {menuOpen ? (
        <View style={[menu.card, { top: hasStats ? 56 + 38 : 56, backgroundColor: palette.background, borderColor: palette.tabIconDefault }]}>
          <Pressable style={menu.item} onPress={() => navigateTo('/')}>
            <Text style={{ color: palette.text }}>Home</Text>
          </Pressable>

          {player ? (
            <>
              <Pressable style={menu.item} onPress={() => navigateTo('/account')}>
                <Text style={{ color: palette.text }}>Account</Text>
              </Pressable>
              <Pressable style={menu.item} onPress={onSignOut}>
                <Text style={{ color: palette.text }}>Sign Out</Text>
              </Pressable>
            </>
          ) : (
            <Pressable style={menu.item} onPress={() => navigateTo('/')}>
              <Text style={{ color: palette.text }}>Sign In</Text>
            </Pressable>
          )}

          <Pressable style={menu.item} onPress={() => navigateTo('/lore')}>
            <Text style={{ color: palette.text }}>Lore</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}