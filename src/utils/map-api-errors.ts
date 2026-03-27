import type { AxiosError } from "axios";
import type { UseFormSetError, FieldValues, Path } from "react-hook-form";
import type { ValidationError } from "@/types/api";

/**
 * Mapeia erros de validacao 422 do Laravel para campos do react-hook-form.
 * Suporta aliases para quando nomes de campos divergem entre backend e form.
 */
export function mapApiErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: AxiosError<ValidationError>,
  aliases?: Record<string, Path<T>>,
): void {
  const errors = error.response?.data?.errors;
  if (!errors) return;

  for (const [field, messages] of Object.entries(errors)) {
    const formField = aliases?.[field] ?? (field as Path<T>);
    setError(formField, { message: messages[0] });
  }
}
