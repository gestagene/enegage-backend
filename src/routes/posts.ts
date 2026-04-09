import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
} from "../controllers/posts.js";
import express from "express";
const router = express.Router();

router.get("/", getPosts);
router.post("/", createPost);
router.get("/:id", getPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

export default router;
