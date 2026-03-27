import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/auth.middleware.ts'
import { createPostService, getAllPostsService, getPostService, updatePostService, deletePostService, getMostViewedPostsService } from '../services/post.service.ts'
import { uploadImage } from '../lib/uploadImage.ts'

export async function createPost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { title, content, published } = req.body
    if (!title || !content) {
      res.status(400).json({ message: 'Title and content are required' })
      return
    }

    let image: string | undefined
    if (req.file) {
      image = await uploadImage(req.file.buffer)
    }

    const post = await createPostService({ title, content, userId: req.userId!, published: published === true || published === 'true', ...(image ? { image } : {}) })
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
      ...(sortBy ? { sortBy: sortBy as 'createdAt' | 'title' } : {}),
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
    const post = await updatePostService(req.params['id'] as string, req.userId!, req.body)
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
