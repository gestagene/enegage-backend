import { Request, Response } from "express";
import supabase from "../../lib/supabase-client.js";
import { checkUrlSafety } from "../../lib/safebrowsing.js";

export async function createPost(req: Request, res: Response) {
  const { title, body, post_type, link_url } = req.body;
  const user_id = req.user!.id;
  const imageFile = req.file;

  if (!title) {
    return res.status(400).json({ message: "Title field is required" });
  }
  if (!post_type) {
    return res.status(400).json({ message: "Invalid post type" });
  }
  if (post_type === "image" && !imageFile) {
    return res.status(400).json({ message: "Missing image file" });
  }

  if (link_url) {
    const safety = await checkUrlSafety(req.body);
    if (!safety) {
      return res
        .status(400)
        .json({ message: "This URL is unsafe and cannot be posted" });
    }
  }

  let media_url: string | null = null;
  let media_type: string | null = null;

  if (imageFile) {
    const fileExt = imageFile.originalname.split(".").pop();
    const filePath = `${user_id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("post-media")
      .upload(filePath, imageFile.buffer, {
        contentType: imageFile.mimetype,
      });
    if (uploadError) {
      return res.status(400).json({ message: uploadError.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from("post-media")
      .getPublicUrl(filePath);

    media_url = publicUrlData.publicUrl;
    media_type = imageFile.mimetype;
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({ title, body, post_type, user_id, link_url })
    .select()
    .single();
  if (postError) {
    return res.status(400).json({ message: postError.message });
  }

  if (media_url) {
    const { error: mediaError } = await supabase.from("media").insert({
      post_id: post.id,
      media_url,
      media_type,
    });

    if (mediaError) {
      return res.status(400).json({ message: mediaError.message });
    }
  }
  return res.status(201).json({ post });
}

export async function getPosts(req: Request, res: Response) {
  const user_id = req.user?.id;

  let query = supabase
    .from("posts")
    .select(
      `
      *,
      users (username),
      media (media_url, media_type),
      votes (vote_type),
      comments (count)
    `,
    )
    .order("created_at", { ascending: false });

  if (user_id) {
    query = query.eq("votes.user_id", user_id);
  }

  const { data, error } = await query;

  if (error) return res.status(400).json({ message: error.message });

  const posts = data.map((post) => ({
    ...post,
    user_vote: post.votes?.[0]?.vote_type ?? null,
    votes: undefined,
    comment_count: post.comments?.[0]?.count ?? 0,
    comments: undefined,
  }));

  return res.status(200).json(posts);
}

export async function getPost(req: Request, res: Response) {
  const { id } = req.params;
  const user_id = req.user?.id;

  let query = supabase
    .from("posts")
    .select(
      `*, users (username), media (media_url, media_type), votes (vote_type), comments (count)`,
    )
    .eq("id", id);

  if (user_id) {
    query = query.eq("votes.user_id", user_id);
  }

  const { data, error } = await query.single();

  if (error) {
    return res.status(404).json({ message: "Post not found" });
  }

  const post = {
    ...data,
    user_vote: data.votes?.[0]?.vote_type ?? null,
    votes: undefined,
    comment_count: data.comments?.[0]?.count ?? 0,
    comments: undefined,
  };

  return res.status(200).json({ post });
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
    return res
      .status(403)
      .json({ message: "You do not have permission to edit this post." });
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
    return res
      .status(403)
      .json({ message: "You do not have permission to delete this post" });
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(200).json({ message: "Post deleted successfully" });
}
