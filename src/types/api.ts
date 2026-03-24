/** Links de navegacao da paginacao */
export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

/** Metadados de paginacao (snake_case — padrao Laravel) */
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
  path: string;
}

/** Envelope de resposta paginada do Laravel */
export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

/** Erro de validacao 422 */
export interface ValidationError {
  message: string;
  errors: Record<string, string[]>;
}

/** Message resource padrao */
export interface MessageResponse {
  message: string;
}

/** Envelope generico de JsonResource do Laravel */
export interface ResourceResponse<T> {
  data: T;
}
