import { Request, Response } from "express";
import supabase from "../../lib/supabase-client.js";

export async function createComment(req: Request, res: Response) {
  const user_id = req.user!.id;
  const { post_id } = req.params;
  const { content } = req.body;

  if (!user_id) {
    return res
      .status(401)
      .json({ message: "You must be logged in to post a comment" });
  }
  if (!post_id) {
    return res.status(400).json({ message: "Post doesn't exist" });
  }
  if (!content) {
    return res.status(400).json({ message: "Comment content can't be empty" });
  }

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({ content, user_id, post_id })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(201).json({ comment });
}

export async function getComments(req: Request, res: Response) {
  const { post_id } = req.params;

  const { data: comments, error } = await supabase
    .from("comments")
    .select(`id, content, created_at, users(username)`)
    .eq("post_id", post_id)
    .order("created_at", { ascending: false });
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(200).json({ comments });
}

export async function deleteComment(req: Request, res: Response) {
  const { id } = req.params;
  const user_id = req.user!.id;

  const { data: comment, error: fetchError } = await supabase
    .from("comments")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError) {
    return res.status(404).json({ message: "Comment not found" });
  }
  if (comment?.user_id !== user_id) {
    return res
      .status(403)
      .json({ message: "You do not have permission to delete this comment" });
  }

  const { error } = await supabase.from("comments").delete().eq("id", id);

  if (error) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(200).json({ message: "Comment deleted successfully" });
}
