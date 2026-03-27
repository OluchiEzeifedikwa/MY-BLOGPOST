import { WebSocketServer, WebSocket } from 'ws'
import type { IncomingMessage } from 'http'
import type { Server } from 'http'
import jwt from 'jsonwebtoken'
import { URL } from 'url'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

// postId → connected clients
const rooms = new Map<string, Set<WebSocket>>()

function joinRoom(postId: string, ws: WebSocket) {
  if (!rooms.has(postId)) rooms.set(postId, new Set())
  rooms.get(postId)!.add(ws)
}

function leaveRoom(postId: string, ws: WebSocket) {
  rooms.get(postId)?.delete(ws)
  if (rooms.get(postId)?.size === 0) rooms.delete(postId)
}

export function broadcast(postId: string, event: string, data: unknown) {
  const clients = rooms.get(postId)
  if (!clients) return
  const message = JSON.stringify({ event, data })
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) client.send(message)
  }
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' })

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url!, `http://${req.headers.host}`)
    const postId = url.searchParams.get('postId')
    const token = url.searchParams.get('token')

    if (!postId || !token) {
      ws.close(1008, 'Missing postId or token')
      return
    }

    try {
      jwt.verify(token, JWT_SECRET)
    } catch {
      ws.close(1008, 'Invalid or expired token')
      return
    }

    joinRoom(postId, ws)

    ws.on('close', () => leaveRoom(postId, ws))
  })
}
