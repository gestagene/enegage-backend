import express from "express";
import { authUser, registerUser } from "../controllers/auth.js";

const router = express.Router();

router.post("/login", authUser);
router.post("/signup", registerUser);

export default router;
