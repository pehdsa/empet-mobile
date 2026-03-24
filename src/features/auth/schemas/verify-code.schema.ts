import { z } from "zod";

export const verifyCodeSchema = z.object({
  email: z.string().email("Email invalido"),
  code: z.string().length(6, "Codigo deve ter 6 digitos"),
});

export type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;
