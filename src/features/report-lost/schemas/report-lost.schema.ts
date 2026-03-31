import { z } from "zod";

export const reportLostSchema = z.object({
  addressHint: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(2000, "Máximo 2000 caracteres")
    .optional()
    .or(z.literal("")),
  lostAt: z
    .date({ error: "Data da perda é obrigatória" })
    .refine((d) => d <= new Date(), "Data não pode ser no futuro"),
});

export type ReportLostFormValues = z.infer<typeof reportLostSchema>;
