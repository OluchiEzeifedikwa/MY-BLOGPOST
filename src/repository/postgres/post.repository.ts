import prisma from '../../lib/prisma.ts'
import type { Prisma } from '../../../generated/prisma/client.ts'

class PostRepository {
  async create({ title, content, image, userId, published }: { title: string; content: string; image?: string; userId: string; published?: boolean }) {
    return prisma.post.create({
      data: { title, content, userId, ...(image ? { image } : {}), ...(published !== undefined ? { published } : {}) }
    })
  }

  async findAll(options: {
    where: Prisma.PostWhereInput
    orderBy: Prisma.PostOrderByWithRelationInput
    skip: number
    take: number
  }) {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        ...options,
        include: { user: { select: { username: true, profile: { select: { image: true } } } }, _count: { select: { comments: true } } }
      }),
      prisma.post.count({ where: options.where })
    ])

    return { posts, total }
  }

  async findById(id: string) {
    return prisma.post.findUnique({
      where: { id },
      include: { user: { select: { username: true, profile: { select: { image: true } } } }, _count: { select: { comments: true } } }
    })
  }

  async findByUserId(userId: string) {
    return prisma.post.findMany({
      where: { userId },
      include: { _count: { select: { comments: true, likes: true } } },
      orderBy: { createdAt: 'desc' }
    })
  }

  async update(id: string, data: { title?: string; content?: string; image?: string; published?: boolean }) {
    return prisma.post.update({
      where: { id },
      data
    })
  }

  async delete(id: string) {
    return prisma.post.delete({
      where: { id }
    })
  }
}

export default new PostRepository()
