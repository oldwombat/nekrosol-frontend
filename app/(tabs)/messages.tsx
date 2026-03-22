import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';

import { base, buttons, Colors, form } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api, type NpcMessage } from '@/lib/api';
import { useAuthContext } from './auth-context';

const LOG_CATEGORY_COLOR: Record<string, string> = {
  damage: '#ef4444',
  heal: '#22c55e',
  inventory: '#3b82f6',
  info: '#94a3b8',
};

export default function MessagesScreen() {
  const [messages, setMessages] = useState<NpcMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = Colors[isDark ? 'dark' : 'light'];
  const { loading: authLoading, player, errorMessage, loadCurrentPlayer, onSubmit } = useAuthContext();

  useEffect(() => { void loadCurrentPlayer(); }, [loadCurrentPlayer]);

  const authInputStyle = [form.input, { borderColor: palette.tabIconDefault, color: palette.text, backgroundColor: palette.background }];

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
    if (player) void loadMessages();
  }, [loadMessages, player]);

  const visibleMessages = showLog
    ? messages
    : messages.filter((m) => m.type !== 'activity_log');

  return (
    <View style={[base.container, { flex: 1, justifyContent: 'flex-start', width: '100%' }]}>
      <Text style={[base.title, { color: palette.text }]}>Messages</Text>
      {player ? (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={[base.subtitle, { color: palette.text }]}>Inbox</Text>
            <Pressable
              onPress={() => setShowLog(v => !v)}
              style={[buttons.secondary, { backgroundColor: showLog ? palette.link : palette.background, borderColor: palette.tabIconDefault, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'center' }]}
            >
              <Text style={{ color: showLog ? '#fff' : palette.icon, fontSize: 12 }}>
                📋 {showLog ? 'Hide Log' : 'Show Log'}
              </Text>
            </Pressable>
          </View>
          {loading ? (
            <Text style={[base.comments, { color: palette.icon }]}>Loading…</Text>
          ) : visibleMessages.length === 0 ? (
            <Text style={[base.comments, { color: palette.icon }]}>
              {showLog ? 'No messages yet.' : 'No messages yet. Enable the log to see activity.'}
            </Text>
          ) : (
            <ScrollView
              style={{ width: '100%', flex: 1 }}
              contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
              showsVerticalScrollIndicator
            >
              {visibleMessages.map((msg) => {
                const isLog = msg.type === 'activity_log';
                const logCategory = isLog ? (msg.metadata?.category ?? 'info') : null;
                const accentColor = logCategory ? (LOG_CATEGORY_COLOR[logCategory as string] ?? '#94a3b8') : null;
                return (
                  <Pressable
                    key={msg.id}
                    onPress={() => { if (!msg.isRead && !isLog) void markRead(msg.id); }}
                    style={{ borderWidth: 1, borderColor: isLog ? (accentColor ?? palette.tabIconDefault) : (msg.isRead ? palette.tabIconDefault : palette.link), borderRadius: 10, padding: isLog ? 10 : 14, backgroundColor: palette.background, gap: 4, opacity: isLog ? 0.7 : (msg.isRead ? 0.75 : 1) }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[base.comments, { color: isLog ? (accentColor ?? palette.icon) : palette.text, fontWeight: '700', fontStyle: 'normal' }]}>
                        {isLog ? msg.subject : (msg.npcName ?? msg.npcSlug ?? 'Unknown')}
                        {!msg.isRead && !isLog ? '  🔵' : ''}
                      </Text>
                      <Text style={[base.comments, { color: palette.icon }]}>
                        {msg.createdAt ? (() => { const d = new Date(msg.createdAt); return `${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} ${d.toLocaleDateString()}`; })() : ''}
                      </Text>
                    </View>
                    {!isLog && msg.subject ? (
                      <Text style={[base.comments, { color: palette.text, fontStyle: 'normal', fontWeight: '700' }]}>{msg.subject}</Text>
                    ) : null}
                    <Text style={[base.comments, { color: isLog ? palette.icon : palette.text, fontStyle: 'normal' }]}>{msg.body}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </>
      ) : null}
      {!player ? (
        <View style={form.inputGroup}>
          <Text style={[base.subtitle, { color: palette.text }]}>Email</Text>
          <TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="player@example.com" placeholderTextColor={palette.icon} style={authInputStyle} />
          <Text style={[base.subtitle, { color: palette.text }]}>Password</Text>
          <TextInput secureTextEntry autoComplete="password" value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={palette.icon} style={authInputStyle} />
          <Pressable style={[buttons.primary, { backgroundColor: palette.link }, authLoading && buttons.disabled]} onPress={() => onSubmit({ email, password, onAuthenticated: () => setPassword('') })} disabled={authLoading || !email || !password}>
            <Text style={[buttons.text, { color: Colors.light.background }]}>{authLoading ? 'Please wait…' : 'Sign in'}</Text>
          </Pressable>
          {errorMessage ? <Text style={form.error}>{errorMessage}</Text> : null}
          <Text style={[base.comments, { color: palette.icon }]}>If no account exists for this email, one will be created automatically.</Text>
        </View>
      ) : null}
    </View>
  );
}
