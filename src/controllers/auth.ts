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
