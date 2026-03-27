import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.ts";
import { createComment, getCommentsByPost, deleteComment, viewComment } from "../controllers/comment.controller.ts";

const commentRouter = Router();

commentRouter.get("/:id/comments", getCommentsByPost)
commentRouter.post("/:id/comments", authenticate, createComment)
commentRouter.delete("/:id/comments/:commentId", authenticate, deleteComment)
commentRouter.post("/:id/comments/:commentId/views", authenticate, viewComment)

export default commentRouter;