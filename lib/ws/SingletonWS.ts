/**
 * Singleton WebSocket manager.
 *
 * Una sola connessione per URL. I subscriber si registrano con un topic
 * e una callback. Reference-counting: la connessione si chiude quando
 * l'ultimo subscriber chiama unsubscribe().
 *
 * Auto-reconnect con exponential backoff, max 30s.
 *
 * Solo client-side: il file può essere importato lato server senza crash
 * (init guardata da `typeof window`), ma i listener si attivano solo nel browser.
 */

export type WsListener = (data: unknown) => void

interface ManagedWS {
  url: string
  ws: WebSocket | null
  listeners: Map<string, Set<WsListener>>
  refCount: number
  reconnectAttempt: number
  reconnectTimer: ReturnType<typeof setTimeout> | null
  pendingMessages: string[]
}

const connections = new Map<string, ManagedWS>()
const MAX_BACKOFF_MS = 30_000

function getOrCreate(url: string): ManagedWS {
  let conn = connections.get(url)
  if (!conn) {
    conn = {
      url,
      ws: null,
      listeners: new Map(),
      refCount: 0,
      reconnectAttempt: 0,
      reconnectTimer: null,
      pendingMessages: [],
    }
    connections.set(url, conn)
    openSocket(conn)
  }
  return conn
}

function openSocket(conn: ManagedWS): void {
  if (typeof window === 'undefined' || typeof WebSocket === 'undefined') return

  const ws = new WebSocket(conn.url)
  conn.ws = ws

  ws.addEventListener('open', () => {
    conn.reconnectAttempt = 0
    for (const msg of conn.pendingMessages) {
      ws.send(msg)
    }
    conn.pendingMessages = []
  })

  ws.addEventListener('message', (event) => {
    let data: unknown
    try {
      data = JSON.parse(typeof event.data === 'string' ? event.data : '')
    } catch {
      return
    }
    const topic =
      (data && typeof data === 'object' && 'event_type' in data
        ? (data as { event_type?: string }).event_type
        : undefined) ?? ''
    const exact = conn.listeners.get(topic)
    if (exact) exact.forEach((cb) => cb(data))
    const all = conn.listeners.get('*')
    if (all) all.forEach((cb) => cb(data))
  })

  ws.addEventListener('close', () => {
    conn.ws = null
    if (conn.refCount <= 0) return
    const delay = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** conn.reconnectAttempt)
    conn.reconnectAttempt += 1
    conn.reconnectTimer = setTimeout(() => openSocket(conn), delay)
  })

  ws.addEventListener('error', () => {
    // 'close' segue sempre 'error': la logica di reconnect è centralizzata lì
  })
}

interface SubscribeOptions {
  /** Messaggio JSON inviato al server al momento della sottoscrizione (es. payload `subscribe`) */
  initMessage?: object
}

/**
 * Sottoscrive un listener per `topic` sull'endpoint `url`.
 * Ritorna la funzione di unsubscribe — chiamarla fa cleanup ref-count e chiude
 * la connessione se questo era l'ultimo subscriber.
 */
export function subscribe(
  url: string,
  topic: string,
  listener: WsListener,
  options?: SubscribeOptions
): () => void {
  const conn = getOrCreate(url)
  conn.refCount += 1

  if (!conn.listeners.has(topic)) conn.listeners.set(topic, new Set())
  conn.listeners.get(topic)!.add(listener)

  if (options?.initMessage) {
    const json = JSON.stringify(options.initMessage)
    if (conn.ws?.readyState === WebSocket.OPEN) conn.ws.send(json)
    else conn.pendingMessages.push(json)
  }

  return () => {
    conn.refCount -= 1
    const set = conn.listeners.get(topic)
    if (set) {
      set.delete(listener)
      if (set.size === 0) conn.listeners.delete(topic)
    }
    if (conn.refCount <= 0) {
      if (conn.reconnectTimer) clearTimeout(conn.reconnectTimer)
      conn.ws?.close()
      connections.delete(url)
    }
  }
}

/** Diagnostico/test: numero connessioni attive */
export function _activeConnectionCount(): number {
  return connections.size
}
