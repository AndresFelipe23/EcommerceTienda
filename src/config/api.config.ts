// Configuración de la API
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5087/api',
  timeout: 30000, // 30 segundos
};

// Validar que la URL de la API esté configurada
// Si no está configurada, se usa el valor por defecto

// Endpoints para el frontend de la tienda (clientes)
export const API_ENDPOINTS = {
  // Autenticación
  auth: {
    login: '/Auth/login',
    registro: '/Auth/registro',
    perfil: '/Auth/perfil',
    verificarToken: '/Auth/verificar-token',
    cambiarContrasena: '/Auth/cambiar-contrasena',
  },
  
  // Tiendas
  tiendas: {
    activas: '/Tienda/activas',
    obtener: (id: string) => `/Tienda/${id}`,
    obtenerPorDominio: (dominio: string) => `/Tienda/dominio/${dominio}`,
  },
  
  // Categorías (públicas)
  categorias: {
    obtener: (id: string) => `/Categoria/${id}`,
    obtenerPorSlug: (slug: string) => `/Categoria/slug/${slug}`,
    // Nota: El endpoint requiere tiendaId, pero el middleware lo resuelve por dominio
    // Usaremos el endpoint de buscar productos con filtros vacíos para obtener todas las categorías
    obtenerArbol: (tiendaId: string) => `/Categoria/tienda/${tiendaId}/arbol`,
  },
  
  // Productos (públicos)
  productos: {
    // No hay GET /Producto, usar buscar con filtros vacíos
    buscar: '/Producto/buscar',
    obtener: (id: string) => `/Producto/${id}`,
    obtenerPorSlug: (slug: string) => `/Producto/slug/${slug}`,
    obtenerPorCategoria: (categoriaId: string) => `/Producto/categoria/${categoriaId}`,
  },
  
  // Variantes de Producto
  variantesProducto: {
    obtener: (id: string) => `/VarianteProducto/${id}`,
    listarActivasPorProducto: (productoId: string) => `/VarianteProducto/producto/${productoId}/activas`,
  },
  
  // Carrito de Compras
  carrito: {
    obtener: '/CarritoCompra',
    obtenerResumen: '/CarritoCompra/resumen',
    agregarItem: '/CarritoCompra/items',
    actualizarItem: (itemId: string) => `/CarritoCompra/items/${itemId}`,
    eliminarItem: (itemId: string) => `/CarritoCompra/items/${itemId}`,
    limpiar: '/CarritoCompra',
    aplicarCupon: '/CarritoCompra/aplicar-cupon',
    removerCupon: '/CarritoCompra/remover-cupon',
  },
  
  // Promociones (públicas)
  promociones: {
    listarActivas: '/Promocion/activas',
    obtener: (id: string) => `/Promocion/${id}`,
    obtenerAplicables: '/Promocion/aplicables',
  },
  
  // Cupones
  cupones: {
    obtenerPorCodigo: (codigo: string) => `/Cupon/codigo/${codigo}`,
    validar: '/Cupon/validar',
  },
  
  // Pedidos
  pedidos: {
    crear: '/Pedido',
    obtener: (id: string) => `/Pedido/${id}`,
    listar: '/Pedido',
    cancelar: (id: string) => `/Pedido/${id}/cancelar`,
    rastrear: (id: string) => `/Pedido/${id}/rastrear`,
  },
  
  // Direcciones
  direcciones: {
    listar: '/Direccion',
    obtener: (id: string) => `/Direccion/${id}`,
    crear: '/Direccion',
    actualizar: (id: string) => `/Direccion/${id}`,
    eliminar: (id: string) => `/Direccion/${id}`,
  },
  
  // Lista de Deseos
  listaDeseos: {
    listar: '/ListaDeseos',
    agregar: '/ListaDeseos',
    eliminar: (id: string) => `/ListaDeseos/${id}`,
    eliminarPorProducto: (productoId: string) => `/ListaDeseos/producto/${productoId}`,
    verificar: (productoId: string) => `/ListaDeseos/verificar/${productoId}`,
  },
  
  // Configuraciones (públicas - solo lectura)
  configuraciones: {
    obtenerPorClave: (clave: string) => `/Configuracion/clave/${clave}`,
    obtenerPorCategoria: (categoria: string) => `/Configuracion/categoria/${categoria}`,
  },
  
  // Métodos de Pago (públicos - solo activos)
  metodosPago: {
    listarDisponibles: '/MetodosPago/disponibles',
    obtener: (id: string) => `/MetodosPago/${id}`,
  },
  
  // Banners (públicos)
  banners: {
    listarActivos: '/Banner/activos',
    listarVigentes: '/Banner/vigentes',
    obtener: (id: string) => `/Banner/${id}`,
    obtenerPorTipo: (tipo: string) => `/Banner/tipo/${tipo}`,
    obtenerPorPosicion: (posicion: string) => `/Banner/posicion/${posicion}`,
    obtenerActivosPorPosicion: (posicion: string) => `/Banner/posicion/${posicion}/activos`,
    incrementarClics: (id: string) => `/Banner/${id}/clic`,
  },
};
