import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { ApiResponse } from '../types/api.types';

// Interfaces para el carrito
export interface ValorAtributo {
  valId: string;
  valor: string;
  valorVisualizacion: string;
  codigoColor?: string;
  ordenVisualizacion: number;
  atributoProductoId: string;
  atributoNombre?: string;
}

export interface ItemCarrito {
  iteId: string;
  carritoComprasId: string;
  varianteProductoId: string;
  varianteProducto?: {
    varId: string;
    sku: string;
    precio: number;
    stockDisponible?: number;
    valoresAtributos?: ValorAtributo[];
  };
  producto?: {
    proId: string;
    nombre: string;
    slug: string;
    imagenPrincipal?: string;
  };
  cantidad: number;
  precio: number;
  subTotal: number;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface Cupon {
  cupId: string;
  codigo: string;
  tipo: string;
  valorDescuento: number;
  montoMinimo?: number;
  montoMaximoDescuento?: number;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

export interface CarritoCompra {
  carId: string;
  usuarioId?: string;
  sesionId?: string;
  items: ItemCarrito[];
  subTotal: number;
  descuento: number;
  total: number;
  totalItems: number;
  cuponId?: string;
  cupon?: Cupon;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CarritoResumen {
  carId: string;
  totalItems: number;
  subTotal: number;
  total: number;
}

export interface AgregarAlCarritoDto {
  varianteProductoId: string;
  cantidad: number;
}

export interface ActualizarItemCarritoDto {
  cantidad: number;
}

class CarritoService {
  /**
   * Obtener el carrito del usuario actual
   */
  async obtenerCarrito(): Promise<ApiResponse<CarritoCompra>> {
    return apiService.get<CarritoCompra>(API_ENDPOINTS.carrito.obtener);
  }

  /**
   * Obtener resumen del carrito
   */
  async obtenerResumen(): Promise<ApiResponse<CarritoResumen>> {
    return apiService.get<CarritoResumen>(API_ENDPOINTS.carrito.obtenerResumen);
  }

  /**
   * Agregar item al carrito
   */
  async agregarItem(dto: AgregarAlCarritoDto): Promise<ApiResponse<ItemCarrito>> {
    // Validar que el ID sea un GUID válido
    if (!dto.varianteProductoId || !this.isValidGuid(dto.varianteProductoId)) {
      return {
        exito: false,
        mensaje: 'El ID de la variante del producto no es válido',
        errores: ['El ID de la variante del producto debe ser un GUID válido'],
      };
    }

    // Convertir a PascalCase para el backend
    const dtoBackend = {
      VarianteProductoId: dto.varianteProductoId,
      Cantidad: dto.cantidad,
    };
    
    const response = await apiService.post<ItemCarrito>(API_ENDPOINTS.carrito.agregarItem, dtoBackend);
    
    return response;
  }

  /**
   * Valida si un string es un GUID válido
   */
  private isValidGuid(guid: string): boolean {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return guidRegex.test(guid);
  }

  /**
   * Actualizar cantidad de un item
   */
  async actualizarItem(itemId: string, dto: ActualizarItemCarritoDto): Promise<ApiResponse<ItemCarrito>> {
    // Convertir a PascalCase para el backend
    const dtoBackend = {
      Cantidad: dto.cantidad,
    };
    return apiService.put<ItemCarrito>(API_ENDPOINTS.carrito.actualizarItem(itemId), dtoBackend);
  }

  /**
   * Eliminar item del carrito
   */
  async eliminarItem(itemId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(API_ENDPOINTS.carrito.eliminarItem(itemId));
  }

  /**
   * Vaciar carrito
   */
  async vaciarCarrito(): Promise<ApiResponse<void>> {
    return apiService.delete<void>(API_ENDPOINTS.carrito.limpiar);
  }

  /**
   * Aplicar cupón al carrito
   */
  async aplicarCupon(codigo: string): Promise<ApiResponse<CarritoCompra>> {
    const dtoBackend = {
      Codigo: codigo,
    };
    return apiService.post<CarritoCompra>(API_ENDPOINTS.carrito.aplicarCupon, dtoBackend);
  }

  /**
   * Remover cupón del carrito
   */
  async removerCupon(): Promise<ApiResponse<CarritoCompra>> {
    return apiService.delete<CarritoCompra>(API_ENDPOINTS.carrito.removerCupon);
  }
}

export const carritoService = new CarritoService();
