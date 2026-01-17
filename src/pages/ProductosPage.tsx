import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { productoService, type ProductoResumen } from '../services/producto.service';
import { categoriaService, type CategoriaArbol } from '../services/categoria.service';
import { tiendaService } from '../services/tienda.service';
import { promocionService, type PromocionAplicable } from '../services/promocion.service';
import { getImageUrl } from '../utils/image.utils';

export default function ProductosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productos, setProductos] = useState<ProductoResumen[]>([]);
  const [categorias, setCategorias] = useState<CategoriaArbol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [promocionesPorProducto, setPromocionesPorProducto] = useState<Map<string, PromocionAplicable>>(new Map());
  
  // Filtros y búsqueda
  // Separamos el valor del input del valor aplicado para evitar recargas mientras se escribe
  const [busquedaInput, setBusquedaInput] = useState(searchParams.get('q') || '');
  const [busquedaAplicada, setBusquedaAplicada] = useState(searchParams.get('q') || '');
  const [categoriaFiltro, setCategoriaFiltro] = useState(searchParams.get('categoria') || '*');
  const [orden, setOrden] = useState(searchParams.get('orden') || 'defecto');
  const [pagina, setPagina] = useState(parseInt(searchParams.get('pagina') || '1', 10));
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalProductos, setTotalProductos] = useState(0);
  
  // Ref para el timeout del debounce
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar datos cuando cambian los filtros aplicados (no mientras se escribe)
  useEffect(() => {
    cargarDatos();
  }, [categoriaFiltro, orden, pagina, busquedaAplicada]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);

      // Cargar información de la tienda
      const tiendaResponse = await tiendaService.obtenerActual();
      if (tiendaResponse.exito && tiendaResponse.datos) {
        const tiendaId = tiendaResponse.datos.tieId;

        // Cargar categorías
        const categoriasResponse = await categoriaService.obtenerArbol(tiendaId);
        if (categoriasResponse.exito && categoriasResponse.datos) {
          setCategorias(categoriasResponse.datos);
        }

        // Cargar productos con filtros
        await cargarProductos();
      }
    } catch (error) {
      // Error al cargar datos
    } finally {
      setIsLoading(false);
    }
  };

  const cargarProductos = async () => {
    try {
      const productosResponse = await productoService.listar(pagina, 1000); // Cargar más productos para filtrar
      if (productosResponse.exito && productosResponse.datos) {
        let productosLista = productosResponse.datos.items || [];
        
        // PRIMERO: Filtrar solo productos con promociones activas
        const promocionesMap = new Map<string, PromocionAplicable>();
        const productosConPromocion: ProductoResumen[] = [];
        
        await Promise.all(
          productosLista.map(async (producto) => {
            const promocion = await promocionService.obtenerMejorPromocionParaProducto(
              producto.proId,
              producto.categoriaId,
              producto.precioBase
            );
            if (promocion) {
              promocionesMap.set(producto.proId, promocion);
              productosConPromocion.push(producto);
            }
          })
        );
        
        // Solo trabajar con productos que tienen promociones
        productosLista = productosConPromocion;
        setPromocionesPorProducto(promocionesMap);
        
        // Aplicar filtro de categoría
        if (categoriaFiltro && categoriaFiltro !== '*') {
          const categoriaIds = obtenerCategoriaIds(categorias.find(c => c.catId === categoriaFiltro));
          productosLista = productosLista.filter(p => categoriaIds.includes(p.categoriaId));
        }

        // Aplicar búsqueda
        if (busquedaAplicada) {
          const busquedaLower = busquedaAplicada.toLowerCase();
          productosLista = productosLista.filter(p => 
            p.nombre.toLowerCase().includes(busquedaLower) ||
            p.descripcionCorta?.toLowerCase().includes(busquedaLower)
          );
        }

        // Aplicar ordenamiento
        productosLista = ordenarProductos(productosLista, orden);

        setProductos(productosLista);
        setTotalProductos(productosLista.length);
        setTotalPaginas(Math.ceil(productosLista.length / 20));
      }
    } catch (error) {
      // Error al cargar productos
    }
  };

  const obtenerCategoriaIds = (categoria: CategoriaArbol | undefined): string[] => {
    if (!categoria) return [];
    const ids: string[] = [categoria.catId];
    if (categoria.subCategorias && categoria.subCategorias.length > 0) {
      categoria.subCategorias.forEach(sub => {
        ids.push(...obtenerCategoriaIds(sub));
      });
    }
    return ids;
  };

  const ordenarProductos = (productos: ProductoResumen[], orden: string): ProductoResumen[] => {
    const productosOrdenados = [...productos];
    switch (orden) {
      case 'precio-asc':
        return productosOrdenados.sort((a, b) => a.precioBase - b.precioBase);
      case 'precio-desc':
        return productosOrdenados.sort((a, b) => b.precioBase - a.precioBase);
      case 'nombre-asc':
        return productosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'nombre-desc':
        return productosOrdenados.sort((a, b) => b.nombre.localeCompare(a.nombre));
      case 'novedades':
        return productosOrdenados; // TODO: Ordenar por fecha de creación
      default:
        return productosOrdenados;
    }
  };

  const handleBuscar = () => {
    // Aplicar la búsqueda inmediatamente
    setBusquedaAplicada(busquedaInput);
    setPagina(1);
    const params = new URLSearchParams();
    if (busquedaInput) params.set('q', busquedaInput);
    if (categoriaFiltro && categoriaFiltro !== '*') params.set('categoria', categoriaFiltro);
    if (orden !== 'defecto') params.set('orden', orden);
    setSearchParams(params);
  };

  const handleInputChange = (value: string) => {
    setBusquedaInput(value);
    
    // Limpiar timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Aplicar búsqueda automática después de 800ms de inactividad
    debounceTimeoutRef.current = setTimeout(() => {
      setBusquedaAplicada(value);
      setPagina(1);
      const params = new URLSearchParams();
      if (value) params.set('q', value);
      if (categoriaFiltro && categoriaFiltro !== '*') params.set('categoria', categoriaFiltro);
      if (orden !== 'defecto') params.set('orden', orden);
      setSearchParams(params);
    }, 800);
  };

  const handleFiltroCategoria = (categoriaId: string) => {
    setCategoriaFiltro(categoriaId);
    setPagina(1);
    const params = new URLSearchParams();
    if (busquedaAplicada) params.set('q', busquedaAplicada);
    if (categoriaId !== '*') params.set('categoria', categoriaId);
    if (orden !== 'defecto') params.set('orden', orden);
    setSearchParams(params);
  };

  const handleOrden = (nuevoOrden: string) => {
    setOrden(nuevoOrden);
    setPagina(1);
    const params = new URLSearchParams();
    if (busquedaAplicada) params.set('q', busquedaAplicada);
    if (categoriaFiltro && categoriaFiltro !== '*') params.set('categoria', categoriaFiltro);
    if (nuevoOrden !== 'defecto') params.set('orden', nuevoOrden);
    setSearchParams(params);
  };

  const categoriasPadre = categorias.filter(cat => cat.activo && !cat.categoriaPadreId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar categorias={categorias} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 text-lg">Cargando productos...</p>
          </div>
        </div>
        <Footer categorias={categorias} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar categorias={categorias} />
      
      {/* Header */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Nuestros Productos
          </h1>
          <p className="text-gray-600">
            {totalProductos} {totalProductos === 1 ? 'producto encontrado' : 'productos encontrados'}
          </p>
        </div>
      </section>

      {/* Filtros y Búsqueda */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={busquedaInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      // Cancelar debounce y buscar inmediatamente
                      if (debounceTimeoutRef.current) {
                        clearTimeout(debounceTimeoutRef.current);
                      }
                      handleBuscar();
                    }
                  }}
                  placeholder="Buscar productos..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleBuscar}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* Ordenamiento */}
            <div className="lg:w-64">
              <select
                value={orden}
                onChange={(e) => handleOrden(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="defecto">Ordenar por defecto</option>
                <option value="precio-asc">Precio: Menor a Mayor</option>
                <option value="precio-desc">Precio: Mayor a Menor</option>
                <option value="nombre-asc">Nombre: A-Z</option>
                <option value="nombre-desc">Nombre: Z-A</option>
                <option value="novedades">Novedades</option>
              </select>
            </div>
          </div>

          {/* Filtros de categoría */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Categorías</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFiltroCategoria('*')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  categoriaFiltro === '*'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {categoriasPadre.map((cat) => (
                <button
                  key={cat.catId}
                  onClick={() => handleFiltroCategoria(cat.catId)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    categoriaFiltro === cat.catId
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Productos */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {productos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productos.map((producto) => {
                  const promocion = promocionesPorProducto.get(producto.proId);
                  const precioConDescuento = promocion 
                    ? promocionService.calcularPrecioConDescuento(producto.precioBase, promocion)
                    : producto.precioBase;
                  const tieneDescuento = promocion && precioConDescuento < producto.precioBase;

                  return (
                    <Link
                      key={producto.proId}
                      to={`/producto/${producto.slug}`}
                      className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
                    >
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img
                          alt={producto.nombre}
                          src={getImageUrl(producto.imagenPrincipal)}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getImageUrl(null);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Badge de Promoción */}
                        {promocion && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            {promocion.tipo === 'Porcentaje' 
                              ? `-${promocion.valorDescuento}%`
                              : promocion.tipo === 'MontoFijo'
                              ? `-$${promocion.valorDescuento.toLocaleString('es-CO')}`
                              : 'Oferta'
                            }
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {producto.nombre}
                        </h3>
                        {producto.descripcionCorta && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{producto.descripcionCorta}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <p className={`text-lg font-bold ${tieneDescuento ? 'text-red-600' : 'text-gray-900'}`}>
                              ${precioConDescuento.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </p>
                            {tieneDescuento && producto.precioBase > precioConDescuento && (
                              <p className="text-sm text-gray-500 line-through">
                                ${producto.precioBase.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                              </p>
                            )}
                          </div>
                          <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  <button
                    onClick={() => setPagina(p => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => setPagina(num)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        pagina === num
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                    disabled={pagina === totalPaginas}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No se encontraron productos</h2>
              <p className="text-gray-600 mb-6">
                {busquedaAplicada ? `No hay productos que coincidan con "${busquedaAplicada}"` : 'No hay productos disponibles en este momento'}
              </p>
              {busquedaAplicada && (
                <button
                  onClick={() => {
                    setBusquedaInput('');
                    setBusquedaAplicada('');
                    setCategoriaFiltro('*');
                    setPagina(1);
                    const params = new URLSearchParams();
                    if (orden !== 'defecto') params.set('orden', orden);
                    setSearchParams(params);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer categorias={categorias} />
    </div>
  );
}
