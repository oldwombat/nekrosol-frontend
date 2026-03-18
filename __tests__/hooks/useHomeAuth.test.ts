import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useHomeAuth } from '../../app/(tabs)/home-auth'

const mockPlayer = {
  id: 'p1',
  email: 'test@example.com',
  displayName: 'TestPlayer',
  credits: 100,
}

// Shorthand for building a mock Response-like object
function res(ok: boolean, body: unknown) {
  return { ok, status: ok ? 200 : 500, json: async () => body }
}

function res401(body: unknown) {
  return { ok: false, status: 401, json: async () => body }
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useHomeAuth — loadCurrentPlayer', () => {
  it('sets player from a successful /me response and loads inventory', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce(res(true, { user: mockPlayer }))   // /me
        .mockResolvedValueOnce(res(true, { items: [] })),          // loadInventory
    )

    const { result } = renderHook(() => useHomeAuth())

    await act(async () => { await result.current.loadCurrentPlayer() })

    expect(result.current.player).toEqual(mockPlayer)
    expect(result.current.inventoryItems).toEqual([])
  })

  it('clears player on non-ok /me response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(res(false, {})))

    const { result } = renderHook(() => useHomeAuth())

    await act(async () => { await result.current.loadCurrentPlayer() })

    expect(result.current.player).toBeNull()
  })
})

describe('useHomeAuth — onSubmit', () => {
  it('logs in successfully when login returns 200', async () => {
    const onAuthenticated = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce(res(true, { user: mockPlayer }))   // login
        .mockResolvedValueOnce(res(true, { items: [] })),          // loadInventory
    )

    const { result } = renderHook(() => useHomeAuth())

    await act(async () => {
      await result.current.onSubmit({ email: 'test@example.com', password: 'pw', onAuthenticated })
    })

    expect(result.current.player).toEqual(mockPlayer)
    expect(result.current.loading).toBe(false)
    expect(onAuthenticated).toHaveBeenCalledOnce()
    expect(result.current.errorMessage).toBeNull()
  })

  it('signs up then logs in when login returns 401', async () => {
    const onAuthenticated = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce(res401({}))                          // login → 401
        .mockResolvedValueOnce(res(true, {}))                       // signup → ok
        .mockResolvedValueOnce(res(true, { user: mockPlayer }))     // second login → ok
        .mockResolvedValueOnce(res(true, { items: [] })),           // loadInventory
    )

    const { result } = renderHook(() => useHomeAuth())

    await act(async () => {
      await result.current.onSubmit({ email: 'new@example.com', password: 'pw', onAuthenticated })
    })

    expect(result.current.player).toEqual(mockPlayer)
    expect(result.current.loading).toBe(false)
    expect(onAuthenticated).toHaveBeenCalledOnce()
    expect(result.current.errorMessage).toBeNull()
  })

  it('sets errorMessage when login fails with non-401 error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(res(false, {})))

    const { result } = renderHook(() => useHomeAuth())

    await act(async () => {
      await result.current.onSubmit({ email: 'x@x.com', password: 'bad' })
    })

    expect(result.current.player).toBeNull()
    expect(result.current.errorMessage).toBe('Unable to authenticate with these credentials')
    expect(result.current.loading).toBe(false)
  })
})

describe('useHomeAuth — onSignOut', () => {
  it('clears player, resets inventory, and calls onSignedOut callback', async () => {
    // Load player first
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce(res(true, { user: mockPlayer }))
        .mockResolvedValueOnce(res(true, { items: [] })),
    )
    const { result } = renderHook(() => useHomeAuth())
    await act(async () => { await result.current.loadCurrentPlayer() })
    expect(result.current.player).toEqual(mockPlayer)

    // Sign out
    const onSignedOut = vi.fn()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(res(true, {})))

    await act(async () => { await result.current.onSignOut({ onSignedOut }) })

    expect(result.current.player).toBeNull()
    expect(result.current.inventoryItems).toEqual([])
    expect(result.current.inventoryCounts).toEqual({})
    expect(onSignedOut).toHaveBeenCalledOnce()
    expect(result.current.loading).toBe(false)
  })
})

describe('useHomeAuth — onAction', () => {
  it('BEG action — sets player, actionMessage, and loads inventory', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce(                                     // action POST
          res(true, { player: mockPlayer, gain: 25, inventoryCounts: {} }),
        )
        .mockResolvedValueOnce(res(true, { items: [] })),           // loadInventory
    )

    const { result } = renderHook(() => useHomeAuth())

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.onAction('BEG')
    })

    expect(success).toBe(true)
    expect(result.current.player).toEqual(mockPlayer)
    expect(result.current.actionMessage).toBe('You begged and received 25 credits.')
    expect(result.current.errorMessage).toBeNull()
    expect(result.current.actionLoading).toBeNull()
  })

  it('non-BEG action — sets actionMessage with action name', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce(res(true, { player: mockPlayer, inventoryCounts: {} }))
        .mockResolvedValueOnce(res(true, { items: [] })),
    )

    const { result } = renderHook(() => useHomeAuth())

    await act(async () => { await result.current.onAction('MED-1') })

    expect(result.current.actionMessage).toBe('MED-1 applied successfully.')
  })

  it('sets errorMessage when action returns non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(res(false, { error: 'Not enough energy' })),
    )

    const { result } = renderHook(() => useHomeAuth())

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.onAction('SPD-1')
    })

    expect(success).toBe(false)
    expect(result.current.errorMessage).toBe('Not enough energy')
    expect(result.current.actionLoading).toBeNull()
  })
})
