import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import { apiService } from './api.service';
import type { ApiResponse } from '../types/api.types';

export interface MetodoPago {
  metId: string;
  nombre: string;
  tipo: string;
  descripcion?: string;
  iconoUrl?: string;
  comisionPorcentaje?: number;
  comisionFija?: number;
  activo: boolean;
  tiendaId: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface MetodoPagoDisponible {
  metId: string;
  nombre: string;
  tipo: string;
  iconoUrl?: string;
  comisionPorcentaje?: number;
  comisionFija?: number;
}

class MetodoPagoService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  /**
   * Obtiene los métodos de pago disponibles (activos) para la tienda actual
   */
  async obtenerDisponibles(): Promise<ApiResponse<MetodoPagoDisponible[]>> {
    try {
      const endpoint = API_ENDPOINTS.metodosPago.listarDisponibles;
      const response = await apiService.get<MetodoPagoDisponible[]>(endpoint);
      return response;
    } catch (error) {
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error desconocido al obtener métodos de pago',
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }

  /**
   * Obtiene un método de pago por ID
   */
  async obtenerPorId(id: string): Promise<ApiResponse<MetodoPago>> {
    try {
      const endpoint = API_ENDPOINTS.metodosPago.obtener(id);
      const response = await apiService.get<MetodoPago>(endpoint);
      return response;
    } catch (error) {
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error desconocido al obtener método de pago',
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }
}

// Exportar instancia singleton
export const metodoPagoService = new MetodoPagoService();
