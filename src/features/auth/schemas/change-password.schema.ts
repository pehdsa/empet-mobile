import { z } from "zod";

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Senha atual obrigatória"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Precisa de pelo menos 1 letra maiúscula")
      .regex(/[0-9]/, "Precisa de pelo menos 1 número")
      .regex(/[^A-Za-z0-9]/, "Precisa de pelo menos 1 caractere especial"),
    password_confirmation: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Senhas não conferem",
    path: ["password_confirmation"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
