import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173"],
};

app.use(express.json());
app.use(cors(corsOptions));

app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello Gene" });
});

export { app };
