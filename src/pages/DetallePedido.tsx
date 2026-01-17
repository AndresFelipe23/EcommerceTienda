import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { pedidoService, type Pedido } from '../services/pedido.service';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/image.utils';

export default function DetallePedido() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?returnUrl=/pedidos/' + id);
      return;
    }

    if (id) {
      cargarPedido(id);
    }
  }, [isAuthenticated, navigate, id]);

  const cargarPedido = async (pedidoId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await pedidoService.obtenerPorId(pedidoId);
      if (response.exito && response.datos) {
        setPedido(response.datos);
      } else {
        setError(response.mensaje || 'Error al cargar el pedido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const obtenerBadgeEstado = (estado: string) => {
    const estados: Record<string, { color: string; texto: string }> = {
      Pendiente: { color: 'bg-yellow-100 text-yellow-800', texto: 'Pendiente' },
      Confirmado: { color: 'bg-blue-100 text-blue-800', texto: 'Confirmado' },
      EnPreparacion: { color: 'bg-purple-100 text-purple-800', texto: 'En Preparación' },
      EnEnvio: { color: 'bg-indigo-100 text-indigo-800', texto: 'En Envío' },
      Entregado: { color: 'bg-green-100 text-green-800', texto: 'Entregado' },
      Cancelado: { color: 'bg-red-100 text-red-800', texto: 'Cancelado' },
    };

    const estadoInfo = estados[estado] || { color: 'bg-gray-100 text-gray-800', texto: estado };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${estadoInfo.color}`}>
        {estadoInfo.texto}
      </span>
    );
  };

  const obtenerBadgeEstadoPago = (estadoPago: string) => {
    const estados: Record<string, { color: string; texto: string }> = {
      Pendiente: { color: 'bg-yellow-100 text-yellow-800', texto: 'Pago Pendiente' },
      Pagado: { color: 'bg-green-100 text-green-800', texto: 'Pagado' },
      Reembolsado: { color: 'bg-red-100 text-red-800', texto: 'Reembolsado' },
    };

    const estadoInfo = estados[estadoPago] || { color: 'bg-gray-100 text-gray-800', texto: estadoPago };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${estadoInfo.color}`}>
        {estadoInfo.texto}
      </span>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/mis-pedidos"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-6"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Mis Pedidos
          </Link>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Cargando pedido...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <Link
                  to="/mis-pedidos"
                  className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Volver a Mis Pedidos
                </Link>
              </div>
            </div>
          ) : pedido ? (
            <div className="space-y-6">
              {/* Encabezado del pedido */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pedido #{pedido.numeroPedido}</h1>
                    <p className="text-sm text-gray-500 mt-1">Realizado el {formatearFecha(pedido.fechaCreacion)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {obtenerBadgeEstado(pedido.estado)}
                    {obtenerBadgeEstadoPago(pedido.estadoPago)}
                  </div>
                </div>

                {pedido.metodoPago && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Método de pago:</span> {pedido.metodoPago}
                    </p>
                  </div>
                )}
              </div>

              {/* Items del pedido */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos</h2>
                <div className="space-y-4">
                  {pedido.items && pedido.items.length > 0 ? (
                    pedido.items.map((item) => (
                      <div key={item.itePedId} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.nombreProducto}</h3>
                          {item.descripcionVariante && (
                            <p className="text-sm text-gray-500 mt-1">{item.descripcionVariante}</p>
                          )}
                          {item.sku && (
                            <p className="text-xs text-gray-400 mt-1">SKU: {item.sku}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-2">Cantidad: {item.cantidad}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ${item.precioTotal.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${item.precioUnitario.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} c/u
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay productos en este pedido</p>
                  )}
                </div>
              </div>

              {/* Resumen de totales */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">${pedido.subTotal.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                  {pedido.impuestos > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Impuestos:</span>
                      <span className="text-gray-900">${pedido.impuestos.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </div>
                  )}
                  {pedido.costoEnvio > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Costo de envío:</span>
                      <span className="text-gray-900">${pedido.costoEnvio.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </div>
                  )}
                  {pedido.descuentos > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Descuentos:</span>
                      <span>-${pedido.descuentos.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ${pedido.total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <Footer />
    </>
  );
}
