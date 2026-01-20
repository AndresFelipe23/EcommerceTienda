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

  // Estados para precio - separamos input de valor aplicado
  const [precioMinimoInput, setPrecioMinimoInput] = useState<string>('');
  const [precioMaximoInput, setPrecioMaximoInput] = useState<string>('');
  const [precioMinimoAplicado, setPrecioMinimoAplicado] = useState<number | undefined>(undefined);
  const [precioMaximoAplicado, setPrecioMaximoAplicado] = useState<number | undefined>(undefined);
  const [enStock, setEnStock] = useState<boolean | undefined>(undefined);
  const [conPromocion, setConPromocion] = useState<boolean>(false);
  const [stockBajo, setStockBajo] = useState<boolean>(false);
  const [conDescuentoVisual, setConDescuentoVisual] = useState<boolean>(false);

  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  // Refs para los timeouts del debounce
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncePrecioMinimoRef = useRef<NodeJS.Timeout | null>(null);
  const debouncePrecioMaximoRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar datos iniciales (solo una vez al montar)
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        // Cargar información de la tienda
        const tiendaResponse = await tiendaService.obtenerActual();
        if (tiendaResponse.exito && tiendaResponse.datos) {
          const tiendaId = tiendaResponse.datos.tieId;

          // Cargar categorías (solo una vez)
          const categoriasResponse = await categoriaService.obtenerArbol(tiendaId);
          if (categoriasResponse.exito && categoriasResponse.datos) {
            setCategorias(categoriasResponse.datos);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
      }
    };

    cargarDatosIniciales();
  }, []); // Solo se ejecuta una vez al montar

  // Cargar productos cuando cambian los filtros aplicados (sin recargar categorías ni tienda)
  useEffect(() => {
    cargarProductos();
  }, [categoriaFiltro, orden, pagina, busquedaAplicada, precioMinimoAplicado, precioMaximoAplicado, enStock, conPromocion, stockBajo, conDescuentoVisual]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (debouncePrecioMinimoRef.current) {
        clearTimeout(debouncePrecioMinimoRef.current);
      }
      if (debouncePrecioMaximoRef.current) {
        clearTimeout(debouncePrecioMaximoRef.current);
      }
    };
  }, []);

  const cargarProductos = async () => {
    try {
      setIsLoading(true);
      
      // Preparar filtros para la búsqueda en PascalCase (como espera el backend)
      const filtros: any = {
        Pagina: pagina,
        TamañoPagina: 20,
      };

      // Agregar búsqueda si existe
      if (busquedaAplicada) {
        filtros.Busqueda = busquedaAplicada;
      }

      // Agregar filtro de categoría si existe
      if (categoriaFiltro && categoriaFiltro !== '*') {
        filtros.CategoriaId = categoriaFiltro;
      }

      // Agregar filtros de precio si existen
      if (precioMinimoAplicado !== undefined && precioMinimoAplicado > 0) {
        filtros.PrecioMinimo = precioMinimoAplicado;
      }
      if (precioMaximoAplicado !== undefined && precioMaximoAplicado > 0) {
        filtros.PrecioMaximo = precioMaximoAplicado;
      }

      // Agregar filtro de disponibilidad (solo cuando es true, el backend no soporta false)
      if (enStock === true) {
        filtros.EnStock = true;
      }

      // Agregar ordenamiento
      const ordenMapping: { [key: string]: string } = {
        'precio-asc': 'precio',
        'precio-desc': 'precio',
        'nombre-asc': 'nombre',
        'nombre-desc': 'nombre',
        'novedades': 'fecha',
        'defecto': 'nombre'
      };
      
      if (ordenMapping[orden]) {
        filtros.OrdenarPor = ordenMapping[orden];
        filtros.OrdenDescendente = orden.includes('-desc');
      }

      // Llamar al servicio de búsqueda del backend
      const productosResponse = await productoService.buscar(filtros);
      
      if (productosResponse.exito && productosResponse.datos) {
        let productosLista = productosResponse.datos.items || [];
        
        // Obtener promociones para los productos encontrados
        const promocionesMap = new Map<string, PromocionAplicable>();
        
        await Promise.all(
          productosLista.map(async (producto) => {
            const promocion = await promocionService.obtenerMejorPromocionParaProducto(
              producto.proId,
              producto.categoriaId,
              producto.precioBase
            );
            if (promocion) {
              promocionesMap.set(producto.proId, promocion);
            }
          })
        );
        
        setPromocionesPorProducto(promocionesMap);
        
        // Aplicar filtros del frontend
        let productosFinales = productosLista;
        
        // Filtro: Con promoción
        if (conPromocion) {
          productosFinales = productosFinales.filter(p => promocionesMap.has(p.proId));
        }
        
        // Filtro: Con descuento visual (precioComparacion > precioBase)
        if (conDescuentoVisual) {
          productosFinales = productosFinales.filter(p => 
            p.precioComparacion && p.precioComparacion > p.precioBase
          );
        }
        
        // Filtro: Stock bajo
        if (stockBajo) {
          productosFinales = productosFinales.filter(p => 
            p.stockEstado === 'StockBajo' || p.stockEstado === 'SinStock'
          );
        }
        
        setProductos(productosFinales);
        const totalFiltrado = productosFinales.length;
        const tieneFiltrosFrontend = conPromocion || conDescuentoVisual || stockBajo;
        setTotalProductos(tieneFiltrosFrontend ? totalFiltrado : (productosResponse.datos.totalItems || productosLista.length));
        setTotalPaginas(tieneFiltrosFrontend ? Math.ceil(totalFiltrado / 20) : (productosResponse.datos.totalPaginas || 1));
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProductos([]);
      setTotalProductos(0);
      setTotalPaginas(1);
    } finally {
      setIsLoading(false);
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
    // Actualizar URL sin recargar la página
    const params = new URLSearchParams();
    if (busquedaInput) params.set('q', busquedaInput);
    if (categoriaFiltro && categoriaFiltro !== '*') params.set('categoria', categoriaFiltro);
    if (orden !== 'defecto') params.set('orden', orden);
    setSearchParams(params, { replace: true });
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
      // Actualizar URL sin recargar la página
      const params = new URLSearchParams();
      if (value) params.set('q', value);
      if (categoriaFiltro && categoriaFiltro !== '*') params.set('categoria', categoriaFiltro);
      if (orden !== 'defecto') params.set('orden', orden);
      setSearchParams(params, { replace: true });
    }, 800);
  };

  const handleFiltroCategoria = (categoriaId: string) => {
    setCategoriaFiltro(categoriaId);
    setPagina(1);
    // Actualizar URL sin recargar la página
    const params = new URLSearchParams();
    if (busquedaAplicada) params.set('q', busquedaAplicada);
    if (categoriaId !== '*') params.set('categoria', categoriaId);
    if (orden !== 'defecto') params.set('orden', orden);
    setSearchParams(params, { replace: true });
  };

  const handleOrden = (nuevoOrden: string) => {
    setOrden(nuevoOrden);
    setPagina(1);
    // Actualizar URL sin recargar la página
    const params = new URLSearchParams();
    if (busquedaAplicada) params.set('q', busquedaAplicada);
    if (categoriaFiltro && categoriaFiltro !== '*') params.set('categoria', categoriaFiltro);
    if (nuevoOrden !== 'defecto') params.set('orden', nuevoOrden);
    setSearchParams(params, { replace: true });
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

      {/* Búsqueda y Ordenamiento */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Botón para abrir sidebar en mobile */}
            <button
              onClick={() => setSidebarAbierto(!sidebarAbierto)}
              className="lg:hidden px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
            </button>

            {/* Búsqueda */}
            <div className="flex-1 w-full">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={busquedaInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
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
            <div className="w-full lg:w-64">
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
        </div>
      </section>

      {/* Contenido principal con Sidebar y Productos */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            {/* Sidebar de Filtros - Mobile como drawer, Desktop como sidebar fijo */}
            {sidebarAbierto && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setSidebarAbierto(false)}
              />
            )}
            <aside className={`${sidebarAbierto ? 'fixed' : 'hidden'} lg:block left-0 top-0 z-50 lg:z-auto h-full lg:h-auto overflow-y-auto lg:overflow-visible w-80 lg:w-64 flex-shrink-0 bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-gray-200 p-6 lg:sticky lg:top-4 transition-transform duration-300 ${sidebarAbierto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
                <button
                  onClick={() => setSidebarAbierto(false)}
                  className="lg:hidden text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Filtro de Categorías */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Categorías</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        handleFiltroCategoria('*');
                        setSidebarAbierto(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        categoriaFiltro === '*'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Todos
                    </button>
                    {categoriasPadre.map((cat) => (
                      <button
                        key={cat.catId}
                        onClick={() => {
                          handleFiltroCategoria(cat.catId);
                          setSidebarAbierto(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          categoriaFiltro === cat.catId
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {cat.nombre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtro de Precio */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Rango de Precio</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Precio Mínimo</label>
                      <input
                        type="number"
                        value={precioMinimoInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPrecioMinimoInput(value);

                          // Limpiar timeout anterior
                          if (debouncePrecioMinimoRef.current) {
                            clearTimeout(debouncePrecioMinimoRef.current);
                          }

                          // Aplicar el filtro después de 800ms de inactividad
                          debouncePrecioMinimoRef.current = setTimeout(() => {
                            const numValue = value ? parseInt(value) : undefined;
                            setPrecioMinimoAplicado(numValue);
                            setPagina(1);
                          }, 800);
                        }}
                        placeholder="0"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Precio Máximo</label>
                      <input
                        type="number"
                        value={precioMaximoInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPrecioMaximoInput(value);

                          // Limpiar timeout anterior
                          if (debouncePrecioMaximoRef.current) {
                            clearTimeout(debouncePrecioMaximoRef.current);
                          }

                          // Aplicar el filtro después de 800ms de inactividad
                          debouncePrecioMaximoRef.current = setTimeout(() => {
                            const numValue = value ? parseInt(value) : undefined;
                            setPrecioMaximoAplicado(numValue);
                            setPagina(1);
                          }, 800);
                        }}
                        placeholder="Sin límite"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    {(precioMinimoInput || precioMaximoInput) && (
                      <button
                        onClick={() => {
                          setPrecioMinimoInput('');
                          setPrecioMaximoInput('');
                          setPrecioMinimoAplicado(undefined);
                          setPrecioMaximoAplicado(undefined);
                          setPagina(1);

                          // Limpiar timeouts pendientes
                          if (debouncePrecioMinimoRef.current) {
                            clearTimeout(debouncePrecioMinimoRef.current);
                          }
                          if (debouncePrecioMaximoRef.current) {
                            clearTimeout(debouncePrecioMaximoRef.current);
                          }
                        }}
                        className="w-full px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Limpiar precio
                      </button>
                    )}
                  </div>
                </div>

                {/* Filtro de Disponibilidad */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Disponibilidad</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setEnStock(undefined);
                        setPagina(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        enStock === undefined
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => {
                        setEnStock(true);
                        setPagina(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        enStock === true
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      En Stock
                    </button>
                  </div>
                </div>

                {/* Filtro de Promociones */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Ofertas</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={conPromocion}
                        onChange={(e) => {
                          setConPromocion(e.target.checked);
                          setPagina(1);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Solo productos con descuento</span>
                    </label>
                  </div>
                </div>

                {/* Filtro de Descuento Visual */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Descuentos</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={conDescuentoVisual}
                        onChange={(e) => {
                          setConDescuentoVisual(e.target.checked);
                          setPagina(1);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Con descuento visual</span>
                    </label>
                  </div>
                </div>

                {/* Filtro de Stock Bajo */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Estado de Stock</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stockBajo}
                        onChange={(e) => {
                          setStockBajo(e.target.checked);
                          setPagina(1);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Stock bajo o agotado</span>
                    </label>
                  </div>
                </div>

                {/* Botón limpiar todos los filtros */}
                {(categoriaFiltro !== '*' || precioMinimoInput || precioMaximoInput || busquedaAplicada || enStock !== undefined || conPromocion || conDescuentoVisual || stockBajo) && (
                  <button
                    onClick={() => {
                      setCategoriaFiltro('*');
                      setPrecioMinimoInput('');
                      setPrecioMaximoInput('');
                      setPrecioMinimoAplicado(undefined);
                      setPrecioMaximoAplicado(undefined);
                      setBusquedaInput('');
                      setBusquedaAplicada('');
                      setEnStock(undefined);
                      setConPromocion(false);
                      setConDescuentoVisual(false);
                      setStockBajo(false);
                      setPagina(1);

                      // Limpiar timeouts pendientes
                      if (debouncePrecioMinimoRef.current) {
                        clearTimeout(debouncePrecioMinimoRef.current);
                      }
                      if (debouncePrecioMaximoRef.current) {
                        clearTimeout(debouncePrecioMaximoRef.current);
                      }

                      const params = new URLSearchParams();
                      if (orden !== 'defecto') params.set('orden', orden);
                      setSearchParams(params, { replace: true });
                      setSidebarAbierto(false);
                    }}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Limpiar Filtros
                  </button>
                )}
              </div>
            </aside>

            {/* Productos */}
            <div className="flex-1">
              {productos.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    setPrecioMinimoInput('');
                    setPrecioMaximoInput('');
                    setPrecioMinimoAplicado(undefined);
                    setPrecioMaximoAplicado(undefined);
                    setEnStock(undefined);
                    setConPromocion(false);
                    setConDescuentoVisual(false);
                    setStockBajo(false);
                    setPagina(1);

                    // Limpiar timeouts pendientes
                    if (debouncePrecioMinimoRef.current) {
                      clearTimeout(debouncePrecioMinimoRef.current);
                    }
                    if (debouncePrecioMaximoRef.current) {
                      clearTimeout(debouncePrecioMaximoRef.current);
                    }

                    const params = new URLSearchParams();
                    if (orden !== 'defecto') params.set('orden', orden);
                    setSearchParams(params, { replace: true });
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}
            </div>
          </div>
        </div>
      </section>

      <Footer categorias={categorias} />
    </div>
  );
}
