import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/auth.middleware.ts'
import { createCommentService, getCommentsByPostService, deleteCommentService, logCommentViewService, getCommentViewCountService } from '../services/comment.service.ts'
import { broadcast } from '../lib/websocket.ts'

export async function createComment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { content } = req.body
    const postId = req.params['id'] as string

    if (!content) {
      res.status(400).json({ message: 'Content is required' })
      return
    }

    const comment = await createCommentService({ content, userId: req.userId!, postId })
    broadcast(postId, 'comment:new', comment)
    res.status(201).json(comment)
  } catch (error) {
    next(error)
  }
}

export async function getCommentsByPost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const postId = req.params['id'] as string
    const comments = await getCommentsByPostService(postId)
    res.status(200).json(comments)
  } catch (error) {
    next(error)
  }
}

export async function viewComment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const commentId = req.params['commentId'] as string
    await logCommentViewService(commentId, req.userId!)
    const views = await getCommentViewCountService(commentId)
    res.status(200).json({ commentId, views })
  } catch (error) {
    next(error)
  }
}

export async function deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const commentId = req.params['commentId'] as string
    const postId = req.params['id'] as string
    await deleteCommentService(commentId, req.userId!)
    broadcast(postId, 'comment:deleted', { commentId })
    res.status(200).json({ message: 'Comment deleted successfully' })
  } catch (error) {
    next(error)
  }
}
