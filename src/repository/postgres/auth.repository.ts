import prisma from '../../lib/prisma.ts'

export async function createUser({ email, password, username }: { email: string; password: string; username: string }) {
  return prisma.user.create({
    data: {
      email,
      password,
      username,
      profile: {
        create: {}
      }
    }
  })
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email }
  })
}
