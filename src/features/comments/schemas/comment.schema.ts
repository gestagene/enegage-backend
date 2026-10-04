import { z } from "zod";

const MAX_COMMENT_LENGTH = 2000;

export const createCommentSchema = z.object({
  params: z.object({
    post_id: z.uuid(),
  }),
  body: z.object({
    content: z
      .string()
      .trim()
      .min(1, "Comment content can't be empty")
      .max(MAX_COMMENT_LENGTH, "Comment is too long"),
    parent_comment_id: z.number().int().positive().nullish(),
  }),
});

export const getCommentsSchema = z.object({
  params: z.object({
    post_id: z.uuid(),
  }),
});

export const repliesSchema = z.object({
  params: z.object({
    comment_id: z.coerce.number().int().positive(),
  }),
  query: z.object({
    offset: z.coerce.number().int().min(0).default(0),
  }),
});

export const deleteCommentSchema = z.object({
  params: z.object({ comment_id: z.coerce.number().int().positive() }),
});
