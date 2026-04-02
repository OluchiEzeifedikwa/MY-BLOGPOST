import mongoose from '../../lib/mongodb.ts'

const PostViewSchema = new mongoose.Schema({
  postId: { type: String, required: true },
  userId: { type: String, required: true },
  viewedAt: { type: Date, default: Date.now }
})

PostViewSchema.index({ postId: 1, userId: 1 }, { unique: true })

const PostViewModel = mongoose.model('PostView', PostViewSchema)

class PostViewRepository {
  async logView(postId: string, userId: string) {
    await PostViewModel.updateOne(
      { postId, userId },
      { $set: { viewedAt: new Date() } },
      { upsert: true }
    )
  }

  async getAllViewCounts(): Promise<{ postId: string; views: number }[]> {
    return PostViewModel.aggregate([
      { $group: { _id: '$postId', views: { $sum: 1 } } },
      { $project: { _id: 0, postId: '$_id', views: 1 } }
    ])
  }

  async getMostViewedIds(limit = 1): Promise<{ postId: string; views: number }[]> {
    return PostViewModel.aggregate([
      { $group: { _id: '$postId', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: limit },
      { $project: { _id: 0, postId: '$_id', views: 1 } }
    ])
  }

  async getViewsTimeline(postIds: string[], days = 30): Promise<{ postId: string; date: string; views: number }[]> {
    const since = new Date()
    since.setDate(since.getDate() - days)

    return PostViewModel.aggregate([
      { $match: { postId: { $in: postIds }, viewedAt: { $gte: since } } },
      {
        $group: {
          _id: {
            postId: '$postId',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' } }
          },
          views: { $sum: 1 }
        }
      },
      { $project: { _id: 0, postId: '$_id.postId', date: '$_id.date', views: 1 } },
      { $sort: { date: 1 } }
    ])
  }
}

export default new PostViewRepository()
