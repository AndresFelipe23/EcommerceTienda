import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { ApiResponse } from '../types/api.types';

// Tipos básicos para categorías
export interface Categoria {
  catId: string;
  nombre: string;
  descripcion?: string;
  slug: string;
  imagenUrl?: string;
  activo: boolean;
  categoriaPadreId?: string;
  subCategorias?: Categoria[];
}

export interface CategoriaArbol {
  catId: string;
  nombre: string;
  slug: string;
  imagenUrl?: string;
  activo: boolean;
  subCategorias?: CategoriaArbol[];
}

export const categoriaService = {
  /**
   * Obtener una categoría por ID
   */
  async obtenerPorId(id: string): Promise<ApiResponse<Categoria>> {
    return apiService.get<Categoria>(API_ENDPOINTS.categorias.obtener(id));
  },

  /**
   * Obtener una categoría por slug
   * Nota: Requiere tiendaId como query parameter, pero el middleware lo resuelve por dominio
   */
  async obtenerPorSlug(slug: string, tiendaId?: string): Promise<ApiResponse<Categoria>> {
    const endpoint = tiendaId 
      ? `${API_ENDPOINTS.categorias.obtenerPorSlug(slug)}?tiendaId=${tiendaId}`
      : API_ENDPOINTS.categorias.obtenerPorSlug(slug);
    return apiService.get<Categoria>(endpoint);
  },

  /**
   * Obtener árbol completo de categorías
   * Nota: Requiere tiendaId, pero el middleware lo resuelve por dominio
   * Por ahora, intentamos obtenerlo del contexto o usamos un endpoint alternativo
   */
  async obtenerArbol(tiendaId?: string): Promise<ApiResponse<CategoriaArbol[]>> {
    // Si no tenemos tiendaId, intentamos obtener categorías de otra forma
    // Por ahora, retornamos error si no se proporciona
    if (!tiendaId) {
      return {
        exito: false,
        mensaje: 'Se requiere tiendaId para obtener el árbol de categorías',
      };
    }
    return apiService.get<CategoriaArbol[]>(API_ENDPOINTS.categorias.obtenerArbol(tiendaId));
  },
};
