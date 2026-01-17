import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/image.utils';
import { tiendaService } from '../services/tienda.service';
import { promocionService, type PromocionAplicable } from '../services/promocion.service';

export default function CarritoPage() {
  const { carrito, isLoading, actualizarCantidad, eliminarItem, vaciarCarrito, aplicarCupon, removerCupon, recargarCarrito } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tiendaInfo, setTiendaInfo] = useState<{
    nombre?: string;
  } | null>(null);
  const [codigoCupon, setCodigoCupon] = useState('');
  const [aplicandoCupon, setAplicandoCupon] = useState(false);
  const [promocionesPorItem, setPromocionesPorItem] = useState<Map<string, PromocionAplicable>>(new Map());

  useEffect(() => {
    cargarTiendaInfo();
    // No necesitamos recargar el carrito aquí porque ya se carga en el CartContext
    // recargarCarrito();
  }, []);

  const cargarTiendaInfo = async () => {
    try {
      const tiendaResponse = await tiendaService.obtenerActual();
      if (tiendaResponse.exito && tiendaResponse.datos) {
        setTiendaInfo({
          nombre: tiendaResponse.datos.nombre,
        });
      }
    } catch (error) {
      // No se pudo cargar información de la tienda
    }
  };

  const cargarPromocionesItems = async () => {
    if (!carrito?.items || carrito.items.length === 0) return;

    try {
      const promocionesMap = new Map<string, PromocionAplicable>();

      // Verificar promociones para cada item individualmente
      await Promise.all(
        carrito.items.map(async (item) => {
          if (!item.producto?.proId || !item.producto.categoriaId) return;

          const promocion = await promocionService.obtenerMejorPromocionParaProducto(
            item.producto.proId,
            item.producto.categoriaId,
            item.varianteProducto?.precio || item.precio
          );

          if (promocion) {
            promocionesMap.set(item.iteId, promocion);
          }
        })
      );

      setPromocionesPorItem(promocionesMap);
    } catch (error) {
      // Error al cargar promociones
    }
  };

  const handleCantidadChange = async (e: React.MouseEvent<HTMLButtonElement>, itemId: string, nuevaCantidad: number, stockDisponible?: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (nuevaCantidad < 1) {
      return;
    }
    
    // Verificar stock antes de intentar actualizar
    if (stockDisponible !== undefined && stockDisponible !== null && nuevaCantidad > stockDisponible) {
      // No permitir incrementar más allá del stock disponible
      return;
    }
    
    await actualizarCantidad(itemId, nuevaCantidad);
  };

  const handleEliminarItem = async (e: React.MouseEvent<HTMLButtonElement>, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await Swal.fire({
      icon: 'question',
      title: '¿Eliminar producto?',
      text: '¿Estás seguro de que deseas eliminar este producto del carrito?',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });

    if (result.isConfirmed) {
      const exito = await eliminarItem(itemId);
      if (exito) {
        await Swal.fire({
          icon: 'success',
          title: 'Producto eliminado',
          text: 'El producto se ha eliminado del carrito.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#2563eb',
          timer: 2000,
          timerProgressBar: true,
        });
      }
    }
  };

  const handleVaciarCarrito = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Vaciar carrito?',
      text: '¿Estás seguro de que deseas vaciar todo el carrito? Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });

    if (result.isConfirmed) {
      const exito = await vaciarCarrito();
      if (exito) {
        await Swal.fire({
          icon: 'success',
          title: 'Carrito vaciado',
          text: 'El carrito se ha vaciado correctamente.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#2563eb',
          timer: 2000,
          timerProgressBar: true,
        });
      }
    }
  };

  const handleAplicarCupon = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!codigoCupon.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Código requerido',
        text: 'Por favor, ingresa un código de cupón.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    setAplicandoCupon(true);
    try {
      const resultado = await aplicarCupon(codigoCupon.trim().toUpperCase());
      if (resultado.exito) {
        await Swal.fire({
          icon: 'success',
          title: '¡Cupón aplicado!',
          text: 'El cupón se ha aplicado correctamente.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#2563eb',
          timer: 2000,
          timerProgressBar: true,
        });
        setCodigoCupon('');
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Cupón no válido',
          text: resultado.mensaje || 'El código del cupón no es válido o no aplica para este carrito.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc2626',
        });
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo aplicar el cupón. Por favor, intenta de nuevo.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setAplicandoCupon(false);
    }
  };

  const handleRemoverCupon = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const exito = await removerCupon();
    if (exito) {
      await Swal.fire({
        icon: 'success',
        title: 'Cupón removido',
        text: 'El cupón se ha removido del carrito.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#2563eb',
        timer: 2000,
        timerProgressBar: true,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar tiendaNombre={tiendaInfo?.nombre} />
      
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
            <p className="mt-2 text-gray-600">
              {carrito && carrito.items.length > 0
                ? `${carrito.totalItems} ${carrito.totalItems === 1 ? 'producto' : 'productos'} en tu carrito`
                : 'Tu carrito está vacío'}
            </p>
          </div>

          {!carrito || carrito.items.length === 0 ? (
            // Carrito vacío
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <svg
                className="mx-auto h-24 w-24 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">Tu carrito está vacío</h2>
              <p className="mt-2 text-gray-600">Agrega productos a tu carrito para comenzar a comprar</p>
              <div className="mt-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continuar comprando
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Lista de productos */}
              <div className="lg:col-span-2 space-y-4">
                {carrito.items && carrito.items.length > 0 ? (
                  carrito.items.map((item) => {
                    return (
                  <div
                    key={item.iteId}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Imagen */}
                      <div className="flex-shrink-0">
                        <Link to={`/producto/${item.producto?.slug || ''}`}>
                          <img
                            src={getImageUrl(item.producto?.imagenPrincipal)}
                            alt={item.producto?.nombre || 'Producto'}
                            className="w-32 h-32 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getImageUrl(null);
                            }}
                          />
                        </Link>
                      </div>

                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0 pr-4">
                            <Link
                              to={`/producto/${item.producto?.slug || ''}`}
                              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {item.producto?.nombre || 'Producto'}
                            </Link>
                            {item.varianteProducto?.sku && (
                              <p className="mt-1 text-sm text-gray-500">SKU: {item.varianteProducto.sku}</p>
                            )}
                            {/* Mostrar atributos seleccionados */}
                            {item.varianteProducto?.valoresAtributos && item.varianteProducto.valoresAtributos.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {item.varianteProducto.valoresAtributos.map((atributo) => (
                                  <div
                                    key={atributo.valId}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md text-sm"
                                  >
                                    <span className="text-gray-600 font-medium">
                                      {atributo.atributoNombre || 'Atributo'}:
                                    </span>
                                    {atributo.codigoColor ? (
                                      <span
                                        className="inline-block w-4 h-4 rounded-full border border-gray-300"
                                        style={{ backgroundColor: atributo.codigoColor }}
                                        title={atributo.valorVisualizacion || atributo.valor}
                                      />
                                    ) : (
                                      <span className="text-gray-900">
                                        {atributo.valorVisualizacion || atributo.valor}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="mt-2">
                              {(() => {
                                const promocion = promocionesPorItem.get(item.iteId);
                                const precioOriginal = item.varianteProducto?.precio || item.precio;
                                const precioConDescuento = promocion 
                                  ? promocionService.calcularPrecioConDescuento(precioOriginal, promocion)
                                  : item.precio;
                                const tieneDescuento = promocion && precioConDescuento < precioOriginal;

                                return (
                                  <div className="flex items-baseline gap-2">
                                    <p className={`text-xl font-bold ${tieneDescuento ? 'text-red-600' : 'text-gray-900'}`}>
                                      ${precioConDescuento.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </p>
                                    {tieneDescuento && precioOriginal > precioConDescuento && (
                                      <p className="text-sm text-gray-500 line-through">
                                        ${precioOriginal.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                      </p>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Botón eliminar */}
                          <button
                            type="button"
                            onClick={(e) => handleEliminarItem(e, item.iteId)}
                            className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                            aria-label="Eliminar producto"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Controles de cantidad */}
                        <div className="mt-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleCantidadChange(e, item.iteId, item.cantidad - 1, item.varianteProducto?.stockDisponible);
                                }}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={item.cantidad <= 1}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 12H4"
                                  />
                                </svg>
                              </button>
                              <span className="px-4 py-2 text-gray-900 font-medium min-w-[3rem] text-center">
                                {item.cantidad}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleCantidadChange(e, item.iteId, item.cantidad + 1, item.varianteProducto?.stockDisponible);
                                }}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={
                                  item.varianteProducto?.stockDisponible !== undefined &&
                                  item.varianteProducto?.stockDisponible !== null &&
                                  item.cantidad >= item.varianteProducto.stockDisponible
                                }
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              </button>
                            </div>
                            {item.varianteProducto?.stockDisponible !== undefined && 
                             item.varianteProducto?.stockDisponible !== null && (
                              <span className="text-sm text-gray-500">
                                Stock: {item.varianteProducto.stockDisponible}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              ${item.subTotal.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <p className="text-gray-500">No hay productos en el carrito</p>
                  </div>
                )}

                {/* Botón vaciar carrito */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleVaciarCarrito}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </div>

              {/* Resumen del pedido */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del pedido</h2>

                  {/* Cupón de descuento */}
                  <div className="mb-6">
                    {carrito.cupon ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold text-green-800">Cupón aplicado</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoverCupon}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            aria-label="Remover cupón"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-green-700 font-medium">{carrito.cupon.codigo}</p>
                        {carrito.cupon.descripcion && (
                          <p className="text-xs text-green-600 mt-1">{carrito.cupon.descripcion}</p>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={handleAplicarCupon} className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={codigoCupon}
                            onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                            placeholder="Código de cupón"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={aplicandoCupon}
                          />
                          <button
                            type="submit"
                            disabled={aplicandoCupon || !codigoCupon.trim()}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {aplicandoCupon ? '...' : 'Aplicar'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-medium">${carrito.subTotal.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </div>
                    {carrito.descuento > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento:</span>
                        <span className="font-medium">-${carrito.descuento.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Envío:</span>
                      <span className="font-medium">Calculado al finalizar</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total:</span>
                        <span>${carrito.total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated) {
                          // Guardar la ruta de retorno y redirigir a login
                          navigate('/login?returnUrl=/carrito');
                        } else {
                          navigate('/checkout');
                        }
                      }}
                      className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Proceder al pago
                    </button>
                    <Link
                      to="/"
                      className="block w-full text-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Continuar comprando
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
