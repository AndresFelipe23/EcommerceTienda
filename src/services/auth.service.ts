import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { ApiResponse } from '../types/api.types';

export interface LoginRequest {
  email: string;
  contrasena: string;
}

export interface LoginResponse {
  token: string;
  expiracion: string;
  usuario: {
    usuId: string;
    nombre: string;
    apellido?: string;
    email: string;
    rol: string;
    tiendaId?: string;
  };
}

export interface RegisterRequest {
  nombre: string;
  apellido?: string;
  email: string;
  contrasena: string;
  confirmarContrasena: string;
  telefono?: string;
  tiendaId?: string;
}

export interface Usuario {
  usuId: string;
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  rol: string;
  activo: boolean;
  tiendaId?: string;
}

export const authService = {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiService.post<LoginResponse>(API_ENDPOINTS.auth.login, credentials);
    
    if (response.exito && response.datos?.token) {
      // Guardar token y usuario
      apiService.setToken(response.datos.token);
      localStorage.setItem('usuario', JSON.stringify(response.datos.usuario));
    }
    
    return response;
  },

  /**
   * Registrar nuevo usuario
   */
  async registro(data: RegisterRequest): Promise<ApiResponse<any>> {
    return apiService.post<any>(API_ENDPOINTS.auth.registro, data);
  },

  /**
   * Obtener perfil del usuario autenticado
   */
  async obtenerPerfil(): Promise<ApiResponse<Usuario>> {
    return apiService.get<Usuario>(API_ENDPOINTS.auth.perfil);
  },

  /**
   * Verificar si el token es válido
   */
  async verificarToken(): Promise<ApiResponse<boolean>> {
    return apiService.get<boolean>(API_ENDPOINTS.auth.verificarToken);
  },

  /**
   * Cerrar sesión
   */
  logout(): void {
    apiService.removeToken();
  },

  /**
   * Obtener usuario del localStorage
   */
  getUsuario(): Usuario | null {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      try {
        return JSON.parse(usuarioStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Verificar si hay un usuario autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !!this.getUsuario();
  },
};
