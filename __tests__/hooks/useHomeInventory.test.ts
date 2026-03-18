import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useHomeInventory } from '../../app/(tabs)/home-inventory'

const INVENTORY_URL = 'http://localhost:3000/api/player-inventory'

function makeFetch(ok: boolean, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useHomeInventory', () => {
  it('loadInventory — sets items and counts from a valid API response', async () => {
    vi.stubGlobal(
      'fetch',
      makeFetch(true, {
        items: [
          { id: '1', itemKey: 'stimpak', quantity: 3 },
          { id: '2', itemKey: 'radaway', quantity: 1 },
        ],
      }),
    )

    const { result } = renderHook(() => useHomeInventory(INVENTORY_URL))

    await act(async () => {
      await result.current.loadInventory()
    })

    expect(result.current.inventoryItems).toEqual([
      { id: '1', itemKey: 'stimpak', quantity: 3 },
      { id: '2', itemKey: 'radaway', quantity: 1 },
    ])
    expect(result.current.inventoryCounts).toEqual({ stimpak: 3, radaway: 1 })
  })

  it('loadInventory — resets inventory on non-ok response', async () => {
    // First load some data
    vi.stubGlobal(
      'fetch',
      makeFetch(true, { items: [{ id: '1', itemKey: 'stimpak', quantity: 2 }] }),
    )
    const { result } = renderHook(() => useHomeInventory(INVENTORY_URL))
    await act(async () => { await result.current.loadInventory() })
    expect(result.current.inventoryItems).toHaveLength(1)

    // Now simulate a failed request
    vi.stubGlobal('fetch', makeFetch(false, {}))
    await act(async () => { await result.current.loadInventory() })

    expect(result.current.inventoryItems).toEqual([])
    expect(result.current.inventoryCounts).toEqual({})
  })

  it('loadInventory — resets inventory when JSON parse fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => { throw new Error('invalid json') },
      }),
    )

    const { result } = renderHook(() => useHomeInventory(INVENTORY_URL))

    await act(async () => { await result.current.loadInventory() })

    expect(result.current.inventoryItems).toEqual([])
    expect(result.current.inventoryCounts).toEqual({})
  })

  it('loadInventory — filters out items with quantity 0', async () => {
    vi.stubGlobal(
      'fetch',
      makeFetch(true, {
        items: [
          { id: '1', itemKey: 'stimpak', quantity: 5 },
          { id: '2', itemKey: 'radaway', quantity: 0 },
          { id: '3', itemKey: 'mentats', quantity: 0 },
        ],
      }),
    )

    const { result } = renderHook(() => useHomeInventory(INVENTORY_URL))

    await act(async () => { await result.current.loadInventory() })

    expect(result.current.inventoryItems).toEqual([{ id: '1', itemKey: 'stimpak', quantity: 5 }])
    expect(result.current.inventoryCounts).toEqual({ stimpak: 5 })
  })

  it('mergeInventoryCounts — merges new counts into existing state', async () => {
    vi.stubGlobal(
      'fetch',
      makeFetch(true, { items: [{ id: '1', itemKey: 'stimpak', quantity: 3 }] }),
    )

    const { result } = renderHook(() => useHomeInventory(INVENTORY_URL))

    await act(async () => { await result.current.loadInventory() })
    expect(result.current.inventoryCounts).toEqual({ stimpak: 3 })

    act(() => {
      result.current.mergeInventoryCounts({ radaway: 2, stimpak: 10 })
    })

    expect(result.current.inventoryCounts).toEqual({ stimpak: 10, radaway: 2 })
  })

  it('mergeInventoryCounts — ignores null and non-object values', async () => {
    vi.stubGlobal(
      'fetch',
      makeFetch(true, { items: [{ id: '1', itemKey: 'stimpak', quantity: 3 }] }),
    )

    const { result } = renderHook(() => useHomeInventory(INVENTORY_URL))

    await act(async () => { await result.current.loadInventory() })
    const before = result.current.inventoryCounts

    act(() => { result.current.mergeInventoryCounts(null) })
    expect(result.current.inventoryCounts).toEqual(before)

    act(() => { result.current.mergeInventoryCounts('not-an-object') })
    expect(result.current.inventoryCounts).toEqual(before)

    act(() => { result.current.mergeInventoryCounts(42) })
    expect(result.current.inventoryCounts).toEqual(before)
  })

  it('resetInventory — clears all state', async () => {
    vi.stubGlobal(
      'fetch',
      makeFetch(true, { items: [{ id: '1', itemKey: 'stimpak', quantity: 3 }] }),
    )

    const { result } = renderHook(() => useHomeInventory(INVENTORY_URL))

    await act(async () => { await result.current.loadInventory() })
    expect(result.current.inventoryItems).toHaveLength(1)

    act(() => { result.current.resetInventory() })

    expect(result.current.inventoryItems).toEqual([])
    expect(result.current.inventoryCounts).toEqual({})
  })
})
