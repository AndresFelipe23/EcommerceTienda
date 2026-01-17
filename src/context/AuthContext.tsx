import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type { Usuario, LoginRequest } from '../services/auth.service';

interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<{ exito: boolean; mensaje?: string; errores?: string[] }>;
  registro: (data: RegisterRequest) => Promise<{ exito: boolean; mensaje?: string; errores?: string[] }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface RegisterRequest {
  nombre: string;
  apellido?: string;
  email: string;
  contrasena: string;
  confirmarContrasena: string;
  telefono?: string;
  tiendaId?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Nota: useCart no puede usarse aquí porque AuthProvider envuelve CartProvider
  // La recarga del carrito se hará desde CartContext cuando cambie isAuthenticated

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = authService.getUsuario();
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
          setUsuario(storedUser);
          
          // Verificar si el token sigue siendo válido
          try {
            const response = await authService.verificarToken();
            const isValid = response.exito && (response.datos === true || (typeof response.datos === 'object' && response.datos?.valido === true));
            if (isValid) {
              try {
                await refreshUser();
              } catch (refreshError) {
                // No se pudo refrescar el perfil
              }
            } else {
              authService.logout();
              setUsuario(null);
            }
          } catch (verifyError) {
            try {
              await refreshUser();
            } catch (profileError) {
              // Error al obtener perfil
            }
          }
        } else {
          setUsuario(null);
        }
      } catch (error) {
        setUsuario(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      if (response.exito && response.datos) {
        setUsuario(response.datos.usuario);
        await new Promise(resolve => setTimeout(resolve, 100));
        return { exito: true };
      } else {
        return {
          exito: false,
          mensaje: response.mensaje || 'Error al iniciar sesión',
          errores: response.errores,
        };
      }
    } catch (error) {
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error desconocido',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const registro = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      
      // Obtener el tiendaId de la tienda actual si no se proporcionó
      if (!data.tiendaId) {
        try {
          const { tiendaService } = await import('../services/tienda.service');
          const tiendaResponse = await tiendaService.obtenerActual();
          if (tiendaResponse.exito && tiendaResponse.datos?.tieId) {
            data.tiendaId = tiendaResponse.datos.tieId;
          }
        } catch (tiendaError) {
          // Continuar sin tiendaId si no se puede obtener
        }
      }
      
      const response = await authService.registro(data);
      
      if (response.exito) {
        return { exito: true, mensaje: 'Registro exitoso. Por favor inicia sesión.' };
      } else {
        return {
          exito: false,
          mensaje: response.mensaje || 'Error al registrar',
          errores: response.errores,
        };
      }
    } catch (error) {
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error desconocido',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
  };

  const refreshUser = async () => {
    try {
      const response = await authService.obtenerPerfil();
      if (response.exito && response.datos) {
        setUsuario(response.datos);
        localStorage.setItem('usuario', JSON.stringify(response.datos));
      }
    } catch (error) {
      // Error al actualizar usuario
    }
  };

  const value: AuthContextType = {
    usuario,
    isAuthenticated: !!usuario,
    isLoading,
    login,
    registro,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
