import { z } from "zod";

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

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

export const petSchema = z.object({
  name: z.string().min(1, "Nome obrigatorio").max(255, "Maximo 255 caracteres"),
  species: z.enum(["DOG", "CAT"], { message: "Selecione a especie" }),
  size: z.enum(["SMALL", "MEDIUM", "LARGE"], { message: "Selecione o porte" }),
  sex: z.enum(["MALE", "FEMALE", "UNKNOWN"], { message: "Selecione o sexo" }),
  breedId: z.number().nullable(),
  secondaryBreedId: z.number().nullable(),
  breedDescription: z.string().max(255),
  primaryColor: z.string().max(100),
  notes: z.string().max(1000, "Maximo 1000 caracteres"),
  characteristicIds: z.array(z.number()),
  photos: z.array(photoFormItemSchema).max(MAX_PHOTOS, `Maximo ${MAX_PHOTOS} fotos`),
});

export type PetFormValues = z.infer<typeof petSchema>;

export { MAX_PHOTOS, MAX_PHOTO_SIZE_BYTES };
