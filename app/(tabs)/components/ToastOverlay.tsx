import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { useToasts, type ToastItem } from '@/hooks/use-toast-queue';

const BG: Record<string, string> = {
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
};

const TEXT_COLOR: Record<string, string> = {
  red: '#fff',
  green: '#052e16',
  blue: '#fff',
};

function SingleToast({ toast }: { toast: ToastItem }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in quickly
    Animated.timing(opacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();

    // Start fade-out 2.1s after mount (total visible ~2.8s)
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 2100);

    return () => clearTimeout(timer);
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: BG[toast.color] ?? BG.blue, opacity },
      ]}
    >
      <Text style={[styles.text, { color: TEXT_COLOR[toast.color] ?? '#fff' }]}>
        {toast.message}
      </Text>
    </Animated.View>
  );
}

export function ToastOverlay() {
  const { toasts } = useToasts();

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {toasts.map(toast => (
        <SingleToast key={toast.id} toast={toast} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 88,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 6,
    zIndex: 999,
  },
  toast: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 24,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
