import type { PetFormValues } from "../schemas/pet.schema";
import type { PetPhoto } from "@/types/pet";

/**
 * Converte PetFormValues em FormData para POST /pets.
 * Create: campos opcionais vazios sao omitidos.
 */
export function buildCreatePetFormData(values: PetFormValues): FormData {
  const fd = new FormData();

  fd.append("name", values.name);
  fd.append("species", values.species);
  fd.append("size", values.size);
  fd.append("sex", values.sex);

  if (values.breedId !== null) {
    fd.append("breed_id", String(values.breedId));
  }
  if (values.secondaryBreedId !== null) {
    fd.append("secondary_breed_id", String(values.secondaryBreedId));
  }
  if (values.breedDescription) {
    fd.append("breed_description", values.breedDescription);
  }
  if (values.primaryColor) {
    fd.append("primary_color", values.primaryColor);
  }
  if (values.notes) {
    fd.append("notes", values.notes);
  }

  for (const id of values.characteristicIds) {
    fd.append("characteristic_ids[]", String(id));
  }

  for (const photo of values.photos) {
    if (photo.local) {
      fd.append("photos[]", {
        uri: photo.local.uri,
        type: photo.local.mimeType,
        name: photo.local.fileName,
      } as unknown as Blob);
    }
  }

  return fd;
}

/**
 * Converte PetFormValues em FormData para PUT /pets/{id}.
 * Update: campos escalares sao SEMPRE enviados (omitir = backend seta null).
 * Campos relacionais seguem regras especificas.
 */
export function buildUpdatePetFormData(
  values: PetFormValues,
  originalPhotos: PetPhoto[],
): FormData {
  const fd = new FormData();

  // Campos escalares — sempre enviados no update
  fd.append("name", values.name);
  fd.append("species", values.species);
  fd.append("size", values.size);
  fd.append("sex", values.sex);

  // IDs nullable: enviar "" quando null (Laravel ConvertEmptyStringsToNull → null)
  fd.append("breed_id", values.breedId !== null ? String(values.breedId) : "");
  fd.append(
    "secondary_breed_id",
    values.secondaryBreedId !== null ? String(values.secondaryBreedId) : "",
  );

  // Strings opcionais: enviar "" quando vazio (middleware converte para null)
  fd.append("breed_description", values.breedDescription);
  fd.append("primary_color", values.primaryColor);
  fd.append("notes", values.notes);

  // characteristic_ids: SEMPRE enviar (mesmo vazio = sync([]) = limpar todas)
  // Se vazio, enviar ao menos um campo vazio para que $request->has() retorne true
  if (values.characteristicIds.length > 0) {
    for (const id of values.characteristicIds) {
      fd.append("characteristic_ids[]", String(id));
    }
  } else {
    // Enviar campo presente mas vazio para triggerar sync([])
    fd.append("characteristic_ids", "");
  }

  // Fotos: derivar new_photos e delete_photo_ids comparando com originais
  const currentExistingIds = new Set(
    values.photos
      .filter((p) => p.existing)
      .map((p) => p.existing!.id),
  );

  const originalIds = new Set(originalPhotos.map((p) => p.id));

  // Fotos removidas: estavam no original mas nao estao mais
  for (const id of originalIds) {
    if (!currentExistingIds.has(id)) {
      fd.append("delete_photo_ids[]", String(id));
    }
  }

  // Fotos novas: locais que ainda nao foram enviadas
  for (const photo of values.photos) {
    if (photo.local) {
      fd.append("new_photos[]", {
        uri: photo.local.uri,
        type: photo.local.mimeType,
        name: photo.local.fileName,
      } as unknown as Blob);
    }
  }

  return fd;
}
