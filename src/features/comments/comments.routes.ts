import {
  createComment,
  getComments,
  deleteComment,
} from "./comments.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

router.get("/", getComments);

router.post("/", requireAuth, createComment);
router.delete("/:id", requireAuth, deleteComment);

export default router;
