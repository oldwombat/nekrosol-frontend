import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StatusColors } from '@/constants/theme';
import type { PlayerQuest } from '@/lib/api';

type Props = {
  visible: boolean;
  quest: PlayerQuest | null;
  onComplete: (questProgressId: string) => Promise<boolean>;
  onClose: () => void;
};

export function PrestigeQuestModal({ visible, quest, onComplete, onClose }: Props) {
  const [completing, setCompleting] = React.useState(false);

  if (!quest) return null;

  const q = quest.quest;
  const skillLabel = q.skill.charAt(0).toUpperCase() + q.skill.slice(1);
  const isClick = q.requirementType === 'click';

  async function handleComplete() {
    setCompleting(true);
    const success = await onComplete(quest!.id);
    setCompleting(false);
    if (success) onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.label}>
              {skillLabel} — Prestige {q.prestigeLevel} Quest
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.closeBtn}>✕</Text>
            </Pressable>
          </View>

          {/* Title */}
          <Text style={styles.title}>{q.title}</Text>

          {/* Description */}
          <ScrollView style={styles.descScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.description}>{q.description}</Text>
          </ScrollView>

          {/* Requirement */}
          <View style={styles.requirementBadge}>
            <Text style={styles.requirementText}>
              {isClick
                ? '📋 Acknowledge to unlock prestige'
                : `Requirement: ${q.requirementType.replace(/_/g, ' ')}`}
            </Text>
          </View>

          {/* CTA */}
          <Pressable
            style={[styles.ctaButton, completing && styles.ctaDisabled]}
            onPress={handleComplete}
            disabled={completing}
          >
            {completing ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={styles.ctaText}>
                {isClick ? 'Accept & Complete' : 'Check Requirements'}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderColor: StatusColors.caution,
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
    width: '100%',
    maxWidth: 480,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: StatusColors.caution,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  closeBtn: {
    color: '#888',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  descScroll: {
    maxHeight: 120,
    marginBottom: 16,
  },
  description: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 21,
  },
  requirementBadge: {
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  requirementText: {
    color: '#aaa',
    fontSize: 12,
  },
  ctaButton: {
    backgroundColor: StatusColors.caution,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
});
