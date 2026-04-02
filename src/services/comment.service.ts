import commentRepo from '../repository/postgres/comment.repository.ts'
import commentViewRepo from '../repository/mongodb/comment.repository.ts'
import { AppError } from '../middleware/error.middleware.ts'

export async function createCommentService({ content, userId, postId }: { content: string; userId: string; postId: string }) {
  return commentRepo.create({ content, userId, postId })
}

export async function getCommentsByPostService(postId: string) {
  return commentRepo.findByPostId(postId)
}

export async function logCommentViewService(commentId: string, userId: string) {
  return commentViewRepo.logView(commentId, userId)
}

export async function getCommentViewCountService(commentId: string) {
  return commentViewRepo.getViewCount(commentId)
}

export async function deleteCommentService(id: string, userId: string) {
  const comment = await commentRepo.findById(id)
  if (!comment) throw new AppError(404, 'Comment not found')
  if (comment.userId !== userId) throw new AppError(403, 'Not authorized')
  return commentRepo.delete(id)
}
