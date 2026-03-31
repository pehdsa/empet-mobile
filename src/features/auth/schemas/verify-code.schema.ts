import { z } from "zod";

export const verifyCodeSchema = z.object({
  email: z.string().email("Email inválido"),
  code: z.string().length(6, "Código deve ter 6 dígitos"),
});

export type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;
