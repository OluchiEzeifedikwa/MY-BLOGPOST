import mongoose from '../../lib/mongodb.ts'

const CommentViewSchema = new mongoose.Schema({
  commentId: { type: String, required: true },
  userId: { type: String, required: true },
  viewedAt: { type: Date, default: Date.now }
})

CommentViewSchema.index({ commentId: 1, userId: 1 }, { unique: true })

const CommentViewModel = mongoose.model('CommentView', CommentViewSchema)

export async function logCommentView(commentId: string, userId: string) {
  await CommentViewModel.updateOne(
    { commentId, userId },
    { $set: { viewedAt: new Date() } },
    { upsert: true }
  )
}

export async function getCommentViewCount(commentId: string) {
  return CommentViewModel.countDocuments({ commentId })
}
