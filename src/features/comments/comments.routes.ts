import {
  createComment,
  getComments,
  deleteComment,
  replies,
} from "./comments.controller.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  createCommentSchema,
  deleteCommentSchema,
  getCommentsSchema,
  repliesSchema,
} from "./schemas/comment.schema.js";
import { optionalAuth, requireAuth } from "../../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

//Comments
router.get(
  "/:post_id",
  optionalAuth,
  validateRequest(getCommentsSchema),
  getComments,
);
router.post(
  "/:post_id",
  requireAuth,
  validateRequest(createCommentSchema),
  createComment,
);
router.delete(
  "/:comment_id",
  requireAuth,
  validateRequest(deleteCommentSchema),
  deleteComment,
);

//replies
router.get(
  "/:comment_id/replies",
  optionalAuth,
  validateRequest(repliesSchema),
  replies,
);

export default router;
