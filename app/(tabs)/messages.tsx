import { Pressable, ScrollView, Text, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';

import { base, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api, type NpcMessage } from '@/lib/api';

export default function MessagesScreen() {
  const [messages, setMessages] = useState<NpcMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = Colors[isDark ? 'dark' : 'light'];

  const loadMessages = useCallback(async () => {
    setLoading(true);
    const result = await api.game.messages();
    if (result.ok) setMessages(result.data?.messages ?? []);
    setLoading(false);
  }, []);

  const markRead = async (id: string) => {
    await api.game.markMessageRead(id);
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: true } : m))
    );
  };

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  return (
    <View style={[base.container, { flex: 1, justifyContent: 'flex-start', width: '100%' }]}>
      <Text style={[base.title, { color: palette.text }]}>Messages</Text>

      {loading ? (
        <Text style={[base.comments, { color: palette.icon }]}>Loading…</Text>
      ) : messages.length === 0 ? (
        <Text style={[base.comments, { color: palette.icon }]}>No messages yet.</Text>
      ) : (
        <ScrollView
          style={{ width: '100%', flex: 1 }}
          contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
          showsVerticalScrollIndicator
        >
          {messages.map((msg) => (
            <Pressable
              key={msg.id}
              onPress={() => { if (!msg.isRead) void markRead(msg.id); }}
              style={{
                borderWidth: 1,
                borderColor: msg.isRead ? palette.tabIconDefault : palette.link,
                borderRadius: 10,
                padding: 14,
                backgroundColor: palette.background,
                gap: 6,
                opacity: msg.isRead ? 0.75 : 1,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[base.subtitle, { color: palette.text }]}>
                  {msg.npcName ?? msg.npcSlug ?? 'Unknown'}
                  {!msg.isRead ? '  🔵' : ''}
                </Text>
                <Text style={[base.comments, { color: palette.icon }]}>
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : ''}
                </Text>
              </View>
              {msg.subject ? (
                <Text style={[base.comments, { color: palette.text, fontStyle: 'normal', fontWeight: '700' }]}>
                  {msg.subject}
                </Text>
              ) : null}
              <Text style={[base.comments, { color: palette.text, fontStyle: 'normal' }]}>
                {msg.body}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
