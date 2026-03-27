import { createComment, findCommentsByPostId, findCommentById, deleteComment } from '../repository/postgres/comment.repository.ts'
import { logCommentView, getCommentViewCount } from '../repository/mongodb/comment.repository.ts'
import { AppError } from '../middleware/error.middleware.ts'

export async function createCommentService({ content, userId, postId }: { content: string; userId: string; postId: string }) {
  return createComment({ content, userId, postId })
}

export async function getCommentsByPostService(postId: string) {
  return findCommentsByPostId(postId)
}

export async function logCommentViewService(commentId: string, userId: string) {
  return logCommentView(commentId, userId)
}

export async function getCommentViewCountService(commentId: string) {
  return getCommentViewCount(commentId)
}

export async function deleteCommentService(id: string, userId: string) {
  const comment = await findCommentById(id)
  if (!comment) throw new AppError(404, 'Comment not found')
  if (comment.userId !== userId) throw new AppError(403, 'Not authorized')
  return deleteComment(id)
}
