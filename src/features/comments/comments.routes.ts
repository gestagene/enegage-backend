import {
  createComment,
  getComments,
  deleteComment,
} from "./comments.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

router.get("/:post_id", getComments);

router.post("/:post_id", requireAuth, createComment);
router.delete("/:post_id", requireAuth, deleteComment);

export default router;
