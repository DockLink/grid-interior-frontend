import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string({ error: "Email is required" }).trim().min(1, "Email is required"),
  password: z.string({ error: "Password is required" }).min(1, "Password is required"),
});

export const refreshBodySchema = z.object({
  refresh_token: z.string().min(1).optional(),
});

export const changePasswordBodySchema = z.object({
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

export function firstZodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request";
}
