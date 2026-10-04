import { Request, Response } from "express";
import supabase from "../../lib/supabase-client.js";

export async function setUsername(req: Request, res: Response) {
  const user_id = req.user!.id;
  const { username } = req.body;

  const { error } = await supabase
    .from("users")
    .update({ username })
    .eq("id", user_id);

  if (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Username already taken" });
    }
    return res.status(500).json({ message: error.message });
  }
  return res.status(200).json({ username });
}
