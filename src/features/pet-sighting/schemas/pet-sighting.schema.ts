import { z } from "zod";

const MAX_PHOTOS = 3;

const photoFormItemSchema = z.object({
  id: z.string(),
  existing: z
    .object({
      id: z.number(),
      url: z.string(),
      position: z.number(),
    })
    .optional(),
  local: z
    .object({
      uri: z.string(),
      mimeType: z.string(),
      fileName: z.string(),
    })
    .optional(),
});

export const petSightingSchema = z.object({
  title: z.string().min(1, "Título obrigatório").max(255, "Máximo 255 caracteres"),
  sightedAt: z.date({ error: "Data obrigatória" }).refine(
    (d) => d <= new Date(),
    "Data não pode ser no futuro",
  ),
  species: z.enum(["DOG", "CAT"], { message: "Selecione a espécie" }),
  size: z.enum(["SMALL", "MEDIUM", "LARGE"]).nullable(),
  sex: z.enum(["MALE", "FEMALE", "UNKNOWN"]).nullable(),
  color: z.string().max(100).optional().or(z.literal("")),
  breedId: z.number().nullable(),
  addressHint: z.string().max(500).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  sharePhone: z.boolean(),
  characteristicIds: z.array(z.number()),
  photos: z
    .array(photoFormItemSchema)
    .max(MAX_PHOTOS, `Máximo ${MAX_PHOTOS} fotos`),
  latitude: z.number({ error: "Localização obrigatória" }),
  longitude: z.number({ error: "Localização obrigatória" }),
});

export type PetSightingFormValues = z.infer<typeof petSightingSchema>;

export { MAX_PHOTOS as MAX_SIGHTING_PHOTOS };
