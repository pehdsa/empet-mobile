import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(1, "Nome obrigatorio").max(255),
    email: z.string().email("Email invalido").max(255),
    password: z
      .string()
      .min(8, "Minimo 8 caracteres")
      .regex(/[A-Z]/, "Precisa de pelo menos 1 letra maiuscula")
      .regex(/[0-9]/, "Precisa de pelo menos 1 numero")
      .regex(/[^A-Za-z0-9]/, "Precisa de pelo menos 1 caractere especial"),
    password_confirmation: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Senhas nao conferem",
    path: ["password_confirmation"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
