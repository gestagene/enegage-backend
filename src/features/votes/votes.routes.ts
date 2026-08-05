import { handleVote } from "../votes/votes.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

router.post("/:post_id", requireAuth, handleVote);

export default router;
