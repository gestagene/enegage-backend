import express from "express";
import { authUser, authGoogle, registerUser } from "../controllers/auth.js";

const router = express.Router();

router.post("/login", authUser);
router.post("/google", authGoogle);
router.post("/signup", registerUser);

export default router;
