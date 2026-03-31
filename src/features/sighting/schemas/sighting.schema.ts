import { z } from "zod";

export const sightingSchema = z.object({
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
  sightedAt: z
    .date({ error: "Data do avistamento é obrigatória" })
    .refine((d) => d <= new Date(), "Data não pode ser no futuro"),
  sharePhone: z.boolean(),
});

export type SightingFormValues = z.infer<typeof sightingSchema>;
