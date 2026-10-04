import { Request, Response } from "express";
import supabase from "../../lib/supabase-client.js";

const BASE_SELECT = `
  id, content, created_at, vote_score, post_id, parent_comment_id,
  user:users(id, username, avatar_url),
  replies:comments!comments_parent_comment_id_fkey(count)
`;

const selectFor = (user_id?: string) =>
  user_id ? `${BASE_SELECT}, comment_votes(vote_type)` : BASE_SELECT;

export async function createComment(req: Request, res: Response) {
  const user_id = req.user!.id;
  const { post_id } = req.params;
  const { content, parent_comment_id: parentId = null } = req.body;

  if (parentId) {
    const { data: parent } = await supabase
      .from("comments")
      .select("id, post_id, parent_comment_id")
      .eq("id", parentId)
      .single();

    if (!parent || parent.post_id !== post_id) {
      return res.status(400).json({ error: "Invalid parent comment" });
    }
  }
  const { data: comment, error } = await supabase
    .from("comments")
    .insert({ content, user_id, post_id, parent_comment_id: parentId })
    .select(BASE_SELECT)
    .single();

  if (error) {
    if (error.code === "23503") {
      return res
        .status(404)
        .json({ message: "Post or parent comment no longer exists" });
    }
    return res.status(400).json({ message: error.message });
  }

  return res.status(201).json({ comment: shapeComment(comment) });
}

export async function getComments(req: Request, res: Response) {
  const { post_id } = req.params;
  const user_id = req.user?.id;

  let query = supabase
    .from("comments")
    .select(`${selectFor(user_id)}`)
    .eq("post_id", post_id)
    .is("parent_comment_id", null)
    .order("created_at", { ascending: false });

  //Checks a logged in user's vote on a comment
  if (user_id) {
    query = query.eq("comment_votes.user_id", user_id);
  }

  const { data, error } = await query;

  if (error) return res.status(400).json({ message: error.message });

  return res.status(200).json({ comments: data.map(shapeComment) });
}

export async function replies(req: Request, res: Response) {
  const { comment_id } = req.params;
  const user_id = req.user?.id;
  const { offset } = res.locals.query as { offset: number };
  const limit = 5;

  let query = supabase
    .from("comments")
    .select(selectFor(user_id))
    .eq("parent_comment_id", comment_id)
    .order("id", { ascending: true })
    .range(offset, offset + limit - 1);

  //Checks a logged in user's vote on a reply
  if (user_id) {
    query = query.eq("comment_votes.user_id", user_id);
  }

  const { data, error } = await query;
  if (error) return res.status(400).json({ message: error.message });

  const replies = data.map(shapeComment);

  return res.status(200).json({ replies });
}

export async function deleteComment(req: Request, res: Response) {
  const { comment_id } = req.params;
  const user_id = req.user!.id;

  const { data: comment, error: fetchError } = await supabase
    .from("comments")
    .select("user_id")
    .eq("id", comment_id)
    .single();

  if (fetchError || !comment) {
    return res.status(404).json({ message: "Comment not found" });
  }
  if (comment?.user_id !== user_id) {
    return res
      .status(403)
      .json({ message: "You do not have permission to delete this comment" });
  }

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", comment_id);

  if (error) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(200).json({ message: "Comment deleted successfully" });
}

function shapeComment(row: any) {
  const { replies, comment_votes, ...rest } = row;
  return {
    ...rest,
    reply_count: replies?.[0]?.count ?? 0,
    user_vote: comment_votes?.[0]?.vote_type ?? null,
  };
}
