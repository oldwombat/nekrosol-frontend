import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';

import { base, buttons, Colors, form } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHomeAuth } from './home-auth';
import type { SkillKey } from './home-data';
import { HomeStats } from './components/HomeStats';
import { HomeMissions } from './components/HomeMissions';
import { HomeInventory } from './components/HomeInventory';

export default function HomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {
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
    onSubmit,
    onAction,
    onPrestige,
    onCompleteQuest,
  } = useHomeAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = Colors[isDark ? 'dark' : 'light'];

  useEffect(() => {
    void loadCurrentPlayer();
  }, [loadCurrentPlayer]);

  const authInputStyle = [
    form.input,
    {
      borderColor: palette.tabIconDefault,
      color: palette.text,
      backgroundColor: palette.background,
    },
  ];

  return (
    <View style={[base.container, { flex: 1, justifyContent: 'flex-start', width: '100%' }]}>
      <Text style={[base.title, { color: palette.text }]}>Home</Text>

      {player ? (
        <ScrollView
          style={{ width: '100%', flex: 1 }}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator
        >
          <Text style={[base.paragraph, { color: palette.text }]}>
            Welcome back, {player.displayName ?? 'Player'}.
            {player.displayTitle ? (
              <Text style={{ color: palette.icon, fontStyle: 'italic' }}>{` ‹${player.displayTitle}›`}</Text>
            ) : null}
            {unreadMessages > 0 ? `  📬 ${unreadMessages} new message${unreadMessages > 1 ? 's' : ''}` : ''}
          </Text>

          <HomeStats
            player={player}
            palette={palette}
            quests={quests}
            onPrestige={(skill: SkillKey) => void onPrestige(skill)}
            onCompleteQuest={onCompleteQuest}
          />

          <HomeMissions missions={missions} onAction={onAction} actionLoading={actionLoading} palette={palette} />

          <HomeInventory
            inventoryItems={inventoryItems}
            inventoryCounts={inventoryCounts}
            onAction={onAction}
            actionLoading={actionLoading}
            palette={palette}
          />


          {actionMessage ? <Text style={[base.comments, { color: palette.icon }]}>{actionMessage}</Text> : null}
        </ScrollView>
      ) : null}

      {!player ? (
        <View style={form.inputGroup}>
          <Text style={[base.subtitle, { color: palette.text }]}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="player@example.com"
            placeholderTextColor={palette.icon}
            style={authInputStyle}
          />

          <Text style={[base.subtitle, { color: palette.text }]}>Password</Text>
          <TextInput
            secureTextEntry
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={palette.icon}
            style={authInputStyle}
          />

          <Pressable
            style={[
              buttons.primary,
              { backgroundColor: palette.link },
              loading && buttons.disabled,
            ]}
            onPress={() => onSubmit({ email, password, onAuthenticated: () => setPassword('') })}
            disabled={loading || !email || !password}
          >
            <Text style={[buttons.text, { color: Colors.light.background }]}>
              {loading ? 'Please wait…' : 'Sign in'}
            </Text>
          </Pressable>

          {errorMessage ? <Text style={form.error}>{errorMessage}</Text> : null}
          <Text style={[base.comments, { color: palette.icon }]}>If no account exists for this email, one will be created automatically.</Text>
        </View>
      ) : null}
    </View>
  );
}
