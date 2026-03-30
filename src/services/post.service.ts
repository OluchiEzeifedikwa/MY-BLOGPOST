import { createPost, findAllPosts, findPostById, updatePost, deletePost } from '../repository/postgres/post.repository.ts'
import { logPostView, getMostViewedPostIds, getAllPostViewCounts } from '../repository/mongodb/post.repository.ts'
import { AppError } from '../middleware/error.middleware.ts'

export async function createPostService({ title, content, image, userId, published }: { title: string; content: string; image?: string; userId: string; published?: boolean }) {
  return createPost({ title, content, userId, ...(image ? { image } : {}), ...(published !== undefined ? { published } : {}) })
}

export async function getAllPostsService({
  page = 1,
  limit = 10,
  search,
  userId,
  sortBy = 'createdAt',
  sortOrder = 'desc'
}: {
  page?: number
  limit?: number
  search?: string
  userId?: string
  sortBy?: 'createdAt' | 'userId'
  sortOrder?: 'asc' | 'desc'
} = {}) {
  const [{ posts, total }, viewCounts] = await Promise.all([
    findAllPosts({
      where: {
        published: true,
        ...(userId ? { userId } : {}),
        ...(search ? { user: { username: { startsWith: search, mode: 'insensitive' as const } } } : {})
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit
    }),
    getAllPostViewCounts().catch(() => [])
  ])

  const viewsMap = new Map(viewCounts.map(({ postId, views }) => [postId, views]))

  return {
    posts: posts.map(post => ({ ...post, views: viewsMap.get(post.id) ?? 0 })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}

export async function getPostService(id: string, userId?: string) {
  const post = await findPostById(id)
  if (!post) throw new AppError(404, 'Post not found')
  if (userId) await logPostView(id, userId)
  return post
}

export async function getMostViewedPostsService(limit = 1) {
  const topPosts = await getMostViewedPostIds(limit).catch(() => [])
  const viewsMap = new Map(topPosts.map(({ postId, views }) => [postId, views]))
  const posts = await Promise.all(topPosts.map(({ postId }) => findPostById(postId)))
  return posts
    .filter(Boolean)
    .map(post => ({ ...post, views: viewsMap.get(post!.id)! }))
}

export async function updatePostService(id: string, userId: string, data: { title?: string; content?: string; image?: string; published?: boolean }) {
  const post = await findPostById(id)
  if (!post) throw new AppError(404, 'Post not found')
  if (post.userId !== userId) throw new AppError(403, 'Not authorized')
  return updatePost(id, data)
}

export async function deletePostService(id: string, userId: string) {
  const post = await findPostById(id)
  if (!post) throw new AppError(404, 'Post not found')
  if (post.userId !== userId) throw new AppError(403, 'Not authorized')
  return deletePost(id)
}

