import { Request, Response } from "express";
import { createAuthClient } from "../../lib/supabase-auth-client.js";
import supabase from "../../lib/supabase-client.js";
import * as z from "zod";

const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export async function registerUser(req: Request, res: Response) {
  const result = signupSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid signup data",
      errors: result.error.flatten(),
    });
  }

  const { email, password } = result.data;

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return res.status(error.status ?? 400).json({ message: error.message });
    }
    if (data.user && data.user.identities?.length === 0) {
      return res.status(409).json({ message: "Email already registered" });
    }
    return res.status(201).json({
      message: "Please check your email to verify",
    });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
}
