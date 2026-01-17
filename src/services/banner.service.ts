import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { ApiResponse } from '../types/api.types';

export interface Banner {
  banId: string;
  tiendaId: string;
  titulo: string;
  descripcion?: string;
  imagenUrl: string;
  urlDestino?: string;
  tipo: string;
  posicion: string;
  orden: number;
  activo: boolean;
  fechaInicio?: string;
  fechaFin?: string;
  clics: number;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export const bannerService = {
  /**
   * Obtener banners activos de la tienda actual
   */
  async listarActivos(): Promise<ApiResponse<Banner[]>> {
    return apiService.get<Banner[]>(API_ENDPOINTS.banners.listarActivos);
  },

  /**
   * Obtener banners vigentes de la tienda actual
   */
  async listarVigentes(): Promise<ApiResponse<Banner[]>> {
    return apiService.get<Banner[]>(API_ENDPOINTS.banners.listarVigentes);
  },

  /**
   * Obtener un banner por ID
   */
  async obtenerPorId(id: string): Promise<ApiResponse<Banner>> {
    return apiService.get<Banner>(API_ENDPOINTS.banners.obtener(id));
  },

  /**
   * Obtener banners por tipo
   */
  async obtenerPorTipo(tipo: string): Promise<ApiResponse<Banner[]>> {
    return apiService.get<Banner[]>(API_ENDPOINTS.banners.obtenerPorTipo(tipo));
  },

  /**
   * Obtener banners por posición
   */
  async obtenerPorPosicion(posicion: string): Promise<ApiResponse<Banner[]>> {
    return apiService.get<Banner[]>(API_ENDPOINTS.banners.obtenerPorPosicion(posicion));
  },

  /**
   * Obtener banners activos por posición
   */
  async obtenerActivosPorPosicion(posicion: string): Promise<ApiResponse<Banner[]>> {
    return apiService.get<Banner[]>(API_ENDPOINTS.banners.obtenerActivosPorPosicion(posicion));
  },

  /**
   * Incrementar contador de clics
   */
  async incrementarClics(id: string): Promise<ApiResponse<boolean>> {
    return apiService.post<boolean>(API_ENDPOINTS.banners.incrementarClics(id));
  },
};
