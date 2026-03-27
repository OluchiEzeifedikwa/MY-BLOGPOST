import mongoose from '../../lib/mongodb.ts'

const PostViewSchema = new mongoose.Schema({
  postId: { type: String, required: true },
  userId: { type: String, required: true },
  viewedAt: { type: Date, default: Date.now }
})

PostViewSchema.index({ postId: 1, userId: 1 }, { unique: true })

const PostViewModel = mongoose.model('PostView', PostViewSchema)

export async function logPostView(postId: string, userId: string) {
  await PostViewModel.updateOne(
    { postId, userId },
    { $set: { viewedAt: new Date() } },
    { upsert: true }
  )
}

export async function getAllPostViewCounts(): Promise<{ postId: string; views: number }[]> {
  return PostViewModel.aggregate([
    { $group: { _id: '$postId', views: { $sum: 1 } } },
    { $project: { _id: 0, postId: '$_id', views: 1 } }
  ])
}

export async function getMostViewedPostIds(limit = 1): Promise<{ postId: string; views: number }[]> {
  return PostViewModel.aggregate([
    { $group: { _id: '$postId', views: { $sum: 1 } } },
    { $sort: { views: -1 } },
    { $limit: limit },
    { $project: { _id: 0, postId: '$_id', views: 1 } }
  ])
}
