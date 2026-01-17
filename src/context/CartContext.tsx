import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { carritoService, type CarritoCompra, type ItemCarrito, type AgregarAlCarritoDto } from '../services/carrito.service';
import { useAuth } from './AuthContext';

interface CartContextType {
  carrito: CarritoCompra | null;
  totalItems: number;
  isLoading: boolean;
  agregarAlCarrito: (dto: AgregarAlCarritoDto) => Promise<boolean>;
  actualizarCantidad: (itemId: string, cantidad: number) => Promise<boolean>;
  eliminarItem: (itemId: string) => Promise<boolean>;
  vaciarCarrito: () => Promise<boolean>;
  aplicarCupon: (codigo: string) => Promise<{ exito: boolean; mensaje?: string }>;
  removerCupon: () => Promise<boolean>;
  recargarCarrito: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [carrito, setCarrito] = useState<CarritoCompra | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Cargar carrito (memoizado para evitar loops infinitos)
  const cargarCarrito = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await carritoService.obtenerCarrito();
      if (response.exito && response.datos) {
        setCarrito(response.datos);
      } else {
        setCarrito(null);
      }
    } catch (error) {
      setCarrito(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Recargar carrito (memoizado para evitar loops infinitos)
  const recargarCarrito = useCallback(async () => {
    await cargarCarrito();
  }, [cargarCarrito]);

  // Agregar al carrito
  const agregarAlCarrito = async (dto: AgregarAlCarritoDto): Promise<boolean> => {
    try {
      const response = await carritoService.agregarItem(dto);

      if (response.exito) {
        // Recargar carrito completo al agregar (es más seguro)
        await cargarCarrito();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  // Actualizar cantidad
  const actualizarCantidad = async (itemId: string, cantidad: number): Promise<boolean> => {
    try {
      const response = await carritoService.actualizarItem(itemId, { cantidad });

      if (response.exito && response.datos) {
        // En lugar de recargar todo el carrito, actualizar solo el item modificado
        if (carrito) {
          const itemsActualizados = carrito.items.map(item =>
            item.iteId === itemId
              ? { ...item, cantidad, subTotal: item.precio * cantidad }
              : item
          );

          // Recalcular totales
          const nuevoSubTotal = itemsActualizados.reduce((sum, item) => sum + item.subTotal, 0);
          const nuevoTotal = nuevoSubTotal - (carrito.descuento || 0);
          const nuevoTotalItems = itemsActualizados.reduce((sum, item) => sum + item.cantidad, 0);

          setCarrito({
            ...carrito,
            items: itemsActualizados,
            subTotal: nuevoSubTotal,
            total: nuevoTotal,
            totalItems: nuevoTotalItems,
          });
        }

        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  // Eliminar item
  const eliminarItem = async (itemId: string): Promise<boolean> => {
    try {
      const response = await carritoService.eliminarItem(itemId);

      if (response.exito) {
        // Actualizar el carrito localmente en lugar de recargarlo
        if (carrito) {
          const itemsActualizados = carrito.items.filter(item => item.iteId !== itemId);

          // Si no quedan items, vaciar el carrito
          if (itemsActualizados.length === 0) {
            setCarrito(null);
          } else {
            // Recalcular totales
            const nuevoSubTotal = itemsActualizados.reduce((sum, item) => sum + item.subTotal, 0);
            const nuevoTotal = nuevoSubTotal - (carrito.descuento || 0);
            const nuevoTotalItems = itemsActualizados.reduce((sum, item) => sum + item.cantidad, 0);

            setCarrito({
              ...carrito,
              items: itemsActualizados,
              subTotal: nuevoSubTotal,
              total: nuevoTotal,
              totalItems: nuevoTotalItems,
            });
          }
        }

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // Vaciar carrito
  const vaciarCarrito = async (): Promise<boolean> => {
    try {
      const response = await carritoService.vaciarCarrito();
      if (response.exito) {
        setCarrito(null);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // Aplicar cupón
  const aplicarCupon = async (codigo: string): Promise<{ exito: boolean; mensaje?: string }> => {
    try {
      const response = await carritoService.aplicarCupon(codigo);
      if (response.exito && response.datos) {
        setCarrito(response.datos);
        return { exito: true };
      }
      return { exito: false, mensaje: response.mensaje || 'Cupón no válido' };
    } catch (error) {
      return { exito: false, mensaje: 'Error al aplicar el cupón' };
    }
  };

  // Remover cupón
  const removerCupon = async (): Promise<boolean> => {
    try {
      const response = await carritoService.removerCupon();
      if (response.exito && response.datos) {
        setCarrito(response.datos);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // Calcular total de items
  const totalItems = carrito?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;

  // Cargar carrito al montar y cuando cambia la autenticación
  useEffect(() => {
    cargarCarrito();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <CartContext.Provider
      value={{
        carrito,
        totalItems,
        isLoading,
        agregarAlCarrito,
        actualizarCantidad,
        eliminarItem,
        vaciarCarrito,
        aplicarCupon,
        removerCupon,
        recargarCarrito,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
}
