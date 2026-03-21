import { Pressable, Text, View } from 'react-native';

import { base, buttons } from '@/constants/theme';

// Item keys that are directly usable from inventory
const USABLE_ITEM_KEYS = ['SPD-1', 'MED-1', 'RAD-X'];

type InventoryItem = {
  id?: string | number;
  itemKey: string;
  quantity: number;
};

type Palette = {
  text: string;
  background: string;
  icon: string;
  tabIconDefault: string;
  link: string;
};

type Props = {
  inventoryItems: InventoryItem[];
  inventoryCounts: Record<string, number>;
  onAction: (action: string) => Promise<boolean>;
  actionLoading: string | null;
  palette: Palette;
};

export function HomeInventory({ inventoryItems, inventoryCounts, onAction, actionLoading, palette }: Props) {
  const onUseInventoryItem = async (action: string) => {
    if (!USABLE_ITEM_KEYS.includes(action)) return;

    const currentCount = inventoryCounts[action] ?? 0;
    if (currentCount < 1) return;

    await onAction(action);
  };

  return (
    <View
      style={{
        width: '100%',
        borderWidth: 1,
        borderColor: palette.tabIconDefault,
        borderRadius: 10,
        padding: 12,
        backgroundColor: palette.background,
        gap: 8,
      }}
    >
      <Text style={[base.subtitle, { color: palette.text }]}>Inventory</Text>
      {inventoryItems.length === 0 ? (
        <Text style={[base.comments, { color: palette.icon }]}>No inventory items found.</Text>
      ) : null}
      {inventoryItems.map((item) => {
        const count = inventoryCounts[item.itemKey] ?? item.quantity ?? 0;
        const isUsable = USABLE_ITEM_KEYS.includes(item.itemKey);
        const isUsing = isUsable ? actionLoading === item.itemKey : false;
        return (
          <View
            key={`${item.id ?? item.itemKey}-${item.itemKey}`}
            style={{
              borderWidth: 1,
              borderColor: palette.tabIconDefault,
              borderRadius: 8,
              padding: 10,
              backgroundColor: palette.background,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[base.comments, { color: palette.text, fontStyle: 'normal', fontWeight: '700' }]}>
                {item.itemKey} x{count}
              </Text>
            </View>
            <Pressable
              style={[
                buttons.secondary,
                {
                  backgroundColor: palette.background,
                  borderColor: palette.tabIconDefault,
                  borderWidth: 1,
                  minWidth: 84,
                },
                (!isUsable || count < 1 || isUsing) && buttons.disabled,
              ]}
              onPress={() => onUseInventoryItem(item.itemKey)}
              disabled={!isUsable || count < 1 || actionLoading !== null}
            >
              <Text style={[buttons.text, { color: palette.text }]}>
                {isUsing ? '...' : isUsable ? 'Use' : 'N/A'}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
