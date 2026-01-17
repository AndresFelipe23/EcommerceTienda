import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { ApiResponse } from '../types/api.types';

// Interfaces expandidas para productos
export interface ProductoImagen {
  // Campos del backend (PascalCase convertidos a camelCase)
  imaId?: string; // ID de la imagen
  proImgId?: string; // Alias para compatibilidad
  productoId?: string;
  imagenUrl?: string; // URL de la imagen (nombre del backend)
  url?: string; // Alias para compatibilidad
  urlThumbnail?: string;
  textoAlternativo?: string;
  ordenVisualizacion?: number; // Orden del backend
  orden?: number; // Alias para compatibilidad
  esPrincipal?: boolean; // ImaEsPrincipal del backend
  activo?: boolean;
  fechaCreacion?: string;
}

// Interfaces para Variantes (SKUs específicos del producto)
export interface ValorAtributo {
  valId: string;
  valor: string;
  valorVisualizacion: string;
  codigoColor?: string;
  ordenVisualizacion: number;
  atributoProductoId: string;
  atributoNombre?: string;
}

export interface VarianteProducto {
  varId: string;
  sku: string;
  codigoBarras?: string;
  precio: number;
  precioComparacion?: number;
  costo?: number;
  peso?: number;
  activo: boolean;
  productoId: string;
  productoNombre?: string;
  stockDisponible?: number;
  valoresAtributos?: ValorAtributo[];
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

// Interfaces para Atributos (Opciones seleccionables)
export interface ValorAtributoDto {
  valId: string;
  valor: string;
  valorVisualizacion: string;
  codigoColor?: string;
  ordenVisualizacion: number;
}

export interface ProductoAtributo {
  atriId: string;
  nombre: string;
  nombreVisualizacion: string;
  tipo: string;
  requerido: boolean;
  ordenVisualizacion: number;
  tiendaId: string;
  categoriaId?: string;
  categoriaNombre?: string;
  fechaCreacion?: string;
  valores?: ValorAtributoDto[];
}

export interface Producto {
  proId: string;
  nombre: string;
  descripcion?: string;
  descripcionCorta?: string;
  sku: string;
  slug: string;
  precioBase: number;
  precioComparacion?: number;
  activo: boolean;
  rastrearInventario: boolean;
  imagenPrincipal?: string;
  categoriaId: string;
  categoria?: {
    catId: string;
    nombre: string;
    slug: string;
  };
  imagenes?: ProductoImagen[];
  atributos?: ProductoAtributo[];
  variantes?: VarianteProducto[];
  stock?: number;
  stockDisponible?: number;
  peso?: number;
  dimensiones?: string;
}

export interface ProductoResumen {
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
}

export interface PagedResponse<T> {
  items: T[];
  pagina: number;
  tamanoPagina: number;
  totalItems: number;
  totalPaginas: number;
}

export const productoService = {
  /**
   * Listar productos (públicos) - Usa el endpoint de buscar con filtros vacíos
   */
  async listar(pagina: number = 1, tamanoPagina: number = 20): Promise<ApiResponse<PagedResponse<ProductoResumen>>> {
    return apiService.post<PagedResponse<ProductoResumen>>(API_ENDPOINTS.productos.buscar, {
      pagina,
      tamanoPagina,
      activo: true, // Solo productos activos
    });
  },

  /**
   * Obtener un producto por ID
   */
  async obtenerPorId(id: string): Promise<ApiResponse<Producto>> {
    return apiService.get<Producto>(API_ENDPOINTS.productos.obtener(id));
  },

  /**
   * Obtener un producto por slug
   */
  async obtenerPorSlug(slug: string): Promise<ApiResponse<Producto>> {
    return apiService.get<Producto>(API_ENDPOINTS.productos.obtenerPorSlug(slug));
  },

  /**
   * Obtener productos por categoría
   */
  async obtenerPorCategoria(categoriaId: string, pagina: number = 1, tamanoPagina: number = 50): Promise<ApiResponse<PagedResponse<ProductoResumen>>> {
    return apiService.get<PagedResponse<ProductoResumen>>(`${API_ENDPOINTS.productos.obtenerPorCategoria(categoriaId)}?pagina=${pagina}&tamañoPagina=${tamanoPagina}`);
  },

  /**
   * Buscar productos
   */
  async buscar(filtros: {
    busqueda?: string;
    categoriaId?: string;
    precioMinimo?: number;
    precioMaximo?: number;
    pagina?: number;
    tamanoPagina?: number;
  }): Promise<ApiResponse<any>> {
    return apiService.post<any>(API_ENDPOINTS.productos.buscar, filtros);
  },
};
