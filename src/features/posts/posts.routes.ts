import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
} from "../posts/posts.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import multer from "multer";
import express from "express";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", getPosts);
router.get("/:id", getPost);

router.post("/", requireAuth, upload.single("image"), createPost);
router.put("/:id", requireAuth, updatePost);
router.delete("/:id", requireAuth, deletePost);

export default router;
