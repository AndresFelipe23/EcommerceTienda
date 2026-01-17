import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import { apiService } from './api.service';
import type { ApiResponse } from '../types/api.types';

export interface ListaDeseo {
  lisId: string;
  usuarioId: string;
  productoId: string;
  varianteProductoId?: string;
  producto?: {
    proId: string;
    nombre: string;
    descripcionCorta?: string;
    sku: string;
    slug: string;
    precioBase: number;
    precioComparacion?: number;
    activo: boolean;
    imagenPrincipal?: string;
    categoriaId: string;
  };
  varianteProducto?: {
    varId: string;
    sku: string;
    precio: number;
    precioComparacion?: number;
    activo: boolean;
    productoId: string;
    productoNombre?: string;
  };
  notas?: string;
  fechaAgregado: string;
  fechaActualizacion: string;
}

export interface AgregarAListaDeseo {
  productoId: string;
  varianteProductoId?: string;
  notas?: string;
}

class ListaDeseosService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  /**
   * Obtiene el token JWT del localStorage
   */
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Construye la URL completa del endpoint
   */
  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseURL}${normalizedEndpoint}`;
  }

  /**
   * Obtener lista de deseos del usuario autenticado
   */
  async obtenerLista(): Promise<ApiResponse<ListaDeseo[]>> {
    try {
      const endpoint = API_ENDPOINTS.listaDeseos.listar;
      const token = this.getToken();

      if (!token) {
        return {
          exito: false,
          mensaje: 'Usuario no autenticado',
          errores: ['Debes iniciar sesión para ver tu lista de deseos'],
        };
      }

      const response = await apiService.get<ListaDeseo[]>(endpoint);
      return response;
    } catch (error) {
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error desconocido al obtener lista de deseos',
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }

  /**
   * Agregar producto a la lista de deseos
   */
  async agregar(dto: AgregarAListaDeseo): Promise<ApiResponse<ListaDeseo>> {
    try {
      const endpoint = API_ENDPOINTS.listaDeseos?.agregar || '/ListaDeseos';
      const token = this.getToken();

      if (!token) {
        return {
          exito: false,
          mensaje: 'Usuario no autenticado',
          errores: ['Debes iniciar sesión para agregar productos a tu lista de deseos'],
        };
      }

      const response = await apiService.post<ListaDeseo>(endpoint, dto);
      return response;
    } catch (error) {
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error desconocido al agregar a lista de deseos',
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }

  /**
   * Eliminar producto de la lista de deseos por ID
   */
  async eliminar(listaDeseoId: string): Promise<ApiResponse<boolean>> {
    try {
      const endpoint = API_ENDPOINTS.listaDeseos.eliminar(listaDeseoId);
      const token = this.getToken();

      if (!token) {
        return {
          exito: false,
          mensaje: 'Usuario no autenticado',
          errores: ['Debes iniciar sesión para eliminar productos de tu lista de deseos'],
        };
      }

      const response = await apiService.delete<boolean>(endpoint);
      return response;
    } catch (error) {
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error desconocido al eliminar de lista de deseos',
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }

  /**
   * Eliminar producto de la lista de deseos por ProductoId y VarianteProductoId
   */
  async eliminarPorProducto(productoId: string, varianteProductoId?: string): Promise<ApiResponse<boolean>> {
    try {
      const params = new URLSearchParams();
      if (varianteProductoId) {
        params.append('varianteProductoId', varianteProductoId);
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const endpoint = `/ListaDeseos/producto/${productoId}${queryString}`;
      const token = this.getToken();

      if (!token) {
        return {
          exito: false,
          mensaje: 'Usuario no autenticado',
          errores: ['Debes iniciar sesión para eliminar productos de tu lista de deseos'],
        };
      }

      const response = await apiService.delete<boolean>(endpoint);
      return response;
    } catch (error) {
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error desconocido al eliminar de lista de deseos',
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }

  /**
   * Verificar si un producto está en la lista de deseos
   */
  async verificarExiste(productoId: string, varianteProductoId?: string): Promise<ApiResponse<boolean>> {
    try {
      const params = new URLSearchParams();
      if (varianteProductoId) {
        params.append('varianteProductoId', varianteProductoId);
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const endpoint = `${API_ENDPOINTS.listaDeseos.verificar(productoId)}${queryString}`;
      const token = this.getToken();

      if (!token) {
        return {
          exito: true,
          datos: false,
        };
      }

      const response = await apiService.get<boolean>(endpoint);
      return response;
    } catch (error) {
      return {
        exito: true,
        datos: false,
      };
    }
  }
}

// Exportar instancia singleton
export const listaDeseosService = new ListaDeseosService();
