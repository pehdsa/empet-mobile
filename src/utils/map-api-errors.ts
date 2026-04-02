import type { AxiosError } from "axios";
import type { UseFormSetError, FieldValues, Path } from "react-hook-form";
import type { ValidationError } from "@/types/api";

/**
 * Mapeia erros de validacao 422 do Laravel para campos do react-hook-form.
 * Retorna mensagens de erros que nao mapearam para nenhum campo do form.
 */
export function mapApiErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: AxiosError<ValidationError>,
  aliases?: Record<string, Path<T>>,
): string[] {
  const data = error.response?.data as (ValidationError & { message?: string }) | undefined;
  const errors = data?.errors;

  if (!errors) {
    return data?.message ? [data.message] : [];
  }

  const unhandled: string[] = [];

  for (const [field, messages] of Object.entries(errors)) {
    const formField = aliases?.[field] ?? (field as string);
    const isKnown = aliases
      ? field in aliases || Object.values(aliases).includes(formField as Path<T>)
      : true;

    if (isKnown) {
      setError(formField as Path<T>, { message: messages[0] });
    } else {
      unhandled.push(messages[0]);
    }
  }

  return unhandled;
}
