import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
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
  const navigate = useNavigate();
  const [productos, setProductos] = useState<ProductoResumen[]>([]);
  const [categorias, setCategorias] = useState<CategoriaArbol[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannersPromocion, setBannersPromocion] = useState<Banner[]>([]);
  const [bannersPopup, setBannersPopup] = useState<Banner[]>([]);
  const [popupAbierto, setPopupAbierto] = useState(false);
  const [promocionesDestacadas, setPromocionesDestacadas] = useState<PromocionAplicable[]>([]);
  const [tiendaInfo, setTiendaInfo] = useState<{ 
    nombre?: string; 
    email?: string; 
    telefono?: string; 
    whatsapp?: string;
    direccion?: string;
    ciudad?: string;
    estado?: string;
    codigoPostal?: string;
    pais?: string;
    nit?: string;
    razonSocial?: string;
  } | null>(null);
  const [configuracion, setConfiguracion] = useState<{
    redesSociales?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      tiktok?: string;
      youtube?: string;
      linkedin?: string;
      pinterest?: string;
    };
    horarios?: {
      lunesAViernes?: string;
      sabado?: string;
      domingo?: string;
      zonaHoraria?: string;
    };
    politicas?: {
      privacidad?: string;
      terminos?: string;
      devoluciones?: string;
      envios?: string;
    };
    branding?: {
      colorPrimario?: string;
      colorSecundario?: string;
      mensajeBienvenida?: string;
      mensajePromocional?: string;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  // Mostrar popup cada vez que se carga la página (si existe)
  useEffect(() => {
    if (bannersPopup && bannersPopup.length > 0) {
      setPopupAbierto(true);
    } else {
      setPopupAbierto(false);
    }
  }, [bannersPopup]);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);

      // Cargar información de la tienda
      const tiendaResponse = await tiendaService.obtenerActual();
      if (tiendaResponse.exito && tiendaResponse.datos) {
        const tiendaId = tiendaResponse.datos.tieId;
        
       
        setTiendaInfo({
          nombre: tiendaResponse.datos.nombre,
          email: tiendaResponse.datos.email,
          telefono: tiendaResponse.datos.telefono,
          whatsapp: tiendaResponse.datos.whatsapp,
          direccion: tiendaResponse.datos.direccion,
          ciudad: tiendaResponse.datos.ciudad,
          estado: tiendaResponse.datos.estado,
          codigoPostal: tiendaResponse.datos.codigoPostal,
          pais: tiendaResponse.datos.pais,
          nit: tiendaResponse.datos.nit,
          razonSocial: tiendaResponse.datos.razonSocial,
        });

        // Parsear configuración JSON si existe
        const configJson = tiendaResponse.datos.configuracionJson;
        if (configJson && configJson.trim() !== '') {
          try {
            const parsedConfig = JSON.parse(configJson);
            setConfiguracion({
              redesSociales: parsedConfig.redesSociales,
              horarios: parsedConfig.horarios,
              politicas: parsedConfig.politicas,
              branding: {
                ...parsedConfig.branding,
                mensajePromocional: parsedConfig.branding?.mensajePromocional,
              },
            });
          } catch (e) {
            // Si hay error al parsear, usar configuración vacía
            console.error('Error al parsear configuracionJson:', e);
            setConfiguracion(null);
          }
        } else {
          setConfiguracion(null);
        }

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
        let bannersInferiorCargados: Banner[] = [];
        
        if (bannersResponse.exito && bannersResponse.datos) {
          const bannersOrdenados = bannersResponse.datos.sort((a, b) => a.orden - b.orden);
          
          // Debug: ver todos los banners recibidos
          console.log('Banners recibidos:', bannersOrdenados.map(b => ({
            id: b.banId,
            titulo: b.titulo,
            posicion: b.posicion,
            orden: b.orden,
            activo: b.activo
          })));
          
          // Separar banners por posición (case-insensitive + trim)
          const normalizarPosicion = (pos?: string) => (pos ?? '').trim().toLowerCase();
          const bannersSuperior = bannersOrdenados.filter(b => {
            const pos = normalizarPosicion(b.posicion);
            return !pos || pos === 'superior';
          });
          bannersMedioCargados = bannersOrdenados.filter(b => normalizarPosicion(b.posicion) === 'medio');
          bannersInferiorCargados = bannersOrdenados.filter(b => normalizarPosicion(b.posicion) === 'inferior');
          const bannersPopupCargados = bannersOrdenados.filter(b => normalizarPosicion(b.posicion) === 'popup');

          // Debug: ver qué banners se filtraron
          console.log('Banners Superior:', bannersSuperior.length);
          console.log('Banners Medio:', bannersMedioCargados.length);
          console.log('Banners Inferior:', bannersInferiorCargados.length);
          console.log('Banners Popup:', bannersPopupCargados.length);

          // Guardar principal (superior)
          setBanners([...bannersSuperior, ...bannersInferiorCargados]);
          setBannersPopup(bannersPopupCargados);
        }

        // Si no se encontraron banners de posición "Medio" en la primera carga, intentar cargarlos directamente
        // Intentar con diferentes variaciones de mayúsculas/minúsculas
        if (bannersMedioCargados.length === 0) {
          const variacionesPosicion = ['Medio', 'medio', 'MEDIO', 'Medio ', ' medio '];
          for (const posicion of variacionesPosicion) {
            const bannersMedioResponse = await bannerService.obtenerActivosPorPosicion(posicion);
            if (bannersMedioResponse.exito && bannersMedioResponse.datos && bannersMedioResponse.datos.length > 0) {
              bannersMedioCargados = bannersMedioResponse.datos.sort((a, b) => a.orden - b.orden);
              break; // Si encontramos banners, salir del loop
            }
          }
        }

        // Si no se encontraron banners de posición "Inferior" en la primera carga, intentar cargarlos directamente
        if (bannersInferiorCargados.length === 0) {
          const variacionesInferior = ['Inferior', 'inferior', 'INFERIOR', 'Inferior ', ' inferior '];
          for (const posicion of variacionesInferior) {
            const bannersInferiorResponse = await bannerService.obtenerActivosPorPosicion(posicion);
            if (bannersInferiorResponse.exito && bannersInferiorResponse.datos && bannersInferiorResponse.datos.length > 0) {
              bannersInferiorCargados = bannersInferiorResponse.datos.sort((a, b) => a.orden - b.orden);
              break;
            }
          }
        }

        // Establecer banners promocionales (medio + inferior) combinados
        const todosLosBannersPromocion = [...bannersMedioCargados, ...bannersInferiorCargados];
        if (todosLosBannersPromocion.length > 0) {
          setBannersPromocion(todosLosBannersPromocion);
        }
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
    if (query.trim()) {
      // Navegar a la página de productos con el parámetro de búsqueda
      navigate(`/productos?q=${encodeURIComponent(query.trim())}`);
    } else {
      // Si no hay búsqueda, navegar a productos sin parámetros
      navigate('/productos');
    }
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
    // Para permitir deslizamiento manual (swipe/drag), evitamos "fade"
    fade: false,
    cssEase: 'ease',
    swipe: true,
    draggable: true,
    touchMove: true,
    pauseOnHover: true,
    pauseOnDotsHover: true,
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
        tiendaTelefono={tiendaInfo?.telefono}
        tiendaWhatsapp={tiendaInfo?.whatsapp}
        tiendaEmail={tiendaInfo?.email}
        tiendaCiudad={tiendaInfo?.ciudad}
        tiendaEstado={tiendaInfo?.estado}
        configuracion={configuracion}
      />

      {/* Popup Banner */}
      {popupAbierto && bannersPopup && bannersPopup.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPopupAbierto(false)}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPopupAbierto(false)}
              className="absolute -top-3 -right-3 z-[60] w-10 h-10 rounded-full bg-white text-gray-700 shadow-lg hover:bg-gray-100 flex items-center justify-center"
              aria-label="Cerrar"
            >
              ✕
            </button>
            <BannerPromocional banner={bannersPopup[0]} className="min-h-[280px] md:min-h-[380px]" />
          </div>
        </div>
      )}
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
      
      {/* Banners promocionales adicionales (posición Medio/Inferior) */}
      {bannersPromocion && bannersPromocion.length > 0 && (
        <section className="py-12 md:py-16 lg:py-20 bg-white relative overflow-hidden">
          {/* Fondo decorativo con patrones sutiles */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)]"></div>
          </div>
          
          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            {bannersPromocion.length === 1 ? (
              <div className="max-w-6xl mx-auto">
                <BannerPromocional banner={bannersPromocion[0]} variant="compact" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7 lg:gap-8">
                {bannersPromocion.map((banner, index) => (
                  <div 
                    key={banner.banId} 
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <BannerPromocional banner={banner} variant="compact" />
                  </div>
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

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
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

          {/* Products Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
            {productosFiltrados.slice(0, 8).map((producto) => {
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

          {/* Ver todos los productos */}
          <div className="flex justify-center mt-8">
            <Link
              to="/productos"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              style={{ color: '#ffffff' }}
            >
              <span style={{ color: '#ffffff' }}>Ver Todos los Productos</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer
        tiendaNombre={tiendaInfo?.nombre}
        tiendaEmail={tiendaInfo?.email}
        tiendaTelefono={tiendaInfo?.telefono}
        tiendaWhatsapp={tiendaInfo?.whatsapp}
        tiendaDireccion={tiendaInfo?.direccion}
        tiendaCiudad={tiendaInfo?.ciudad}
        tiendaEstado={tiendaInfo?.estado}
        tiendaCodigoPostal={tiendaInfo?.codigoPostal}
        tiendaPais={tiendaInfo?.pais}
        categorias={categorias}
        configuracion={configuracion}
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
