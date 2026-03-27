import { Router } from "express";
import { authenticate, optionalAuthenticate } from "../middleware/auth.middleware.ts";
import { upload } from "../middleware/upload.middleware.ts";
import { createPost, getAllPosts, getPost, updatePost, deletePost, getMostViewedPosts } from "../controllers/post.controller.ts";

const postRouter = Router();

postRouter.get("/", getAllPosts)
postRouter.get("/most-viewed", getMostViewedPosts)
postRouter.get("/:id", optionalAuthenticate, getPost)
postRouter.post("/", authenticate, upload.single('image'), createPost)
postRouter.put("/:id", authenticate, updatePost)
postRouter.delete("/:id", authenticate, deletePost)

export default postRouter;