import { Request, Response } from "express";
import { createAuthClient } from "../../lib/supabase-auth-client.js";

export async function authUser(req: Request, res: Response) {
  const supabaseAuth = createAuthClient();
  const { email, password } = req.body;
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return res.status(401).json({ message: error.message });
  }
  return res.status(200).json({ user: data.user, session: data.session });
}

export async function authGoogle(req: Request, res: Response) {
  const supabaseAuth = createAuthClient();
  const { token } = req.body;

  const { data, error } = await supabaseAuth.auth.signInWithIdToken({
    provider: "google",
    token,
  });

  if (error) {
    return res.status(401).json({ message: error.message });
  }

  return res.status(200).json({
    user: data.user,
    session: data.session,
  });
}

export async function registerUser(req: Request, res: Response) {
  const supabaseAuth = createAuthClient();
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ message: "Something went wrong." });
  }

  if (username.length < 3) {
    return res
      .status(400)
      .json({ message: "Usernames can be 3 to 20 characters long." });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters." });
  }

  const { data: existingUser } = await supabaseAuth
    .from("profiles")
    .select("username")
    .eq("username", username)
    .single();

  if (existingUser) {
    return res.status(409).json({ message: "Username is already taken." });
  }

  const { data, error } = await supabaseAuth.auth.signUp({
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

  if (data.user && data.user.identities?.length === 0) {
    return res.status(409).json({ message: "Email is already used." });
  }

  return res
    .status(201)
    .json({ message: "Check your email to confirm your account." });
}
