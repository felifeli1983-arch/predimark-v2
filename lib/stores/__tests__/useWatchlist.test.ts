import { describe, it, expect, beforeEach } from 'vitest'
import { useWatchlist } from '../useWatchlist'

describe('useWatchlist (pure store)', () => {
  beforeEach(() => {
    useWatchlist.setState({ watched: new Set(), hydrated: false })
  })

  it('setWatched popola Set e marca hydrated=true', () => {
    useWatchlist.getState().setWatched(['mkt-1', 'mkt-2', 'mkt-3'])
    const state = useWatchlist.getState()
    expect(state.watched.size).toBe(3)
    expect(state.watched.has('mkt-1')).toBe(true)
    expect(state.hydrated).toBe(true)
  })

  it('isWatching ritorna true solo per id presenti', () => {
    useWatchlist.getState().setWatched(['mkt-1'])
    expect(useWatchlist.getState().isWatching('mkt-1')).toBe(true)
    expect(useWatchlist.getState().isWatching('mkt-2')).toBe(false)
  })

  it('markAdded aggiunge al Set', () => {
    useWatchlist.getState().markAdded('mkt-99')
    expect(useWatchlist.getState().watched.has('mkt-99')).toBe(true)
  })

  it('markAdded due volte è idempotente (Set)', () => {
    useWatchlist.getState().markAdded('mkt-1')
    useWatchlist.getState().markAdded('mkt-1')
    expect(useWatchlist.getState().watched.size).toBe(1)
  })

  it('markRemoved rimuove dal Set', () => {
    useWatchlist.getState().setWatched(['mkt-1', 'mkt-2'])
    useWatchlist.getState().markRemoved('mkt-1')
    expect(useWatchlist.getState().watched.has('mkt-1')).toBe(false)
    expect(useWatchlist.getState().watched.has('mkt-2')).toBe(true)
  })

  it('markRemoved no-op se id non presente (no re-render)', () => {
    useWatchlist.getState().setWatched(['mkt-1'])
    const before = useWatchlist.getState().watched
    useWatchlist.getState().markRemoved('non-esiste')
    const after = useWatchlist.getState().watched
    // Stesso reference quando no-op (per evitare re-render)
    expect(after).toBe(before)
  })

  it('reset svuota Set e resetta hydrated', () => {
    useWatchlist.getState().setWatched(['mkt-1', 'mkt-2'])
    useWatchlist.getState().reset()
    const state = useWatchlist.getState()
    expect(state.watched.size).toBe(0)
    expect(state.hydrated).toBe(false)
  })
})
