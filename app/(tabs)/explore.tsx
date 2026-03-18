import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { base, buttons, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { locationItems } from './home-data';

type RadiationLevel = 'LOW' | 'MEDIUM' | 'HIGH';

type LocationRadiation = {
  level: RadiationLevel;
  percent: number;
  flavour: string;
};

const LOCATION_RADIATION: Record<string, LocationRadiation> = {
  'dustline-tavern': {
    level: 'LOW',
    percent: 5,
    flavour:
      'Where deals are struck and debts are called in. The safest place in the Fringe, if you know who to avoid.',
  },
  'ember-bank': {
    level: 'LOW',
    percent: 5,
    flavour:
      'The Ministry-controlled credit exchange. Every transaction logged. Every debt tracked. They always collect.',
  },
  'blackglass-market': {
    level: 'MEDIUM',
    percent: 35,
    flavour: 'Salvage, contraband, stolen tech. No questions asked if the credits are real.',
  },
  'reactor-district': {
    level: 'HIGH',
    percent: 75,
    flavour:
      "Restricted. Irradiated. Industrial. The only place to find reactor parts — and the only place that'll kill you slowly for trying.",
  },
};

function radiationBadgeColor(percent: number): string {
  if (percent < 20) return '#22a34a';
  if (percent <= 60) return '#e07b00';
  return '#d32f2f';
}

export default function WorldScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = Colors[isDark ? 'dark' : 'light'];

  return (
    <View style={[base.container, { flex: 1, justifyContent: 'flex-start', width: '100%' }]}>
      <Text style={[base.title, { color: palette.text }]}>World</Text>
      <ScrollView
        style={{ width: '100%', flex: 1 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        showsVerticalScrollIndicator
      >
        {locationItems.map((location) => {
          const rad = LOCATION_RADIATION[location.id];
          const badgeColor = rad ? radiationBadgeColor(rad.percent) : '#22a34a';
          return (
            <View
              key={location.id}
              style={{
                borderWidth: 1,
                borderColor: palette.tabIconDefault,
                borderRadius: 10,
                padding: 16,
                backgroundColor: palette.background,
                gap: 10,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[base.subtitle, { color: palette.text, fontWeight: '700', fontSize: 18 }]}>
                  {location.name}
                </Text>
                {rad ? (
                  <View
                    style={{
                      backgroundColor: badgeColor,
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                      ☢ {rad.level} {rad.percent}%
                    </Text>
                  </View>
                ) : null}
              </View>
              {rad ? (
                <Text style={[base.comments, { color: palette.icon }]}>"{rad.flavour}"</Text>
              ) : null}
              <Pressable
                style={[
                  buttons.secondary,
                  {
                    backgroundColor: palette.background,
                    borderColor: palette.tabIconDefault,
                    borderWidth: 1,
                    alignSelf: 'flex-start',
                  },
                ]}
                onPress={() => Alert.alert('Travel', 'Travel system coming soon')}
              >
                <Text style={[buttons.text, { color: palette.text }]}>Travel →</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

