import { API_CONFIG } from '../config/api.config';
import type { ApiResponse } from '../types/api.types';

/**
 * Cliente HTTP para comunicarse con la API
 */
class ApiService {
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
   * Guarda el token JWT en localStorage
   */
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Elimina el token JWT del localStorage
   */
  removeToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  /**
   * Construye la URL completa del endpoint
   */
  private buildUrl(endpoint: string): string {
    // Si el endpoint ya incluye la base URL, retornarlo tal cual
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    // Asegurar que el endpoint comience con /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseURL}${normalizedEndpoint}`;
  }

  /**
   * Convierte un objeto de PascalCase a camelCase recursivamente
   */
  private convertToCamelCase(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.convertToCamelCase(item));
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    const converted: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Convertir a camelCase, manejando acrónimos como SKU, ID, etc.
        let camelKey: string;
        
        // Si la clave es un acrónimo completamente en mayúsculas (ej: SKU, ID), convertir a minúsculas
        if (key === key.toUpperCase() && key.length <= 5) {
          camelKey = key.toLowerCase();
        } else {
          // Convertir primera letra a minúscula
          camelKey = key.charAt(0).toLowerCase() + key.slice(1);
        }
        
        // Caso especial: Items -> items (para PagedResponseDto)
        if (key === 'Items') {
          camelKey = 'items';
        }
        // Caso especial: Paginacion -> paginacion
        if (key === 'Paginacion') {
          camelKey = 'paginacion';
        }
        // Caso especial: SubCategorias -> subCategorias
        if (key === 'SubCategorias') {
          camelKey = 'subCategorias';
        }
        // Caso especial: CategoriaPadre -> categoriaPadre
        if (key === 'CategoriaPadre') {
          camelKey = 'categoriaPadre';
        }
        // Caso especial: ConfiguracionJson -> configuracionJson
        if (key === 'ConfiguracionJson') {
          camelKey = 'configuracionJson';
        }
        
        const convertedValue = this.convertToCamelCase(obj[key]);
        
        // Casos especiales: si es ImagenUrl, también agregarlo como 'url' para compatibilidad
        if (key === 'ImagenUrl') {
          converted[camelKey] = convertedValue; // imagenUrl
          converted.url = convertedValue; // url (alias para compatibilidad)
        } else {
          converted[camelKey] = convertedValue;
        }
      }
    }
    return converted;
  }

  /**
   * Realiza una petición HTTP
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const token = this.getToken();

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Agregar token si existe
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      credentials: 'include', // Incluir cookies en las peticiones
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Si la respuesta no es JSON, lanzar error
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        // Si la respuesta está vacía pero es exitosa
        return {
          exito: response.ok,
          mensaje: response.statusText,
        } as ApiResponse<T>;
      }

      const rawData: any = await response.json();
      
      // Manejar errores de validación de ASP.NET Core (RFC 9110)
      if (rawData.type === 'https://tools.ietf.org/html/rfc9110#section-15.5.1' || rawData.title === 'One or more validation errors occurred.') {
        const errores: string[] = [];
        if (rawData.errors) {
          // Los errores vienen en formato { "Campo": ["Error1", "Error2"] }
          Object.keys(rawData.errors).forEach((campo) => {
            const mensajes = rawData.errors[campo];
            if (Array.isArray(mensajes)) {
              mensajes.forEach((msg: string) => {
                errores.push(`${campo}: ${msg}`);
              });
            } else {
              errores.push(`${campo}: ${mensajes}`);
            }
          });
        }
        
        return {
          exito: false,
          mensaje: rawData.title || 'Error de validación',
          datos: undefined,
          errores: errores.length > 0 ? errores : [rawData.title || 'Error de validación'],
        };
      }
      
      // Convertir PascalCase a camelCase
      // El backend devuelve: Exito, Mensaje, Datos, Errores
      // El frontend espera: exito, mensaje, datos, errores
      const data: ApiResponse<T> = {
        exito: rawData.Exito ?? rawData.exito ?? false,
        mensaje: rawData.Mensaje ?? rawData.mensaje ?? (response.ok ? undefined : 'Error desconocido'),
        datos: rawData.Datos ? this.convertToCamelCase(rawData.Datos) : (rawData.datos ?? undefined),
        errores: rawData.Errores ?? rawData.errores ?? (rawData.Errores ? [] : undefined),
      };
      
      // Si hay errores en el array, asegurarse de que se conviertan correctamente
      if (rawData.Errores && Array.isArray(rawData.Errores)) {
        data.errores = rawData.Errores;
      }

      // Si es un error 401, manejar según el caso
      if (response.status === 401) {
        const token = this.getToken();
        if (token) {
          // Hay token pero es inválido, limpiarlo
          this.removeToken();
        }
        // No forzar redirección aquí - dejar que el AuthContext maneje esto
        // Esto previene recargas de página innecesarias
      }

      return data;
    } catch (error) {
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error desconocido',
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();
