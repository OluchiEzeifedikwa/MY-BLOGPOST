import prisma from '../../lib/prisma.ts'
import type { Prisma } from '../../../generated/prisma/client.ts'

export async function createPost({ title, content, image, userId, published }: { title: string; content: string; image?: string; userId: string; published?: boolean }) {
  return prisma.post.create({
    data: { title, content, userId, ...(image ? { image } : {}), ...(published !== undefined ? { published } : {}) }
  })
}

export async function findAllPosts(options: {
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

export async function findPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: { user: { select: { username: true, profile: { select: { image: true } } } }, _count: { select: { comments: true } } }
  })
}

export async function updatePost(id: string, data: { title?: string; content?: string; image?: string; published?: boolean }) {
  return prisma.post.update({
    where: { id },
    data
  })
}

export async function deletePost(id: string) {
  return prisma.post.delete({
    where: { id }
  })
}
