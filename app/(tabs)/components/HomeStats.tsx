import { Pressable, Text, View } from 'react-native';
import { useState } from 'react';

import { StatusColors, base } from '@/constants/theme';
import type { PlayerQuest } from '@/lib/api';
import { getSkillRank, getStatItems, skillItems, type PlayerProfile, type SkillKey } from '../home-data';
import { PrestigeQuestModal } from './PrestigeQuestModal';
import { useEnergyCountdown } from '@/hooks/use-energy-countdown';
import { useRadiationCountdown } from '@/hooks/use-radiation-countdown';

const MAX_PRESTIGE = 4;

type Palette = {
  text: string;
  background: string;
  icon: string;
  tabIconDefault: string;
  link: string;
};

type Props = {
  player: PlayerProfile;
  palette: Palette;
  quests?: PlayerQuest[];
  onPrestige?: (skill: SkillKey) => void;
  onCompleteQuest?: (questProgressId: string) => Promise<boolean>;
};

export function HomeStats({ player, palette, quests = [], onPrestige, onCompleteQuest }: Props) {
  const [activeSkillTip, setActiveSkillTip] = useState<string | null>(null);
  const [questModal, setQuestModal] = useState<PlayerQuest | null>(null);
  const { regenLabel, liveEnergy } = useEnergyCountdown(player.energy, player.energyMax, player.lastEnergyUpdate);
  const { decayLabel, liveRadiation } = useRadiationCountdown(player.radiation, player.lastRadiationUpdate);
  const statItems = getStatItems(player).map((s) => {
    if (s.key === 'energy') return { ...s, value: liveEnergy };
    if (s.key === 'radiation') return { ...s, value: liveRadiation };
    return s;
  });

  function questForSkillPrestige(skillKey: string, prestigeLevel: number): PlayerQuest | undefined {
    return quests.find(
      (q) => q.quest.skill === skillKey && q.quest.prestigeLevel === prestigeLevel,
    );
  }

  function handlePrestigePress(skillKey: SkillKey, nextPrestigeLevel: number) {
    const quest = questForSkillPrestige(skillKey, nextPrestigeLevel);
    if (quest && quest.status !== 'completed') {
      // Show the quest modal — completing it unlocks prestige
      setQuestModal(quest);
    } else {
      // Quest already completed or no quest defined — go straight to prestige
      onPrestige?.(skillKey);
    }
  }

  async function handleQuestComplete(questProgressId: string): Promise<boolean> {
    const success = await onCompleteQuest?.(questProgressId) ?? false;
    if (success) {
      // After completing quest, auto-attempt prestige
      const skill = questModal?.quest.skill as SkillKey | undefined;
      if (skill) onPrestige?.(skill);
    }
    return success;
  }

  return (
    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'stretch', gap: 12 }}>
      <View style={{ flex: 1, gap: 10 }}>
        {statItems.map((stat) => {
          const safeMax = stat.max > 0 ? stat.max : 1;
          const percent = Math.max(0, Math.min(100, Math.round((stat.value / safeMax) * 100)));
          return (
            <View
              key={stat.key}
              style={{
                borderWidth: 1,
                borderColor: palette.tabIconDefault,
                borderRadius: 10,
                padding: 12,
                backgroundColor: palette.background,
                gap: 6,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[base.subtitle, { color: palette.text }]}>{stat.label}</Text>
                <Text style={[base.subtitle, { color: palette.text }]}>
                  {stat.value.toLocaleString()} / {safeMax.toLocaleString()}
                </Text>
              </View>
              <View
                style={{
                  width: '100%',
                  height: 8,
                  borderRadius: 999,
                  overflow: 'hidden',
                  backgroundColor: palette.tabIconDefault,
                }}
              >
                <View
                  style={{
                    width: `${percent}%`,
                    height: '100%',
                    backgroundColor: palette.link,
                  }}
                />
              </View>
              {stat.key === 'energy' && regenLabel ? (
                <Text style={[base.comments, { color: palette.icon, fontSize: 10 }]}>
                  ⚡ next regen in {regenLabel}
                </Text>
              ) : null}
              {stat.key === 'radiation' && decayLabel ? (
                <Text style={[base.comments, { color: palette.icon, fontSize: 10 }]}>
                  ☢ -1 in {decayLabel}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>

      <View
        style={{
          width: '42%',
          minWidth: 240,
          borderWidth: 1,
          borderColor: palette.tabIconDefault,
          borderRadius: 10,
          padding: 12,
          backgroundColor: palette.background,
          gap: 8,
        }}
      >
        <Text style={[base.subtitle, { color: palette.text }]}>Player Skills</Text>
        {skillItems.map((skill) => {
          const value = Number(player?.[skill.key as keyof PlayerProfile] ?? 0);
          const prestigeKey = `${skill.key}Prestige` as keyof PlayerProfile;
          const prestige = Number(player?.[prestigeKey] ?? 0);
          const rank = getSkillRank(skill.key, value, prestige);
          const isMaxPrestige = prestige >= MAX_PRESTIGE;
          const prestigeReady = value >= 100 && !isMaxPrestige;
          const isOpen = activeSkillTip === skill.key;
          const stars = prestige > 0 ? '★'.repeat(prestige) : '';
          const nextPrestigeLevel = prestige + 1;
          const quest = questForSkillPrestige(skill.key, nextPrestigeLevel);
          const questCompleted = quest?.status === 'completed';

          return (
            <View key={skill.key} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[base.comments, { color: palette.text, fontStyle: 'normal', flex: 1 }]}>
                  {skill.label}: {value}/100
                  {rank ? (
                    <Text style={{ color: palette.icon, fontStyle: 'italic' }}>{` (${rank})`}</Text>
                  ) : null}
                  {stars ? (
                    <Text style={{ color: StatusColors.caution }}>{` ${stars}`}</Text>
                  ) : null}
                </Text>
                <Pressable
                  onPress={() => setActiveSkillTip(isOpen ? null : skill.key)}
                  style={{ paddingHorizontal: 6, paddingVertical: 2 }}
                >
                  <Text style={{ color: palette.link, fontWeight: '700' }}>ⓘ</Text>
                </Pressable>
              </View>

              {/* Progress bar toward 100 */}
              <View
                style={{
                  width: '100%',
                  height: 4,
                  borderRadius: 999,
                  overflow: 'hidden',
                  backgroundColor: palette.tabIconDefault,
                }}
              >
                <View
                  style={{
                    width: `${Math.min(100, value)}%`,
                    height: '100%',
                    backgroundColor: prestigeReady ? StatusColors.caution : palette.link,
                  }}
                />
              </View>

              {/* Prestige CTA — shows quest state when relevant */}
              {prestigeReady && onPrestige ? (
                <Pressable
                  onPress={() => handlePrestigePress(skill.key, nextPrestigeLevel)}
                  style={{
                    alignSelf: 'flex-start',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                    backgroundColor: questCompleted
                      ? `${StatusColors.safe}22`
                      : `${StatusColors.caution}33`,
                    borderWidth: 1,
                    borderColor: questCompleted ? StatusColors.safe : StatusColors.caution,
                  }}
                >
                  <Text style={{
                    color: questCompleted ? StatusColors.safe : StatusColors.caution,
                    fontSize: 10,
                    fontWeight: '700',
                  }}>
                    {questCompleted ? '✓ PRESTIGE ↑' : '📋 PRESTIGE QUEST'}
                  </Text>
                </Pressable>
              ) : null}

              {isOpen ? (
                <Text style={[base.comments, { color: palette.icon }]}>{skill.tip}</Text>
              ) : null}
            </View>
          );
        })}
      </View>

      <PrestigeQuestModal
        visible={questModal !== null}
        quest={questModal}
        onComplete={handleQuestComplete}
        onClose={() => setQuestModal(null)}
      />
    </View>
  );
}
