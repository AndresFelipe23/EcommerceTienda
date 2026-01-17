import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { productoService, type ProductoResumen } from '../services/producto.service';
import { categoriaService, type Categoria } from '../services/categoria.service';
import { tiendaService } from '../services/tienda.service';
import { getImageUrl } from '../utils/image.utils';

export default function CategoriaPage() {
  const { slug } = useParams<{ slug: string }>();
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [productos, setProductos] = useState<ProductoResumen[]>([]);
  const [tiendaInfo, setTiendaInfo] = useState<{
    nombre?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [slug]);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);

      // Cargar información de la tienda
      try {
        const tiendaResponse = await tiendaService.obtenerActual();
        if (tiendaResponse.exito && tiendaResponse.datos) {
          setTiendaInfo({
            nombre: tiendaResponse.datos.nombre,
            email: tiendaResponse.datos.descripcion,
            telefono: '',
            direccion: '',
          });
        }
      } catch (tiendaError) {
        // No se pudo cargar información de la tienda
      }

      // Cargar categoría por slug
      if (slug) {
        const categoriaResponse = await categoriaService.obtenerPorSlug(slug);
        if (categoriaResponse.exito && categoriaResponse.datos) {
          setCategoria(categoriaResponse.datos);

          // Cargar productos de la categoría
          const productosResponse = await productoService.obtenerPorCategoria(categoriaResponse.datos.catId, 1, 100);
          if (productosResponse.exito && productosResponse.datos) {
            // El backend retorna PagedResponseDto con Items (PascalCase)
            // El convertToCamelCase debería convertir Items a items
            // La estructura es: { items: [...], paginacion: {...} }
            let productosLista: ProductoResumen[] = [];
            
            if (productosResponse.datos.items) {
              // Si tiene items (ya convertido a camelCase)
              productosLista = productosResponse.datos.items;
            } else if (Array.isArray(productosResponse.datos)) {
              // Si es un array directo (fallback)
              productosLista = productosResponse.datos;
            } else if ((productosResponse.datos as any).Items) {
              // Si aún está en PascalCase (no se convirtió)
              productosLista = (productosResponse.datos as any).Items;
            }
            
            setProductos(productosLista);
          } else {
            setProductos([]);
          }
        }
      }
    } catch (error) {
      // Error al cargar datos
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!categoria) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar tiendaNombre={tiendaInfo?.nombre} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Categoría no encontrada</h2>
            <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
              Volver al inicio
            </Link>
          </div>
        </div>
        <Footer
          tiendaNombre={tiendaInfo?.nombre}
          tiendaEmail={tiendaInfo?.email}
          tiendaTelefono={tiendaInfo?.telefono}
          tiendaDireccion={tiendaInfo?.direccion}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar tiendaNombre={tiendaInfo?.nombre} />

      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
            <Link 
              to="/" 
              className="flex items-center text-gray-500 hover:text-blue-600 transition-colors duration-200 group"
            >
              <svg 
                className="w-4 h-4 mr-1.5 group-hover:text-blue-600 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">Inicio</span>
            </Link>
            <svg 
              className="w-4 h-4 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-semibold truncate max-w-md" title={categoria.nombre}>
              {categoria.nombre}
            </span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      {categoria.imagenUrl && (
        <section className="relative w-full h-64 md:h-80 overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700">
          <img
            src={getImageUrl(categoria.imagenUrl)}
            alt={categoria.nombre}
            className="w-full h-full object-cover opacity-30"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                {categoria.nombre}
              </h1>
              {categoria.descripcion && (
                <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto drop-shadow-md">
                  {categoria.descripcion}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {!categoria.imagenUrl && (
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {categoria.nombre}
            </h1>
            {categoria.descripcion && (
              <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto">
                {categoria.descripcion}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Subcategories Section */}
      {(() => {
        const subcategorias = categoria.subCategorias || (categoria as any).SubCategorias || [];
        const subcategoriasActivas = subcategorias.filter((sub: any) => sub.activo !== false);
        return subcategoriasActivas.length > 0;
      })() && (
        <section className="py-12 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {(() => {
              const subcategorias = categoria.subCategorias || (categoria as any).SubCategorias || [];
              const subcategoriasActivas = subcategorias.filter((sub: any) => sub.activo !== false);
              return (
                <>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Subcategorías</h2>
                    <p className="text-gray-600">
                      Explora nuestras {subcategoriasActivas.length} subcategoría{subcategoriasActivas.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {subcategoriasActivas.map((subcategoria: any) => (
                  <Link
                    key={subcategoria.catId}
                    to={`/categoria/${subcategoria.slug}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-300 transition-all duration-300"
                  >
                    {subcategoria.imagenUrl ? (
                      <>
                        <div className="relative aspect-video overflow-hidden bg-gray-100">
                          <img
                            src={getImageUrl(subcategoria.imagenUrl)}
                            alt={subcategoria.nombre}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getImageUrl(null);
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {subcategoria.nombre}
                          </h3>
                          {subcategoria.descripcion && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {subcategoria.descripcion}
                            </p>
                          )}
                          <span className="text-blue-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                            Ver productos
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 group-hover:from-blue-50 group-hover:via-white group-hover:to-blue-50 transition-all duration-300">
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-6 relative">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                            {subcategoria.nombre}
                          </h3>
                          {subcategoria.descripcion && (
                            <p className="text-sm text-gray-600 line-clamp-3 mb-6 leading-relaxed">
                              {subcategoria.descripcion}
                            </p>
                          )}
                          <span className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-200 rounded-full text-blue-600 font-semibold text-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:gap-3 transition-all duration-300 shadow-sm group-hover:shadow-md">
                            Explorar categoría
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    )}
                  </Link>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </section>
      )}

      {/* Products Section - Solo mostrar si hay productos o si no hay subcategorías */}
      {(!categoria.subCategorias || categoria.subCategorias.length === 0 || productos.length > 0) && (
        <section className={`py-16 bg-gradient-to-b from-white to-gray-50 ${categoria.subCategorias && categoria.subCategorias.length > 0 ? 'border-t border-gray-100' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Products Count */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {categoria.subCategorias && categoria.subCategorias.length > 0 
                  ? 'Productos en esta categoría' 
                  : 'Productos'}
              </h2>
              <p className="text-gray-600">
                {productos.length > 0 
                  ? `${productos.length} ${productos.length === 1 ? 'producto encontrado' : 'productos encontrados'}`
                  : 'No se encontraron productos en esta categoría'
                }
              </p>
            </div>

          {/* Filters and Actions Bar */}
          {productos.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-3">
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                    showFilter
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {showFilter ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Ocultar Filtros
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      Filtros
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                    showSearch
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {showSearch ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Ocultar
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Buscar
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Search product */}
          {showSearch && productos.length > 0 && (
            <div className="mb-8 animate-in slide-in-from-top-2 duration-300">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center">
                  <div className="px-5 py-4 text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    className="flex-1 px-2 py-4 outline-none text-gray-700 placeholder-gray-400"
                    type="text"
                    name="search-product"
                    placeholder="Buscar productos en esta categoría..."
                  />
                  <button className="px-6 py-4 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium">
                    Buscar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filter Panel */}
          {showFilter && productos.length > 0 && (
            <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-gray-900">Filtros y Ordenamiento</h4>
                <button
                  onClick={() => setShowFilter(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Ordenar por
                  </h5>
                  <ul className="space-y-2.5">
                    <li>
                      <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors py-1.5 px-2 rounded-md hover:bg-blue-50">
                        <span>Por defecto</span>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors py-1.5 px-2 rounded-md hover:bg-blue-50">
                        <span>Popularidad</span>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="flex items-center gap-2 text-blue-600 font-medium py-1.5 px-2 rounded-md bg-blue-50">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Novedades</span>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors py-1.5 px-2 rounded-md hover:bg-blue-50">
                        <span>Precio: Menor a Mayor</span>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors py-1.5 px-2 rounded-md hover:bg-blue-50">
                        <span>Precio: Mayor a Menor</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {productos.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productos.map((producto) => (
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
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {producto.nombre}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-gray-900">
                        ${producto.precioBase.toLocaleString('es-CO')}
                      </p>
                      <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay productos disponibles</h3>
              <p className="text-gray-600 mb-6">No se encontraron productos en esta categoría en este momento.</p>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          )}
        </div>
      </section>
      )}

      <Footer
        tiendaNombre={tiendaInfo?.nombre}
        tiendaEmail={tiendaInfo?.email}
        tiendaTelefono={tiendaInfo?.telefono}
        tiendaDireccion={tiendaInfo?.direccion}
      />
    </div>
  );
}
