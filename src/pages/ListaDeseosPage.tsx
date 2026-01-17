import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { listaDeseosService, type ListaDeseo } from '../services/listaDeseos.service';
import { getImageUrl } from '../utils/image.utils';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ListaDeseosPage() {
  const { isAuthenticated } = useAuth();
  const { agregarAlCarrito } = useCart();
  const navigate = useNavigate();
  const [listaDeseos, setListaDeseos] = useState<ListaDeseo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirigir a login si no está autenticado
      navigate('/login?returnUrl=/lista-deseos');
      return;
    }

    cargarListaDeseos();
  }, [isAuthenticated, navigate]);

  const cargarListaDeseos = async () => {
    try {
      setIsLoading(true);
      const response = await listaDeseosService.obtenerLista();
      if (response.exito && response.datos) {
        setListaDeseos(response.datos);
      } else {
        setListaDeseos([]);
      }
    } catch (error) {
      setListaDeseos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminar = async (item: ListaDeseo) => {
    const result = await Swal.fire({
      icon: 'question',
      title: '¿Eliminar de lista de deseos?',
      text: '¿Estás seguro de que deseas eliminar este producto de tu lista de deseos?',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });

    if (result.isConfirmed) {
      try {
        const response = await listaDeseosService.eliminar(item.lisId);
        if (response.exito) {
          await Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'Producto eliminado de tu lista de deseos',
            timer: 2000,
            showConfirmButton: false,
          });
          cargarListaDeseos();
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.mensaje || 'No se pudo eliminar de la lista de deseos',
          });
        }
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al eliminar de la lista de deseos',
        });
      }
    }
  };

  const handleAgregarAlCarrito = async (item: ListaDeseo) => {
    if (!item.producto) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Información del producto no disponible',
      });
      return;
    }

    // Si el item tiene una variante específica, usar esa
    // Si no, necesitamos obtener la primera variante del producto
    let varianteProductoId = item.varianteProductoId;

    // Si no hay variante específica, necesitamos cargar el producto completo para obtener sus variantes
    if (!varianteProductoId) {
      // Para productos sin variante específica, necesitamos obtener el producto completo
      // Por ahora, redirigir al detalle del producto para que el usuario seleccione la variante
      navigate(`/producto/${item.producto.slug}`);
      return;
    }

    try {
      const exito = await agregarAlCarrito({
        varianteProductoId,
        cantidad: 1,
      });

      if (exito) {
        await Swal.fire({
          icon: 'success',
          title: '¡Agregado!',
          text: 'Producto agregado al carrito',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo agregar el producto al carrito',
        });
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al agregar el producto al carrito',
      });
    }
  };

  if (!isAuthenticated) {
    return null; // Se redirigirá en el useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Lista de Deseos</h1>
            <p className="text-gray-600">Productos que has guardado para comprar más tarde</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Cargando lista de deseos...</p>
            </div>
          ) : listaDeseos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Tu lista de deseos está vacía</h2>
              <p className="text-gray-600 mb-6">Agrega productos a tu lista de deseos para guardarlos para más tarde</p>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explorar productos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listaDeseos.map((item) => {
                const producto = item.producto;
                if (!producto) return null;

                const imagenUrl = producto.imagenPrincipal || getImageUrl(null);
                const precio = item.varianteProducto?.precio || producto.precioBase;
                const precioComparacion = item.varianteProducto?.precioComparacion || producto.precioComparacion;

                return (
                  <div
                    key={item.lisId}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden group"
                  >
                    <Link to={`/producto/${producto.slug}`} className="block">
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={getImageUrl(imagenUrl)}
                          alt={producto.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getImageUrl(null);
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEliminar(item);
                            }}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Eliminar de lista de deseos"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link to={`/producto/${producto.slug}`}>
                        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                          {producto.nombre}
                        </h3>
                      </Link>
                      {producto.descripcionCorta && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{producto.descripcionCorta}</p>
                      )}
                      
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg font-bold text-gray-900">
                          ${precio.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                        {precioComparacion && precioComparacion > precio && (
                          <span className="text-sm text-gray-500 line-through">
                            ${precioComparacion.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAgregarAlCarrito(item);
                          }}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Agregar al carrito
                        </button>
                        <Link
                          to={`/producto/${producto.slug}`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Ver
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
