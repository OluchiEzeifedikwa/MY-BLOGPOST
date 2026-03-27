import type { Request, Response, NextFunction } from 'express'
import { registerUser, loginUser } from '../services/auth.service.ts'

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, username } = req.body

    if (!email || !password || !username) {
      res.status(400).json({ message: 'Email, password and username are required' })
      return
    }

    const result = await registerUser({ email, password, username })
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' })
      return
    }

    const { token, username } = await loginUser({ email, password })

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.status(200).json({ message: 'Logged in successfully', username, token })
  } catch (error) {
    next(error)
  }
}

export function logout(_req: Request, res: Response) {
  res.clearCookie('token')
  res.status(200).json({ message: 'Logged out successfully' })
}
