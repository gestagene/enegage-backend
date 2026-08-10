import express from "express";
import cors from "cors";
import authRouter from "./features/auth/auth.routes.js";
import postsRouter from "./features/posts/posts.routes.js";
import votesRouter from "./features/votes/votes.routes.js";
import commentsRouter from "./features/comments/comments.routes.js";
const app = express();

const corsOptions = {
  origin: ["http://localhost:5173"],
};

app.use(express.json());
app.use(cors(corsOptions));

app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/votes", votesRouter);
app.use("/api/comments", commentsRouter);
app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello Gene" });
});

export { app };
