import { Request, Response } from "express";
import supabase from "../../lib/supabase-client.js";

export async function createPost(req: Request, res: Response) {
  const { title, body, post_type } = req.body;
  const user_id = req.user!.id;

  if (!title) {
    return res.status(400).json({ message: "Title field is required" });
  }
  if (!post_type) {
    return res.status(400).json({ message: "Invalid post type" });
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({ title, body, post_type, user_id })
    .select()
    .single();
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(201).json({ post: data });
}

export async function getPosts(req: Request, res: Response) {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
    *,
    users (
      username
    )
  `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(200).json({ posts: data });
}

export async function getPost(req: Request, res: Response) {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(404).json({ message: "Post not found" });
  }
  return res.status(200).json({ post: data });
}

export async function updatePost(req: Request, res: Response) {
  const { id } = req.params;
  const { title, body } = req.body;
  const user_id = req.user!.id;

  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !post) {
    return res.status(404).json({ message: "Post not found" });
  }
  if (post?.user_id !== user_id) {
    return res.status(403).json({ message: "Unauthorized action" });
  }

  const { data, error } = await supabase
    .from("posts")
    .update({ title, body })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(200).json({ post: data });
}

export async function deletePost(req: Request, res: Response) {
  const { id } = req.params;
  const user_id = req.user!.id;

  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !post) {
    return res.status(404).json({ message: "Post not found" });
  }
  if (post?.user_id !== user_id) {
    return res.status(403).json({ message: "Unauthorized action" });
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(200).json({ message: "Post deleted successfully" });
}
