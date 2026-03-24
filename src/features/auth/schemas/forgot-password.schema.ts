import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalido"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
