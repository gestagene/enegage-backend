import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
} from "../posts/posts.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

import express from "express";
const router = express.Router();

router.get("/", getPosts);
router.get("/:id", getPost);

router.post("/", requireAuth, createPost);
router.put("/:id", requireAuth, updatePost);
router.delete("/:id", requireAuth, deletePost);

export default router;
