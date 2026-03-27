import { Request, Response } from "express";
import supabase from "../supabase-client.js";

export async function authUser(req: Request, res: Response) {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return res.status(401).json({ message: error.message });
  }
  return res.status(200).json({ user: data.user, session: data.session });
}

export async function registerUser(req: Request, res: Response) {
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ message: "Something went wrong." });
  }

  const { data: existingUser } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .single();

  if (existingUser) {
    return res.status(409).json({ message: "Username is already taken" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters" });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error) {
    return res.status(400).json({ message: error.message });
  }
  return res
    .status(201)
    .json({ message: "Check your email to confirm your account." });
}
