import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/auth.middleware.ts'
import { createPostService, getAllPostsService, getPostService, updatePostService, deletePostService, getMostViewedPostsService } from '../services/post.service.ts'
import { uploadImage } from '../lib/uploadImage.ts'
import { createPostSchema, updatePostSchema } from '../lib/schemas.ts'

export async function createPost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = createPostSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0]?.message })
      return
    }

    let image: string | undefined
    if (req.file) {
      image = await uploadImage(req.file.buffer)
    }

    const { title, content, published } = parsed.data
    const post = await createPostService({ title, content, userId: req.userId!, ...(published !== undefined ? { published } : {}), ...(image ? { image } : {}) })
    res.status(201).json(post)
  } catch (error) {
    next(error)
  }
}

export async function getAllPosts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit, search, userId, sortBy, sortOrder } = req.query

    const result = await getAllPostsService({
      ...(page ? { page: Number(page) } : {}),
      ...(limit ? { limit: Number(limit) } : {}),
      ...(search ? { search: search as string } : {}),
      ...(userId ? { userId: userId as string } : {}),
      ...(sortBy ? { sortBy: sortBy as 'createdAt' | 'userId' } : {}),
      ...(sortOrder ? { sortOrder: sortOrder as 'asc' | 'desc' } : {})
    })

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export async function getPost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const post = await getPostService(req.params['id'] as string, req.userId)
    res.status(200).json(post)
  } catch (error) {
    next(error)
  }
}

export async function getMostViewedPosts(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const posts = await getMostViewedPostsService()
    res.status(200).json(posts)
  } catch (error) {
    next(error)
  }
}

export async function updatePost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = updatePostSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0]?.message })
      return
    }

    const { title, content, published } = parsed.data
    const post = await updatePostService(req.params['id'] as string, req.userId!, {
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(published !== undefined ? { published } : {})
    })
    res.status(200).json(post)
  } catch (error) {
    next(error)
  }
}

export async function deletePost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await deletePostService(req.params['id'] as string, req.userId!)
    res.status(200).json({ message: 'Post deleted successfully' })
  } catch (error) {
    next(error)
  }
}
