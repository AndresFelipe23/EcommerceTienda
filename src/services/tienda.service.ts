import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { ApiResponse } from '../types/api.types';

export interface Tienda {
  tieId: string;
  nombre: string;
  descripcion?: string;
  dominio?: string;
  logoUrl?: string;
  activo: boolean;
}

export const tiendaService = {
  /**
   * Obtener información de la tienda actual (resuelta por dominio)
   * Nota: El backend resuelve la tienda automáticamente por dominio
   * Este método intenta obtener la tienda desde el dominio actual
   */
  async obtenerActual(): Promise<ApiResponse<Tienda>> {
    // Intentar obtener la tienda por dominio actual
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Remover www. si está presente
      const dominio = hostname.replace(/^www\./, '');
      
      // Solo intentar por dominio si no es localhost (para evitar errores 404 innecesarios)
      if (dominio !== 'localhost' && dominio !== '127.0.0.1') {
        try {
          const response = await apiService.get<Tienda>(API_ENDPOINTS.tiendas.obtenerPorDominio(dominio));
          if (response.exito && response.datos) {
            return response;
          }
        } catch (err) {
          // No se pudo obtener tienda por dominio, continuar con fallback
        }
      }
    }
    
    // Fallback: obtener todas las tiendas activas y usar la primera
    // (útil para desarrollo local)
    const response = await apiService.get<Tienda[]>(API_ENDPOINTS.tiendas.activas);
    
    if (response.exito && response.datos && response.datos.length > 0) {
      // Retornar la primera tienda activa (en producción sería la resuelta por dominio)
      return {
        exito: true,
        datos: response.datos[0],
      };
    }
    
    return {
      exito: false,
      mensaje: 'No se pudo obtener la tienda actual',
    };
  },
};
