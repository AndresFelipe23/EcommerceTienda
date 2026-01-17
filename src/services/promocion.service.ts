import { API_ENDPOINTS } from '../config/api.config';
import { apiService } from './api.service';
import type { ApiResponse } from '../types/api.types';

export interface PromocionAplicable {
  promId: string;
  nombre: string;
  tipo: string; // Porcentaje, MontoFijo, EnvioGratis, BxGx
  aplicarA: string; // "Todo", "Productos", "Categorias"
  valorDescuento: number;
  montoMaximoDescuento?: number;
  fechaFin: string;
}

export interface Promocion {
  promId: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  valorDescuento: number;
  montoMinimo?: number;
  montoMaximoDescuento?: number;
  aplicarA: string; // Todo, Productos, Categorias
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  fechaCreacion: string;
}

class PromocionService {
  /**
   * Obtiene las promociones activas para la tienda actual
   */
  async listarActivas(): Promise<ApiResponse<Promocion[]>> {
    try {
      const endpoint = API_ENDPOINTS.promociones.listarActivas;
      const response = await apiService.get<Promocion[]>(endpoint);
      return response;
    } catch (error) {
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error desconocido al obtener promociones',
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }

  /**
   * Obtiene las promociones aplicables para productos/categorías específicos
   */
  async obtenerAplicables(params: {
    productoIds?: string[];
    categoriaIds?: string[];
    montoTotal?: number;
    tiendaId?: string;
  }): Promise<ApiResponse<PromocionAplicable[]>> {
    try {
      // El endpoint usa POST, así que enviamos el body
      const body = {
        ProductoIds: params.productoIds || null,
        CategoriaIds: params.categoriaIds || null,
        MontoTotal: params.montoTotal || null,
        TiendaId: params.tiendaId || null,
      };

      const response = await apiService.post<PromocionAplicable[]>(API_ENDPOINTS.promociones.obtenerAplicables, body);
      return response;
    } catch (error) {
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error desconocido al obtener promociones aplicables',
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }

  /**
   * Obtiene una promoción por ID
   */
  async obtener(id: string): Promise<ApiResponse<Promocion>> {
    try {
      const endpoint = API_ENDPOINTS.promociones.obtener(id);
      const response = await apiService.get<Promocion>(endpoint);
      return response;
    } catch (error) {
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error desconocido al obtener promoción',
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }

  /**
   * Calcula el precio con descuento de una promoción
   */
  calcularPrecioConDescuento(precioOriginal: number, promocion: PromocionAplicable): number {
    let precioDescuento = precioOriginal;

    if (promocion.tipo === 'Porcentaje') {
      const descuento = precioOriginal * (promocion.valorDescuento / 100);
      const descuentoFinal = promocion.montoMaximoDescuento 
        ? Math.min(descuento, promocion.montoMaximoDescuento)
        : descuento;
      precioDescuento = precioOriginal - descuentoFinal;
    } else if (promocion.tipo === 'MontoFijo') {
      precioDescuento = Math.max(0, precioOriginal - promocion.valorDescuento);
    }

    return Math.max(0, precioDescuento);
  }

  /**
   * Obtiene la mejor promoción aplicable para un producto
   */
  async obtenerMejorPromocionParaProducto(productoId: string, categoriaId: string, precioBase: number): Promise<PromocionAplicable | null> {
    try {
      const response = await this.obtenerAplicables({
        productoIds: [productoId],
        categoriaIds: [categoriaId],
      });

      if (!response.exito || !response.datos || response.datos.length === 0) {
        return null;
      }

      // Filtrar promociones: excluir "Todo" ya que solo aplican al carrito completo, no a productos individuales
      const promocionesAplicables = response.datos.filter(p => 
        p.aplicarA !== 'Todo' && 
        (p.tipo === 'Porcentaje' || p.tipo === 'MontoFijo')
      );

      if (promocionesAplicables.length === 0) {
        return null;
      }

      // Obtener la promoción que da mayor descuento
      let mejorPromocion: PromocionAplicable | null = null;
      let mayorDescuento = 0;

      for (const promocion of promocionesAplicables) {
        const precioConDescuento = this.calcularPrecioConDescuento(precioBase, promocion);
        const descuento = precioBase - precioConDescuento;

        if (descuento > mayorDescuento) {
          mayorDescuento = descuento;
          mejorPromocion = promocion;
        }
      }

      return mejorPromocion;
    } catch (error) {
      return null;
    }
  }
}

// Exportar instancia singleton
export const promocionService = new PromocionService();
