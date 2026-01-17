import { API_ENDPOINTS } from '../config/api.config';
import { apiService } from './api.service';
import type { ApiResponse } from '../types/api.types';
import type { DireccionCreate } from './direccion.service';

export interface CrearPedidoDto {
  carritoId: string;
  metodoPagoId: string;
  direccionEnvio: DireccionCreate;
  direccionFacturacion: DireccionCreate;
  cuponId?: string;
  notas?: string;
}

export interface ItemPedido {
  itePedId: string;
  pedidoId: string;
  varianteProductoId: string;
  nombreProducto: string;
  descripcionVariante: string;
  sku?: string;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  fechaCreacion: string;
}

export interface Pedido {
  pedId: string;
  numeroPedido: string;
  estado: string;
  estadoPago: string;
  subTotal: number;
  impuestos: number;
  costoEnvio: number;
  descuentos: number;
  total: number;
  metodoPago?: string;
  metodoPagoId?: string;
  cuponId?: string;
  items: ItemPedido[];
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface PedidoResumen {
  pedId: string;
  numeroPedido: string;
  estado: string;
  estadoPago: string;
  total: number;
  fechaCreacion: string;
  totalItems: number;
}

export interface PagedResponse<T> {
  items: T[];
  paginacion: {
    pagina: number;
    tamañoPagina: number;
    totalRegistros: number;
  };
}

class PedidoService {
  /**
   * Listar pedidos del usuario autenticado
   */
  async listarMisPedidos(pagina: number = 1, tamañoPagina: number = 10): Promise<ApiResponse<PagedResponse<PedidoResumen>>> {
    try {
      const response = await apiService.get<PagedResponse<PedidoResumen>>(
        `${API_ENDPOINTS.pedidos.listar}?pagina=${pagina}&tamañoPagina=${tamañoPagina}`
      );
      return response;
    } catch (error) {
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error desconocido al obtener pedidos',
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }

  /**
   * Obtener un pedido por ID
   */
  async obtenerPorId(id: string): Promise<ApiResponse<Pedido>> {
    try {
      const response = await apiService.get<Pedido>(API_ENDPOINTS.pedidos.obtener(id));
      return response;
    } catch (error) {
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error desconocido al obtener pedido',
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }

  /**
   * Crear pedido desde el carrito
   */
  async crearDesdeCarrito(dto: CrearPedidoDto): Promise<ApiResponse<Pedido>> {
    try {
      // Convertir a PascalCase para el backend
      const dtoBackend = {
        CarritoId: dto.carritoId,
        MetodoPagoId: dto.metodoPagoId,
        DireccionEnvio: {
          DirId: dto.direccionEnvio.dirId || null,
          Nombre: dto.direccionEnvio.nombre,
          Apellido: dto.direccionEnvio.apellido,
          Calle: dto.direccionEnvio.calle,
          Ciudad: dto.direccionEnvio.ciudad,
          Estado: dto.direccionEnvio.estado,
          CodigoPostal: dto.direccionEnvio.codigoPostal,
          Pais: dto.direccionEnvio.pais,
          Telefono: dto.direccionEnvio.telefono,
          Tipo: dto.direccionEnvio.tipo,
          EsPorDefecto: dto.direccionEnvio.esPorDefecto,
        },
        DireccionFacturacion: {
          DirId: dto.direccionFacturacion.dirId || null,
          Nombre: dto.direccionFacturacion.nombre,
          Apellido: dto.direccionFacturacion.apellido,
          Calle: dto.direccionFacturacion.calle,
          Ciudad: dto.direccionFacturacion.ciudad,
          Estado: dto.direccionFacturacion.estado,
          CodigoPostal: dto.direccionFacturacion.codigoPostal,
          Pais: dto.direccionFacturacion.pais,
          Telefono: dto.direccionFacturacion.telefono,
          Tipo: dto.direccionFacturacion.tipo,
          EsPorDefecto: dto.direccionFacturacion.esPorDefecto,
        },
        CuponId: dto.cuponId || null,
        Notas: dto.notas || null,
      };

      const response = await apiService.post<Pedido>(API_ENDPOINTS.pedidos.crear, dtoBackend);
      return response;
    } catch (error) {
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error desconocido al crear pedido',
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }
}

// Exportar instancia singleton
export const pedidoService = new PedidoService();
