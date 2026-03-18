import { vi } from 'vitest'

vi.mock('react-native', () => ({
  Platform: { OS: 'ios', select: (obj: Record<string, unknown>) => obj['ios'] ?? obj['default'] },
  StyleSheet: { create: (s: Record<string, unknown>) => s },
}))

vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}))

vi.mock('@react-navigation/native', () => ({ useColorScheme: () => 'light' }))
vi.mock('@/hooks/use-color-scheme', () => ({ useColorScheme: () => 'light' }))
