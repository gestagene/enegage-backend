import z from "zod";

export const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Must be 3 characters")
    .max(20, "Must be 20 characters or fewer")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
});
