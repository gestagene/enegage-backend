import express from "express";
import { authGoogle, registerUser } from "../auth/auth.controller.js";

const router = express.Router();

router.post("/google", authGoogle);
router.post("/signup", registerUser);

export default router;
