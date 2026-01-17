import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { ApiResponse } from '../types/api.types';

export interface Direccion {
  dirId?: string;
  usuarioId?: string;
  nombre: string;
  apellido?: string;
  calle: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  pais?: string;
  telefono?: string;
  tipo?: string;
  esPorDefecto?: boolean;
  fechaCreacion?: string;
}

export interface DireccionCreate {
  dirId?: string;
  nombre: string;
  apellido?: string;
  calle: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  pais?: string;
  telefono?: string;
  tipo?: string;
  esPorDefecto?: boolean;
}

export interface DireccionUpdate {
  nombre?: string;
  apellido?: string;
  calle?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  pais?: string;
  telefono?: string;
  tipo?: string;
  esPorDefecto?: boolean;
  dirId: string;
}

class DireccionService {
  /**
   * Obtener todas las direcciones del usuario autenticado
   */
  async listar(): Promise<ApiResponse<Direccion[]>> {
    const response = await apiService.get<any>(API_ENDPOINTS.direcciones.listar);
    // El backend devuelve ApiResponseDto<IEnumerable<DireccionDto>>
    // Necesitamos convertir la respuesta
    if (response.exito && response.datos) {
      return {
        exito: response.exito,
        mensaje: response.mensaje,
        datos: Array.isArray(response.datos) ? response.datos : [],
        errores: response.errores,
      };
    }
    return {
      exito: false,
      mensaje: response.mensaje || 'Error al obtener direcciones',
      datos: [],
      errores: response.errores,
    };
  }

  /**
   * Obtener una dirección por ID
   */
  async obtener(id: string): Promise<ApiResponse<Direccion>> {
    return apiService.get<Direccion>(API_ENDPOINTS.direcciones.obtener(id));
  }

  /**
   * Crear una nueva dirección
   */
  async crear(data: DireccionCreate): Promise<ApiResponse<Direccion>> {
    return apiService.post<Direccion>(API_ENDPOINTS.direcciones.crear, data);
  }

  /**
   * Actualizar una dirección existente
   */
  async actualizar(data: DireccionUpdate): Promise<ApiResponse<Direccion>> {
    const { dirId, ...updateData } = data;
    return apiService.put<Direccion>(API_ENDPOINTS.direcciones.actualizar(dirId), updateData);
  }

  /**
   * Eliminar una dirección
   */
  async eliminar(id: string): Promise<ApiResponse<boolean>> {
    return apiService.delete<boolean>(API_ENDPOINTS.direcciones.eliminar(id));
  }
}

export const direccionService = new DireccionService();
