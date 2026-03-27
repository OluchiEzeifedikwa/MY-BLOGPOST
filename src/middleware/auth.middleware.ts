import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export interface AuthRequest extends Request {
  userId?: string
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token

  if (!token) {
    res.status(401).json({ message: 'Not authenticated' })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    req.userId = decoded.userId
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export function optionalAuthenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.cookies?.token
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      req.userId = decoded.userId
    } catch {}
  }
  next()
}
