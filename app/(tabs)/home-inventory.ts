import { useCallback, useState } from 'react';

import { api } from '@/lib/api';

type InventoryItemState = {
  id?: string | number;
  itemKey: string;
  quantity: number;
};

type InventoryApiItem = {
  id?: string | number;
  itemKey?: unknown;
  quantity?: unknown;
};

const EMPTY_COUNTS: Record<string, number> = {};

const normalizeCounts = (value: unknown): Record<string, number> => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, quantity]) => [key, Number(quantity ?? 0)]),
  );
};

export function useHomeInventory() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItemState[]>([]);
  const [inventoryCounts, setInventoryCounts] = useState<Record<string, number>>(EMPTY_COUNTS);

  const resetInventory = useCallback(() => {
    setInventoryItems([]);
    setInventoryCounts(EMPTY_COUNTS);
  }, []);

  const loadInventory = useCallback(async () => {
    try {
      const result = await api.game.inventory();

      if (!result.ok) {
        resetInventory();
        return;
      }

      const items: InventoryApiItem[] = Array.isArray(result.data?.items) ? (result.data.items as InventoryApiItem[]) : [];
      const normalizedItems: InventoryItemState[] = items
        .filter((item) => typeof item?.itemKey === 'string')
        .map((item) => ({
          id: item?.id,
          itemKey: String(item.itemKey),
          quantity: Number(item?.quantity ?? 0),
        }))
        .filter((item) => item.quantity > 0);

      setInventoryItems(normalizedItems);
      setInventoryCounts(
        normalizedItems.reduce<Record<string, number>>((acc, item) => {
          acc[item.itemKey] = item.quantity;
          return acc;
        }, {}),
      );
    } catch {
      resetInventory();
    }
  }, [resetInventory]);

  const mergeInventoryCounts = useCallback((value: unknown) => {
    const next = normalizeCounts(value);
    if (Object.keys(next).length === 0) {
      return;
    }

    setInventoryCounts((previous) => ({
      ...previous,
      ...next,
    }));
  }, []);

  return {
    inventoryItems,
    inventoryCounts,
    loadInventory,
    resetInventory,
    mergeInventoryCounts,
  };
}
