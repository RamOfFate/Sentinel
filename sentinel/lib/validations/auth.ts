import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const nameSchema = z.object({
  name: z
    .string()
    .min(3, "Alias must be at least 3 characters")
    .max(20, "Alias too long for secure buffer")
    .regex(/^[a-zA-Z0-9_]+$/, "Only alphanumeric and underscores allowed"),
});
