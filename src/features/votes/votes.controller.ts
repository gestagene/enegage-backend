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

  const { data, error } = await supabase.rpc("handle_vote", {
    p_user_id: user_id,
    p_post_id: post_id,
    p_vote_type: vote_type,
  });

  if (error) return res.status(400).json({ message: error.message });

  return res.status(200).json({ vote_type: data });
}
