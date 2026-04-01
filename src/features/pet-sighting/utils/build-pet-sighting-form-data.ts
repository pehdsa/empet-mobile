import type { PetSightingFormValues } from "../schemas/pet-sighting.schema";

/**
 * Converte PetSightingFormValues em FormData para POST /pet-sightings.
 * Campos opcionais vazios sao omitidos.
 */
export function buildPetSightingFormData(values: PetSightingFormValues): FormData {
  const fd = new FormData();

  fd.append("title", values.title);
  fd.append("sighted_at", values.sightedAt.toISOString());
  fd.append("species", values.species);
  fd.append("latitude", String(values.latitude));
  fd.append("longitude", String(values.longitude));
  fd.append("share_phone", values.sharePhone ? "1" : "0");

  if (values.size) {
    fd.append("size", values.size);
  }
  if (values.sex) {
    fd.append("sex", values.sex);
  }
  if (values.color) {
    fd.append("color", values.color);
  }
  if (values.breedId !== null) {
    fd.append("breed_id", String(values.breedId));
  }
  if (values.addressHint) {
    fd.append("address_hint", values.addressHint);
  }
  if (values.description) {
    fd.append("description", values.description);
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
