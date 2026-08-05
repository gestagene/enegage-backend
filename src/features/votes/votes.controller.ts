import { Request, Response } from "express";
import supabase from "../../lib/supabase-client.js";

type VoteParams = {
  post_id: string;
};

export async function handleVote(req: Request<VoteParams>, res: Response) {
  const user_id = req.user!.id;
  const { post_id } = req.params;
  const { vote_type } = req.body;

  if (vote_type !== "up" && vote_type !== "down") {
    return res.status(400).json({ message: "Invalid vote type" });
  }

  const { data: existing, error } = await supabase
    .from("votes")
    .select("id, vote_type")
    .eq("user_id", user_id)
    .eq("post_id", post_id)
    .maybeSingle();

  if (error) return res.status(400).json({ message: error.message });

  if (!existing) {
    const { error } = await supabase
      .from("votes")
      .insert({ user_id, post_id, vote_type });

    if (error) return res.status(400).json({ message: error.message });

    return res.status(201).json({ vote_type });
  } else if (existing.vote_type === vote_type) {
    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("id", existing.id);

    if (error) return res.status(400).json({ message: error.message });

    return res.status(200).json({ vote_type: null });
  } else {
    const { error } = await supabase
      .from("votes")
      .update({ vote_type })
      .eq("id", existing.id);

    if (error) return res.status(400).json({ message: error.message });

    return res.status(200).json({ vote_type });
  }
}
