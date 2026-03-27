import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { createUser, findUserByEmail } from '../repository/postgres/auth.repository.ts'
import { AppError } from '../middleware/error.middleware.ts'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export async function registerUser({ email, password, username }: { email: string; password: string; username: string }) {
  const existingUser = await findUserByEmail(email)
  if (existingUser) {
    throw new AppError(409, 'Email already in use')
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await createUser({ email, password: hashedPassword, username })

  return { message: 'User registered successfully', userId: user.id }
}

export async function loginUser({ email, password }: { email: string; password: string }) {
  const user = await findUserByEmail(email)
  if (!user) {
    throw new AppError(401, 'Invalid email or password')
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new AppError(401, 'Invalid email or password')
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

  return { token, username: user.username }
}
