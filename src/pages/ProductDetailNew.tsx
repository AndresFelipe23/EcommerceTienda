import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { productoService, type Producto } from '../services/producto.service';
import { tiendaService } from '../services/tienda.service';
import { getImageUrl } from '../utils/image.utils';
import { useCart } from '../context/CartContext';
import { listaDeseosService } from '../services/listaDeseos.service';
import { useAuth } from '../context/AuthContext';
import { promocionService, type PromocionAplicable } from '../services/promocion.service';

export default function ProductDetailNew() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCart();
  const { isAuthenticated } = useAuth();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [tiendaInfo, setTiendaInfo] = useState<{
    nombre?: string;
    email?: string;
    telefono?: string;
    direccion?: string
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState<'descripcion' | 'especificaciones' | 'resenas'>('descripcion');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [enListaDeseos, setEnListaDeseos] = useState(false);
  const [isToggleListaDeseos, setIsToggleListaDeseos] = useState(false);
  const [promocionProducto, setPromocionProducto] = useState<PromocionAplicable | null>(null);

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

      // Cargar producto por slug
      if (slug) {
        const productoResponse = await productoService.obtenerPorSlug(slug);
        if (productoResponse.exito && productoResponse.datos) {
          setProducto(productoResponse.datos);

          // Establecer imagen inicial
          let imagenInicial = '';
          if (productoResponse.datos.imagenes && productoResponse.datos.imagenes.length > 0) {
            // Buscar primero la imagen principal, luego ordenar por ordenVisualizacion
            const imagenPrincipal = productoResponse.datos.imagenes.find((img: any) => 
              img.esPrincipal || (img as any).EsPrincipal
            );
            
            const imagenAMostrar = imagenPrincipal || productoResponse.datos.imagenes[0];
            if (imagenAMostrar) {
              const urlImagen = (imagenAMostrar as any).imagenUrl || imagenAMostrar.url;
              if (urlImagen) {
                imagenInicial = getImageUrl(urlImagen);
              }
            }
          } else if (productoResponse.datos.imagenPrincipal) {
            imagenInicial = getImageUrl(productoResponse.datos.imagenPrincipal);
          }

          if (!imagenInicial) {
            imagenInicial = getImageUrl(null);
          }

          setSelectedImage(imagenInicial);

          // Cargar promoción aplicable para este producto
          const promocion = await promocionService.obtenerMejorPromocionParaProducto(
            productoResponse.datos.proId,
            productoResponse.datos.categoriaId,
            productoResponse.datos.precioBase
          );
          setPromocionProducto(promocion);
        }
      }
    } catch (error) {
      // Error al cargar datos
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar si las variantes tienen valores de atributos configurados
  const variantesTienenAtributos = useMemo(() => {
    if (!producto?.variantes || producto.variantes.length === 0) return false;

    return producto.variantes.some(v =>
      v.activo && v.valoresAtributos && v.valoresAtributos.length > 0
    );
  }, [producto?.variantes]);

  // Encontrar la variante seleccionada basada en los valores de atributos
  const varianteSeleccionada = useMemo(() => {
    if (!producto?.variantes || producto.variantes.length === 0) {
      return null;
    }

    const variantesActivas = producto.variantes.filter(v => v.activo);

    // Si las variantes no tienen atributos, seleccionar automáticamente la única variante activa
    // o la primera si hay varias (en este caso todas son equivalentes ya que no tienen atributos)
    if (!variantesTienenAtributos) {
      // Si hay una sola variante activa sin atributos, seleccionarla automáticamente
      if (variantesActivas.length === 1) {
        return variantesActivas[0];
      }
      // Si hay varias variantes sin atributos, retornar null (se sumará el stock de todas)
      return null;
    }

    // Si no hay valores seleccionados, no hay variante seleccionada
    const valoresSeleccionados = Object.values(selectedAttributes).filter(v => v);
    if (valoresSeleccionados.length === 0) {
      return null;
    }

    // Buscar la variante que coincida con todos los valores de atributos seleccionados
    return variantesActivas.find(variante => {
      if (!variante.valoresAtributos || variante.valoresAtributos.length === 0) {
        return false;
      }

      // Verificar que todos los valores de atributos seleccionados estén en esta variante
      const valoresVariante = variante.valoresAtributos.map(v => v.valId);

      // Debe tener exactamente los mismos valores seleccionados
      return valoresSeleccionados.length === valoresVariante.length &&
             valoresSeleccionados.every(valId => valoresVariante.includes(valId)) &&
             valoresVariante.every(valId => valoresSeleccionados.includes(valId));
    }) || null;
  }, [producto?.variantes, selectedAttributes, variantesTienenAtributos]);

  // Calcular precio actual (variante o base)
  const precioBaseActual = varianteSeleccionada?.precio ?? producto?.precioBase ?? 0;
  const precioComparacionActual = varianteSeleccionada?.precioComparacion ?? producto?.precioComparacion;
  
  // Calcular precio con descuento de promoción
  const precioConDescuento = promocionProducto 
    ? promocionService.calcularPrecioConDescuento(precioBaseActual, promocionProducto)
    : precioBaseActual;
  
  const precioActual = precioConDescuento;
  const tieneDescuentoPromocion = promocionProducto && precioConDescuento < precioBaseActual;

  // Calcular stock disponible considerando el inventario
  const stockDisponible = useMemo(() => {
    if (!producto) return Infinity;

    // Si el producto no rastrea inventario, stock ilimitado
    if (producto.rastrearInventario === false) {
      return Infinity;
    }

    // Si hay variante seleccionada, usar su stock
    if (varianteSeleccionada) {
      // Si stockDisponible es null o undefined, significa que no hay inventario configurado
      // En este caso, si rastrea inventario pero no hay stock configurado, asumir 0
      if (varianteSeleccionada.stockDisponible === null || varianteSeleccionada.stockDisponible === undefined) {
        return 0;
      }
      return varianteSeleccionada.stockDisponible;
    }

    // Si el producto tiene variantes pero no hay una seleccionada
    if (producto.variantes && producto.variantes.length > 0) {
      // Si las variantes no tienen atributos, sumar el stock de todas las variantes activas
      if (!variantesTienenAtributos) {
        const variantesActivas = producto.variantes.filter(v => v.activo);
        if (variantesActivas.length === 1) {
          // Si hay una sola variante, usar su stock (ya debería estar seleccionada arriba)
          const stock = variantesActivas[0].stockDisponible;
          if (stock !== null && stock !== undefined) {
            return stock;
          }
        } else if (variantesActivas.length > 1) {
          // Si hay varias variantes sin atributos, sumar el stock de todas
          const stockTotal = variantesActivas.reduce((sum, v) => {
            const stock = v.stockDisponible;
            if (stock !== null && stock !== undefined) {
              return sum + stock;
            }
            return sum;
          }, 0);
          return stockTotal > 0 ? stockTotal : Infinity;
        }
      } else {
        // Si requiere selección de variante con atributos y no hay variante seleccionada
        // Sumar el stock de todas las variantes activas para mostrar el stock total disponible
        const variantesActivas = producto.variantes.filter(v => v.activo);
        const stockTotal = variantesActivas.reduce((sum, v) => {
          const stock = v.stockDisponible;
          if (stock !== null && stock !== undefined && stock > 0) {
            return sum + stock;
          }
          return sum;
        }, 0);
        
        // Si hay al menos una variante con stock, retornar el total
        // Si todas las variantes tienen stock null/undefined o 0, retornar 0 (agotado)
        if (stockTotal > 0) {
          return stockTotal;
        }
        
        // Verificar si hay alguna variante sin stock configurado (null/undefined)
        const hayVariantesSinStockConfig = variantesActivas.some(v => 
          v.stockDisponible === null || v.stockDisponible === undefined
        );
        
        // Si hay variantes sin stock configurado, asumir stock ilimitado
        // Si todas tienen stock 0, retornar 0 (agotado)
        return hayVariantesSinStockConfig ? Infinity : 0;
      }
    }

    // Si no tiene variantes configuradas y rastrea inventario
    // El backend puede enviar stockDisponible o stock
    if (producto.stockDisponible !== undefined && producto.stockDisponible !== null) {
      return producto.stockDisponible;
    }

    // Fallback al campo stock si existe
    if (producto.stock !== undefined && producto.stock !== null) {
      return producto.stock;
    }

    // Si rastrea inventario pero no hay información de stock, asumir stock ilimitado
    // (mejor permitir la venta que bloquearla si no está configurado)
    return Infinity;
  }, [producto, varianteSeleccionada, variantesTienenAtributos]);

  // Calcular si hay stock disponible
  // Si stockDisponible es Infinity, significa que no hay límite de stock
  const hayStock = stockDisponible === Infinity || stockDisponible > 0;

  // Verificar si el producto realmente requiere selección de variantes
  // Solo si tiene variantes Y esas variantes tienen atributos configurados
  const requiereSeleccionVariante = variantesTienenAtributos;

  // Verificar si se han seleccionado todos los atributos requeridos (solo si requiere variantes)
  const atributosRequeridos = producto?.atributos?.filter(a => a.requerido) || [];
  const todosAtributosRequeridosSeleccionados = requiereSeleccionVariante
    ? atributosRequeridos.every(atributo => selectedAttributes[atributo.atriId])
    : true; // Si no requiere variantes, no se requieren atributos

  // Verificar si hay atributos seleccionados pero no coinciden con ninguna variante
  const hayAtributosSeleccionados = Object.keys(selectedAttributes).length > 0;
  const combinacionValida = requiereSeleccionVariante && hayAtributosSeleccionados
    ? varianteSeleccionada !== null
    : true; // Si no requiere variantes o no hay atributos seleccionados, la combinación es válida

  // El botón debe estar habilitado solo si:
  // 1. Hay stock disponible
  // 2. Si se han seleccionado atributos, deben formar una combinación válida
  // 3. Si no se han seleccionado atributos, se puede agregar directamente (selección opcional)
  const puedeAgregarAlCarrito = useMemo(() => {
    // Primero verificar stock
    if (!hayStock) return false;

    // Si no requiere selección de variante, solo necesita stock (ya verificado)
    if (!requiereSeleccionVariante) return true;

    // Si requiere variantes con atributos:
    // - Si NO se han seleccionado atributos, se puede agregar (selección opcional)
    // - Si se han seleccionado atributos, deben formar una combinación válida
    if (requiereSeleccionVariante) {
      // Si no hay atributos seleccionados, permitir agregar (selección opcional)
      if (!hayAtributosSeleccionados) return true;
      
      // Si hay atributos seleccionados, deben formar una combinación válida
      // Si no hay variante válida con los atributos seleccionados, no se puede agregar
      if (varianteSeleccionada === null) return false;
      
      // Si hay variante seleccionada, verificar que todos los atributos requeridos estén seleccionados
      return todosAtributosRequeridosSeleccionados;
    }

    return true;
  }, [hayStock, requiereSeleccionVariante, hayAtributosSeleccionados, varianteSeleccionada, todosAtributosRequeridosSeleccionados]);

  // Resetear cantidad cuando cambia el stock disponible
  useEffect(() => {
    if (stockDisponible !== Infinity && stockDisponible > 0 && quantity > stockDisponible) {
      setQuantity(stockDisponible);
    }
  }, [stockDisponible, quantity]);

  // Verificar si está en lista de deseos cuando cambia el producto o la variante seleccionada
  useEffect(() => {
    const verificarListaDeseos = async () => {
      if (!isAuthenticated || !producto) {
        setEnListaDeseos(false);
        return;
      }

      try {
        const varianteId = varianteSeleccionada?.varId;
        const response = await listaDeseosService.verificarExiste(producto.proId, varianteId);
        if (response.exito) {
          setEnListaDeseos(response.datos === true);
        }
      } catch (error) {
        // Error al verificar, mantener estado actual
      }
    };

    verificarListaDeseos();
  }, [isAuthenticated, producto, varianteSeleccionada]);

  // Manejar agregar/quitar de lista de deseos
  const handleToggleListaDeseos = async () => {
    if (!isAuthenticated) {
      // Redirigir a login si no está autenticado
      navigate('/login?returnUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!producto) return;

    try {
      setIsToggleListaDeseos(true);

      if (enListaDeseos) {
        // Eliminar de la lista
        const varianteId = varianteSeleccionada?.varId;
        const response = await listaDeseosService.eliminarPorProducto(producto.proId, varianteId);
        if (response.exito) {
          setEnListaDeseos(false);
          await Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'Producto eliminado de tu lista de deseos',
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.mensaje || 'No se pudo eliminar de la lista de deseos',
          });
        }
      } else {
        // Agregar a la lista
        const varianteId = varianteSeleccionada?.varId;
        const response = await listaDeseosService.agregar({
          productoId: producto.proId,
          varianteProductoId: varianteId,
        });
        if (response.exito) {
          setEnListaDeseos(true);
          await Swal.fire({
            icon: 'success',
            title: 'Agregado',
            text: 'Producto agregado a tu lista de deseos',
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.mensaje || 'No se pudo agregar a la lista de deseos',
          });
        }
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al actualizar la lista de deseos',
      });
    } finally {
      setIsToggleListaDeseos(false);
    }
  };

  // Manejar agregar al carrito
  const handleAgregarAlCarrito = async () => {
    if (!producto || !puedeAgregarAlCarrito || isAddingToCart) {
      return;
    }

    // Determinar qué variante usar
    let varianteProductoId: string | null = null;

    if (varianteSeleccionada) {
      // Si hay una variante seleccionada, usar su ID
      varianteProductoId = varianteSeleccionada.varId;
    } else if (producto.variantes && producto.variantes.length > 0) {
      // Si hay variantes pero ninguna seleccionada, usar la primera activa
      const primeraVariante = producto.variantes.find(v => v.activo);
      if (primeraVariante) {
        varianteProductoId = primeraVariante.varId;
      }
    }

    // Si no hay variante disponible, no se puede agregar
    if (!varianteProductoId) {
      await Swal.fire({
        icon: 'warning',
        title: 'Opción requerida',
        text: 'No se puede agregar este producto al carrito. Por favor, selecciona las opciones necesarias.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    try {
      setIsAddingToCart(true);
      const exito = await agregarAlCarrito({
        varianteProductoId,
        cantidad: quantity,
      });

      if (exito) {
        // Mostrar mensaje de éxito y opcionalmente redirigir
        const result = await Swal.fire({
          icon: 'success',
          title: '¡Producto agregado!',
          text: 'El producto se ha agregado al carrito correctamente.',
          showCancelButton: true,
          confirmButtonText: 'Ver carrito',
          cancelButtonText: 'Seguir comprando',
          confirmButtonColor: '#2563eb',
          cancelButtonColor: '#6b7280',
        });

        if (result.isConfirmed) {
          navigate('/carrito');
        }
      } else {
        // El error ya se logueó en el contexto
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo agregar el producto al carrito. Por favor, intenta de nuevo.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc2626',
        });
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al agregar el producto al carrito. Por favor, intenta de nuevo.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar tiendaNombre={tiendaInfo?.nombre} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h2>
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

  // Obtener imágenes disponibles
  const imagenesDisponibles = producto.imagenes && producto.imagenes.length > 0
    ? producto.imagenes
        .filter(img => {
          const url = (img as any).imagenUrl || img.url;
          return !!url;
        })
        .sort((a, b) => {
          const ordenA = (a as any).ordenVisualizacion || a.orden || 0;
          const ordenB = (b as any).ordenVisualizacion || b.orden || 0;
          return ordenA - ordenB;
        })
    : [];

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
            {producto.categoria && (
              <>
                <svg 
                  className="w-4 h-4 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <Link 
                  to={`/categoria/${producto.categoria.slug}`} 
                  className="flex items-center text-gray-500 hover:text-blue-600 transition-colors duration-200 group"
                >
                  <span className="font-medium">{producto.categoria.nombre}</span>
                </Link>
              </>
            )}
            <svg 
              className="w-4 h-4 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-semibold truncate max-w-md" title={producto.nombre}>
              {producto.nombre}
            </span>
          </nav>
        </div>
      </div>

      {/* Product Content */}
      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
              {/* Galería de Imágenes */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              {/* Imagen Principal */}
              <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 mb-4 relative">
                <img
                  src={selectedImage}
                  alt={producto.nombre}
                  className="h-full w-full object-cover object-center hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badge de Promoción */}
                {promocionProducto && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-10">
                    {promocionProducto.tipo === 'Porcentaje' 
                      ? `-${promocionProducto.valorDescuento}%`
                      : promocionProducto.tipo === 'MontoFijo'
                      ? `-$${promocionProducto.valorDescuento.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                      : 'Oferta'
                    }
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {imagenesDisponibles.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {imagenesDisponibles.map((imagen, index) => {
                    const imagenUrl = (imagen as any).imagenUrl || imagen.url;
                    const imagenId = (imagen as any).imaId || imagen.proImgId || `img-${index}`;
                    const imagenUrlCompleta = getImageUrl(imagenUrl);
                    const estaSeleccionada = selectedImage === imagenUrlCompleta;

                    return (
                      <button
                        type="button"
                        key={imagenId}
                        onClick={() => setSelectedImage(imagenUrlCompleta)}
                        className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                          estaSeleccionada
                            ? 'border-blue-600 ring-2 ring-blue-200'
                            : 'border-gray-100 hover:border-blue-400'
                        }`}
                      >
                        <img
                          src={imagenUrlCompleta}
                          alt={`${producto.nombre} - ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Información del Producto */}
            <div className="mt-10 lg:mt-0">
              {/* Header */}
              <div className="mb-6">
                {producto.categoria && (
                  <p className="text-sm text-blue-600 font-medium mb-2">{producto.categoria.nombre}</p>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {producto.nombre}
                </h1>

                {/* Precio y Stock */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${tieneDescuentoPromocion ? 'text-red-600' : 'text-gray-900'}`}>
                      ${precioActual.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                    {(precioComparacionActual && precioComparacionActual > precioActual) || (tieneDescuentoPromocion && precioBaseActual > precioActual) ? (
                      <span className="text-xl text-gray-500 line-through">
                        ${((tieneDescuentoPromocion && precioBaseActual > (precioComparacionActual || 0)) ? precioBaseActual : (precioComparacionActual || precioBaseActual)).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    ) : null}
                  </div>

                  {/* Stock Badge */}
                  {stockDisponible !== Infinity && stockDisponible > 0 && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {stockDisponible} disponibles
                    </span>
                  )}
                  {stockDisponible === Infinity && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Disponible
                    </span>
                  )}
                  {stockDisponible !== Infinity && stockDisponible === 0 && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      Agotado
                    </span>
                  )}
                </div>

                {/* Descripción Corta */}
                {producto.descripcionCorta && (
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {producto.descripcionCorta}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-50 pt-6 space-y-6">
                {/* Atributos del Producto (Opciones seleccionables) */}
                {producto.atributos && producto.atributos.length > 0 && requiereSeleccionVariante && (
                  <div className="space-y-5">
                    {producto.atributos
                      .sort((a, b) => (a.ordenVisualizacion || 0) - (b.ordenVisualizacion || 0))
                      .map((atributo) => {
                        // Si no hay valores en el atributo, no mostrarlo
                        if (!atributo.valores || atributo.valores.length === 0) return null;

                        // Obtener valores disponibles del atributo
                        // Solo mostrar valores que están en variantes activas con atributos configurados
                        let valoresDisponibles = atributo.valores;

                        if (variantesTienenAtributos) {
                          // Obtener todos los valores únicos de atributos que están en variantes activas
                          const valoresEnVariantes = new Set<string>();
                          producto.variantes
                            ?.filter(v => v.activo && v.valoresAtributos && v.valoresAtributos.length > 0)
                            .forEach(v => {
                              v.valoresAtributos!
                                .filter(va => va.atributoProductoId === atributo.atriId)
                                .forEach(va => valoresEnVariantes.add(va.valId));
                            });

                          // Si hay valores en variantes para este atributo, filtrarlos
                          if (valoresEnVariantes.size > 0) {
                            valoresDisponibles = atributo.valores.filter(v => valoresEnVariantes.has(v.valId));
                          } else {
                            // Si el atributo no está en ninguna variante activa, no mostrarlo
                            return null;
                          }
                        }

                        // Si después del filtrado no hay valores disponibles, no mostrar el atributo
                        if (valoresDisponibles.length === 0) return null;

                        const tipo = atributo.tipo || 'select';
                        const nombre = atributo.nombreVisualizacion || atributo.nombre || 'Atributo';

                        return (
                          <div key={atributo.atriId}>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                              {nombre}
                              {atributo.requerido && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {tipo === 'color' ? (
                              <div className="grid gap-2 grid-cols-6">
                                {valoresDisponibles
                                  .sort((a, b) => a.ordenVisualizacion - b.ordenVisualizacion)
                                  .map((valor) => {
                                    const estaSeleccionado = selectedAttributes[atributo.atriId] === valor.valId;

                                    return (
                                      <button
                                        type="button"
                                        key={valor.valId}
                                        onClick={() => setSelectedAttributes({
                                          ...selectedAttributes,
                                          [atributo.atriId]: valor.valId
                                        })}
                                        className={`relative w-12 h-12 rounded-lg border-2 transition-all ${
                                          estaSeleccionado
                                            ? 'border-blue-600 ring-2 ring-blue-200'
                                            : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                        style={{ backgroundColor: valor.codigoColor || '#ccc' }}
                                        title={valor.valorVisualizacion || valor.valor}
                                      >
                                        {estaSeleccionado && (
                                          <svg className="absolute inset-0 m-auto w-6 h-6 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                      </button>
                                    );
                                  })}
                              </div>
                            ) : tipo === 'select' ? (
                              <select
                                value={selectedAttributes[atributo.atriId] || ''}
                                onChange={(e) => {
                                  const newAttributes = { ...selectedAttributes };
                                  if (e.target.value) {
                                    newAttributes[atributo.atriId] = e.target.value;
                                  } else {
                                    delete newAttributes[atributo.atriId];
                                  }
                                  setSelectedAttributes(newAttributes);
                                }}
                                required={atributo.requerido}
                                className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-blue-600 focus:ring-0 outline-none bg-white"
                              >
                                <option value="">Seleccionar {nombre.toLowerCase()}...</option>
                                {valoresDisponibles
                                  .sort((a, b) => a.ordenVisualizacion - b.ordenVisualizacion)
                                  .map((valor) => (
                                    <option key={valor.valId} value={valor.valId}>
                                      {valor.valorVisualizacion || valor.valor}
                                    </option>
                                  ))}
                              </select>
                            ) : (
                              <div className="grid gap-2 grid-cols-4">
                                {valoresDisponibles
                                  .sort((a, b) => a.ordenVisualizacion - b.ordenVisualizacion)
                                  .map((valor) => {
                                    const estaSeleccionado = selectedAttributes[atributo.atriId] === valor.valId;

                                    return (
                                      <button
                                        type="button"
                                        key={valor.valId}
                                        onClick={() => setSelectedAttributes({
                                          ...selectedAttributes,
                                          [atributo.atriId]: valor.valId
                                        })}
                                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                          estaSeleccionado
                                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                                            : 'border-gray-100 hover:border-gray-200 text-gray-700'
                                        }`}
                                      >
                                        {valor.valorVisualizacion || valor.valor}
                                      </button>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Cantidad y Botones */}
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Cantidad</label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border-2 border-gray-100 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="px-4 py-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => {
                            const nuevaCantidad = Math.max(1, parseInt(e.target.value) || 1);
                            const cantidadMaxima = stockDisponible === Infinity ? Infinity : stockDisponible;
                            setQuantity(cantidadMaxima === Infinity ? nuevaCantidad : Math.min(nuevaCantidad, cantidadMaxima));
                          }}
                          className="w-16 text-center border-0 focus:ring-0 outline-none"
                          min="1"
                          max={stockDisponible === Infinity ? undefined : stockDisponible}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const cantidadMaxima = stockDisponible === Infinity ? Infinity : stockDisponible;
                            setQuantity(cantidadMaxima === Infinity ? quantity + 1 : Math.min(quantity + 1, cantidadMaxima));
                          }}
                          disabled={stockDisponible !== Infinity && quantity >= stockDisponible}
                          className="px-4 py-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mensaje de validación */}
                  {requiereSeleccionVariante && hayAtributosSeleccionados && !combinacionValida && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        ⚠️ La combinación seleccionada no está disponible. Por favor, selecciona otra opción.
                      </p>
                    </div>
                  )}

                  {requiereSeleccionVariante && !todosAtributosRequeridosSeleccionados && atributosRequeridos.length > 0 && hayAtributosSeleccionados && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        Por favor, selecciona todas las opciones requeridas para continuar.
                      </p>
                    </div>
                  )}


                  {/* Botones de Acción */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={!puedeAgregarAlCarrito || isAddingToCart}
                      onClick={handleAgregarAlCarrito}
                      className={`flex-1 py-4 rounded-lg font-semibold text-lg transition-all ${
                        puedeAgregarAlCarrito && !isAddingToCart
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isAddingToCart ? 'Agregando...' :
                       !hayStock ? 'Agotado' :
                       requiereSeleccionVariante && !hayAtributosSeleccionados ? 'Selecciona las opciones' :
                       requiereSeleccionVariante && !todosAtributosRequeridosSeleccionados ? 'Completa todas las opciones' :
                       requiereSeleccionVariante && !combinacionValida ? 'Combinación no disponible' :
                       'Agregar al Carrito'}
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleListaDeseos}
                      disabled={isToggleListaDeseos}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        enListaDeseos
                          ? 'border-red-500 text-red-500 bg-red-50'
                          : 'border-gray-100 hover:border-red-500 hover:text-red-500'
                      } ${isToggleListaDeseos ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={enListaDeseos ? 'Quitar de lista de deseos' : 'Agregar a lista de deseos'}
                    >
                      {enListaDeseos ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Info Adicional */}
                <div className="border-t border-gray-50 pt-4 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>SKU: {producto.sku}</span>
                  </div>
                  {producto.peso && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>Peso: {producto.peso} kg</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs de Información */}
          {producto.descripcion && (
            <div className="mt-16 border-t border-gray-50 pt-12">
              <div className="border-b border-gray-50 mb-8">
                <nav className="-mb-px flex space-x-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab('descripcion')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'descripcion'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Descripción
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('especificaciones')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'especificaciones'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Especificaciones
                  </button>
                </nav>
              </div>

              {activeTab === 'descripcion' && (
                <div className="prose max-w-none">
                  <p className="text-gray-600 leading-relaxed">{producto.descripcion}</p>
                </div>
              )}

              {activeTab === 'especificaciones' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex py-3 border-b border-gray-50">
                      <span className="font-medium text-gray-900 w-1/3">SKU:</span>
                      <span className="text-gray-600">{producto.sku}</span>
                    </div>
                    {producto.categoria && (
                      <div className="flex py-3 border-b border-gray-50">
                        <span className="font-medium text-gray-900 w-1/3">Categoría:</span>
                        <span className="text-gray-600">{producto.categoria.nombre}</span>
                      </div>
                    )}
                    {producto.peso && (
                      <div className="flex py-3 border-b border-gray-50">
                        <span className="font-medium text-gray-900 w-1/3">Peso:</span>
                        <span className="text-gray-600">{producto.peso} kg</span>
                      </div>
                    )}
                    {producto.dimensiones && (
                      <div className="flex py-3 border-b border-gray-50">
                        <span className="font-medium text-gray-900 w-1/3">Dimensiones:</span>
                        <span className="text-gray-600">{producto.dimensiones}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
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
