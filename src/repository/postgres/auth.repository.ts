import prisma from '../../lib/prisma.ts'

class AuthRepository {
  async createUser({ email, password, username }: { email: string; password: string; username: string }) {
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

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    })
  }
}

export default new AuthRepository()
