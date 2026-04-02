import prisma from '../../lib/prisma.ts'

class CommentRepository {
  async create({ content, userId, postId }: { content: string; userId: string; postId: string }) {
    return prisma.comment.create({
      data: { content, userId, postId }
    })
  }

  async findByPostId(postId: string) {
    return prisma.comment.findMany({
      where: { postId },
      include: { user: { select: { username: true, profile: { select: { image: true } } } } },
      orderBy: { createdAt: 'desc' }
    })
  }

  async findById(id: string) {
    return prisma.comment.findUnique({
      where: { id }
    })
  }

  async delete(id: string) {
    return prisma.comment.delete({
      where: { id }
    })
  }
}

export default new CommentRepository()
