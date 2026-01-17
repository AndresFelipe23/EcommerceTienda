import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { productoService } from '../services/producto.service';
import { categoriaService } from '../services/categoria.service';
import { tiendaService } from '../services/tienda.service';
import { bannerService } from '../services/banner.service';
import type { ProductoResumen } from '../services/producto.service';
import type { CategoriaArbol } from '../services/categoria.service';
import type { Banner } from '../services/banner.service';
import { getImageUrl } from '../utils/image.utils';
import { promocionService, type PromocionAplicable } from '../services/promocion.service';
import BannerPromocional from '../components/BannerPromocional';
import PromocionDestacada from '../components/PromocionDestacada';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function Home() {
  const [productos, setProductos] = useState<ProductoResumen[]>([]);
  const [categorias, setCategorias] = useState<CategoriaArbol[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannersPromocion, setBannersPromocion] = useState<Banner[]>([]);
  const [promocionesDestacadas, setPromocionesDestacadas] = useState<PromocionAplicable[]>([]);
  const [tiendaInfo, setTiendaInfo] = useState<{ 
    nombre?: string; 
    email?: string; 
    telefono?: string; 
    direccion?: string 
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('*');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [promocionesPorProducto, setPromocionesPorProducto] = useState<Map<string, PromocionAplicable>>(new Map());

  useEffect(() => {
    cargarDatos();
    
    // Botón "Back to top"
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);

      // Cargar información de la tienda
      const tiendaResponse = await tiendaService.obtenerActual();
      if (tiendaResponse.exito && tiendaResponse.datos) {
        const tiendaId = tiendaResponse.datos.tieId;
        setTiendaInfo({
          nombre: tiendaResponse.datos.nombre,
          email: tiendaResponse.datos.descripcion,
        });

        // Cargar categorías
        const categoriasResponse = await categoriaService.obtenerArbol(tiendaId);
        if (categoriasResponse.exito && categoriasResponse.datos) {
          setCategorias(categoriasResponse.datos);
        }

        // Cargar productos
        const productosResponse = await productoService.listar();
        let productosLista: ProductoResumen[] = [];
        let promocionesMap = new Map<string, PromocionAplicable>();
        
        if (productosResponse.exito && productosResponse.datos) {
          productosLista = productosResponse.datos.items || [];
          setProductos(productosLista);

          // Cargar promociones para los productos (individualmente para verificar correctamente)
          if (productosLista.length > 0) {
            // Verificar promociones para cada producto individualmente
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
          }
        }

        // Cargar banners (Superior - carousel principal)
        const bannersResponse = await bannerService.listarVigentes();
        let bannersMedioCargados: Banner[] = [];
        
        if (bannersResponse.exito && bannersResponse.datos) {
          const bannersOrdenados = bannersResponse.datos.sort((a, b) => a.orden - b.orden);
          // Separar banners por posición (case-insensitive)
          const bannersSuperior = bannersOrdenados.filter(b => 
            !b.posicion || b.posicion.toLowerCase() === 'superior'
          );
          bannersMedioCargados = bannersOrdenados.filter(b => 
            b.posicion && b.posicion.toLowerCase() === 'medio'
          );
          setBanners(bannersSuperior);
        }

        // Si no se encontraron banners de posición "Medio", intentar cargarlos directamente
        // Intentar con diferentes variaciones de mayúsculas/minúsculas
        if (bannersMedioCargados.length === 0) {
          const variacionesPosicion = ['Medio', 'medio', 'MEDIO', 'Medio '];
          for (const posicion of variacionesPosicion) {
            const bannersMedioResponse = await bannerService.obtenerActivosPorPosicion(posicion);
            if (bannersMedioResponse.exito && bannersMedioResponse.datos && bannersMedioResponse.datos.length > 0) {
              bannersMedioCargados = bannersMedioResponse.datos.sort((a, b) => a.orden - b.orden);
              break; // Si encontramos banners, salir del loop
            }
          }
        }

        // Establecer banners promocionales si se encontraron
        setBannersPromocion(bannersMedioCargados);
      }
      
      // Cargar promociones activas para mostrar en el espacio promocional (después de cargar productos)
      const promocionesResponse = await promocionService.listarActivas();
      if (promocionesResponse.exito && promocionesResponse.datos && promocionesResponse.datos.length > 0) {
        // Filtrar promociones que aplican a "Todo", "Productos" o "Categorias"
        const promocionesParaMostrar = promocionesResponse.datos
          .filter(p => p.aplicarA === 'Todo' || p.aplicarA === 'Productos' || p.aplicarA === 'Categorias')
          .slice(0, 2); // Mostrar máximo 2 promociones
        
        if (promocionesParaMostrar.length > 0) {
          // Convertir a PromocionAplicable para el componente
          const promocionesAplicables: PromocionAplicable[] = promocionesParaMostrar.map(p => ({
            promId: p.promId,
            nombre: p.nombre,
            tipo: p.tipo,
            aplicarA: p.aplicarA,
            valorDescuento: p.valorDescuento,
            montoMaximoDescuento: p.montoMaximoDescuento,
            fechaFin: p.fechaFin
          }));
          
          setPromocionesDestacadas(promocionesAplicables);
        }
      }
    } catch (error) {
      // Error al cargar datos
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    // TODO: Implementar búsqueda
  };

  // Configuración del slider
  const sliderSettings = {
    dots: true,
    infinite: banners.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: banners.length > 1,
    autoplaySpeed: 5000,
    arrows: true,
    fade: true,
    cssEase: 'linear',
    adaptiveHeight: false,
  };

  // Función auxiliar para obtener todos los IDs de categorías (incluyendo subcategorías)
  const obtenerCategoriaIds = (categoria: CategoriaArbol): string[] => {
    const ids: string[] = [categoria.catId];
    if (categoria.subCategorias && categoria.subCategorias.length > 0) {
      categoria.subCategorias.forEach(sub => {
        ids.push(...obtenerCategoriaIds(sub));
      });
    }
    return ids;
  };

  // Filtrar productos por categoría
  const productosFiltrados = selectedFilter === '*' 
    ? productos 
    : (() => {
        // Encontrar la categoría seleccionada y obtener todos sus IDs (incluyendo subcategorías)
        const categoriaSeleccionada = categorias.find(cat => cat.catId === selectedFilter);
        if (!categoriaSeleccionada) {
          return productos;
        }
        
        const categoriaIds = obtenerCategoriaIds(categoriaSeleccionada);
        
        // Filtrar productos que pertenezcan a alguna de estas categorías
        return productos.filter(p => categoriaIds.includes(p.categoriaId));
      })();

  // Obtener solo categorías padre para el banner
  const categoriasPadre = categorias.filter(cat => cat.activo && !cat.categoriaPadreId).slice(0, 3);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        categorias={categorias} 
        onSearch={handleSearch}
        tiendaNombre={tiendaInfo?.nombre}
      />
      {/* Slider de Banners */}
      {banners.length > 0 ? (
        <section className="relative w-full overflow-hidden">
          <Slider {...sliderSettings} className="w-full">
            {banners.map((banner) => {
              return (
                <div key={banner.banId} className="relative">
                  <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-200">
                    {banner.imagenUrl ? (
                      <>
                        <img
                          src={getImageUrl(banner.imagenUrl)}
                          alt={banner.titulo || 'Banner'}
                          className="absolute inset-0 w-full h-full object-cover z-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getImageUrl(null);
                          }}
                          onLoad={() => {
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            // Mostrar placeholder
                            const parent = target.parentElement;
                            if (parent) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center z-0';
                              placeholder.innerHTML = '<span class="text-gray-600 text-lg">Error al cargar imagen</span>';
                              parent.appendChild(placeholder);
                            }
                          }}
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center z-0">
                        <span className="text-gray-600 text-lg">Sin imagen</span>
                      </div>
                    )}
                    
                    {/* Contenido del banner */}
                    {banner.titulo && (
                      <div className="absolute inset-0 flex items-center z-20 bg-gradient-to-r from-black/50 via-black/20 to-transparent">
                        <div className="container mx-auto px-6 md:px-12">
                          <div className="text-white max-w-3xl">
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.9)' }}>
                              {banner.titulo}
                            </h2>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </Slider>
        </section>
      ) : (
        <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
          <div className="text-center text-white z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Bienvenido a {tiendaInfo?.nombre || 'nuestra tienda'}
            </h2>
            <p className="text-xl md:text-2xl mb-8">
              Descubre nuestros productos exclusivos
            </p>
            <Link 
              to="/productos" 
              className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Ver Productos
            </Link>
          </div>
        </section>
      )}

      {/* Banner - Categorías */}
      {categoriasPadre.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            {/* Header Section */}
            <div className="mb-12 text-center">
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Categorías
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explora nuestras categorías y encuentra lo que buscas
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoriasPadre.map((categoria, index) => (
                <div key={categoria.catId} className="relative group overflow-hidden rounded-lg">
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={getImageUrl(categoria.imagenUrl) !== getImageUrl(null) ? getImageUrl(categoria.imagenUrl) : `/images/banner-0${index + 1}.jpg`}
                      alt={categoria.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `/images/banner-0${index + 1}.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <Link
                    to={`/categoria/${categoria.slug}`}
                    className="absolute bottom-0 left-0 right-0 p-8 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10"
                  >
                    <h3 className="text-2xl font-bold mb-2 drop-shadow-lg" style={{ color: '#ffffff' }}>
                      {categoria.nombre}
                    </h3>
                    {categoria.descripcion && (
                      <p className="text-gray-100 mb-4 drop-shadow-lg" style={{ color: '#f3f4f6' }}>
                        {categoria.descripcion}
                      </p>
                    )}
                    <span className="inline-block text-white font-semibold border-b-2 border-white pb-1 hover:border-blue-400 transition-colors drop-shadow-lg" style={{ color: '#ffffff' }}>
                      Ver Productos
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promociones Destacadas - Entre Categorías y Productos */}
      {promocionesDestacadas.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            {promocionesDestacadas.length === 1 ? (
              <PromocionDestacada 
                promocion={{
                  ...promocionesDestacadas[0],
                  descripcion: undefined,
                  fechaInicio: undefined
                } as any} 
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {promocionesDestacadas.map((promocion) => (
                  <PromocionDestacada 
                    key={promocion.promId} 
                    promocion={{
                      ...promocion,
                      descripcion: undefined,
                      fechaInicio: undefined
                    } as any} 
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* Banner Promocional - Fallback si no hay promociones */}
      {promocionesDestacadas.length === 0 && bannersPromocion && bannersPromocion.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            {bannersPromocion.length === 1 ? (
              <BannerPromocional banner={bannersPromocion[0]} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bannersPromocion.map((banner) => (
                  <BannerPromocional key={banner.banId} banner={banner} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Product */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Nuestros Productos
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre nuestra amplia selección de productos de calidad
            </p>
          </div>

          {/* Filters and Actions Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedFilter === '*'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/30 scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100'
                  }`}
                  onClick={() => setSelectedFilter('*')}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Todos
                  </span>
                </button>
                {categoriasPadre.map((cat) => (
                  <button
                    key={cat.catId}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedFilter === cat.catId 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/30 scale-105' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100'
                    }`}
                    onClick={() => setSelectedFilter(cat.catId)}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
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
          </div>
            
          {/* Search product */}
          {showSearch && (
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
                    placeholder="Buscar productos por nombre, categoría..."
                  />
                  <button className="px-6 py-4 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium">
                    Buscar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filter Panel */}
          {showFilter && (
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productosFiltrados.map((producto) => {
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
                    {producto.categoria && (
                      <p className="text-sm text-gray-500 mb-3">{producto.categoria}</p>
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

          {/* Load more */}
          {productos.length > 16 && (
            <div className="flex justify-center mt-12">
              <button className="px-8 py-3 bg-white text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium">
                Cargar Más
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer
        tiendaNombre={tiendaInfo?.nombre}
        tiendaEmail={tiendaInfo?.email}
        tiendaTelefono={tiendaInfo?.telefono}
        tiendaDireccion={tiendaInfo?.direccion}
        categorias={categorias}
      />

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
          aria-label="Back to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
}
