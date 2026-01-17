/**
 * Tipos TypeScript para las respuestas de la API
 */

/**
 * Respuesta estándar de la API
 */
export interface ApiResponse<T = any> {
  exito: boolean;
  mensaje?: string;
  datos?: T;
  errores?: string[];
}

/**
 * Respuesta paginada
 */
export interface PagedResponse<T> {
  items: T[];
  pagina: number;
  tamanoPagina: number;
  totalItems: number;
  totalPaginas: number;
}
