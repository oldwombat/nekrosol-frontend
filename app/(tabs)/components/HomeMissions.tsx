import { Pressable, Text, View } from 'react-native';
import { useState } from 'react';

import { base, buttons } from '@/constants/theme';
import type { LiveMission } from '@/lib/api';

type Palette = {
  text: string;
  background: string;
  icon: string;
  tabIconDefault: string;
  link: string;
};

type Props = {
  missions: LiveMission[];
  onAction: (action: string) => Promise<boolean>;
  actionLoading: string | null;
  palette: Palette;
};

function formatCosts(costs?: LiveMission['costs']): string {
  if (!costs?.length) return '';
  return costs
    .map((c) => (c.type === 'energy' ? `⚡${c.amount ?? 1}` : `${c.amount ?? 1} ${c.type}`))
    .join(' · ');
}

function formatRewards(rewards?: LiveMission['rewards']): string {
  if (!rewards?.length) return '';
  const parts = rewards.flatMap((r) => {
    switch (r.type) {
      case 'credits':
        return [`${r.min ?? 0}–${r.max ?? 0} credits`];
      case 'stat_delta':
        return r.value !== undefined ? [`${r.stat} ${r.value > 0 ? '+' : ''}${r.value}`] : [];
      case 'item_chance':
        return r.itemKey ? [`${Math.round((r.probability ?? 0) * 100)}% ${r.itemKey}`] : [];
      case 'item_guaranteed':
        return r.itemKey ? [r.itemKey] : [];
      default:
        return [];
    }
  });
  return parts.join(' · ');
}

export function HomeMissions({ missions, onAction, actionLoading, palette }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = missions.find((m) => m.id === selectedId) ?? missions[0] ?? null;

  if (!missions.length) {
    return (
      <View
        style={{
          width: '100%',
          borderWidth: 1,
          borderColor: palette.tabIconDefault,
          borderRadius: 10,
          padding: 12,
          backgroundColor: palette.background,
        }}
      >
        <Text style={[base.subtitle, { color: palette.text }]}>Missions</Text>
        <Text style={[base.comments, { color: palette.icon }]}>Loading missions…</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        width: '100%',
        borderWidth: 1,
        borderColor: palette.tabIconDefault,
        borderRadius: 10,
        padding: 12,
        backgroundColor: palette.background,
        gap: 10,
      }}
    >
        <Text style={[base.subtitle, { color: palette.text }]}>Missions</Text>
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'stretch', gap: 12 }}>
          {/* Mission list */}
          <View style={{ width: '42%', minWidth: 240, gap: 8 }}>
            {missions.map((mission) => {
              const active = mission.id === (selected?.id ?? '');
              return (
                <Pressable
                  key={mission.id}
                  onPress={() => setSelectedId(mission.id)}
                  style={{
                    borderWidth: 1,
                    borderColor: active ? palette.link : palette.tabIconDefault,
                    borderRadius: 8,
                    padding: 10,
                    backgroundColor: palette.background,
                    gap: 4,
                    opacity: mission.available ? 1 : 0.55,
                  }}
                >
                  <Text style={[base.comments, { color: palette.text, fontStyle: 'normal', fontWeight: '700' }]}>
                    {mission.name}
                    {!mission.available ? ' 🔒' : ''}
                  </Text>
                  <Text style={[base.comments, { color: palette.icon }]}>{mission.description}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Mission detail panel */}
          <View
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: palette.tabIconDefault,
              borderRadius: 8,
              padding: 12,
              backgroundColor: palette.background,
              gap: 8,
            }}
          >
            <Text style={[base.subtitle, { color: palette.text }]}>{selected?.name}</Text>
            <Text style={[base.comments, { color: palette.text, fontStyle: 'normal' }]}>
              {selected?.description}
            </Text>
            {selected?.costs?.length ? (
              <Text style={[base.comments, { color: palette.icon, fontStyle: 'normal' }]}>
                Cost: {formatCosts(selected.costs)}
              </Text>
            ) : null}
            {selected?.rewards?.length ? (
              <Text style={[base.comments, { color: palette.icon, fontStyle: 'normal' }]}>
                💰 {formatRewards(selected.rewards)}
              </Text>
            ) : null}
            {selected?.available ? (
              <Pressable
                style={[
                  buttons.secondary,
                  {
                    backgroundColor: palette.background,
                    borderColor: palette.tabIconDefault,
                    borderWidth: 1,
                    alignSelf: 'flex-start',
                  },
                  actionLoading === selected.slug && buttons.disabled,
                ]}
                onPress={() => {
                  if (selected?.slug) void onAction(selected.slug);
                }}
                disabled={actionLoading !== null}
              >
                <Text style={[buttons.text, { color: palette.text }]}>Run Mission</Text>
              </Pressable>
            ) : selected && selected.blockedReasons.length > 0 ? (
              <Text style={[base.comments, { color: palette.icon }]}>
                🔒 {selected.blockedReasons.join(' · ')}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
  );
}
