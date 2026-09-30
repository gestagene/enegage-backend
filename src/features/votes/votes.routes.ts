import { handleCommentVote, handleVote } from "../votes/votes.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

router.post("/posts/:post_id", requireAuth, handleVote);
router.post("/comments/:comment_id", requireAuth, handleCommentVote);

export default router;
