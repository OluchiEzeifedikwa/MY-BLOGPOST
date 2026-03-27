import prisma from '../../lib/prisma.ts'

export async function createComment({ content, userId, postId }: { content: string; userId: string; postId: string }) {
  return prisma.comment.create({
    data: { content, userId, postId }
  })
}

export async function findCommentsByPostId(postId: string) {
  return prisma.comment.findMany({
    where: { postId },
    include: { user: { select: { username: true, profile: { select: { image: true } } } } },
    orderBy: { createdAt: 'desc' }
  })
}

export async function findCommentById(id: string) {
  return prisma.comment.findUnique({
    where: { id }
  })
}

export async function deleteComment(id: string) {
  return prisma.comment.delete({
    where: { id }
  })
}
