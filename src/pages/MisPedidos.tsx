import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { pedidoService, type PedidoResumen } from '../services/pedido.service';
import { useAuth } from '../context/AuthContext';

export default function MisPedidos() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const tamañoPagina = 10;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?returnUrl=/mis-pedidos');
      return;
    }

    cargarPedidos();
  }, [isAuthenticated, navigate, pagina]);

  const cargarPedidos = async () => {
    try {
      setIsLoading(true);
      const response = await pedidoService.listarMisPedidos(pagina, tamañoPagina);
      if (response.exito && response.datos) {
        setPedidos(response.datos.items || []);
        setTotalRegistros(response.datos.paginacion?.totalRegistros || 0);
      } else {
        setPedidos([]);
        setTotalRegistros(0);
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      setPedidos([]);
      setTotalRegistros(0);
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${estadoInfo.color}`}>
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${estadoInfo.color}`}>
        {estadoInfo.texto}
      </span>
    );
  };

  const totalPaginas = Math.ceil(totalRegistros / tamañoPagina);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
            <p className="mt-2 text-gray-600">Gestiona y revisa todos tus pedidos</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Cargando pedidos...</p>
              </div>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes pedidos aún</h3>
              <p className="text-gray-500 mb-6">Cuando realices tu primer pedido, aparecerá aquí</p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ir a la tienda
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidos.map((pedido) => (
                <Link
                  key={pedido.pedId}
                  to={`/pedidos/${pedido.pedId}`}
                  className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">Pedido #{pedido.numeroPedido}</h3>
                        {obtenerBadgeEstado(pedido.estado)}
                      </div>
                      <p className="text-sm text-gray-500">{formatearFecha(pedido.fechaCreacion)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {obtenerBadgeEstadoPago(pedido.estadoPago)}
                        <p className="text-sm text-gray-600">
                          {pedido.totalItems} {pedido.totalItems === 1 ? 'producto' : 'productos'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ${pedido.total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-sm text-gray-500">Total</p>
                      </div>
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Página {pagina} de {totalPaginas}
                  </span>
                  <button
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                    disabled={pagina === totalPaginas}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
