import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import Swal from 'sweetalert2';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { pedidoService } from '../services/pedido.service';

export default function CheckoutPendiente() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pedidoId = searchParams.get('pedidoId');
  const [pedido, setPedido] = useState<{ numeroPedido?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargarPedido = async () => {
      if (!pedidoId) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo obtener la información del pedido',
          confirmButtonText: 'Ir al inicio',
        }).then(() => {
          navigate('/');
        });
        return;
      }

      try {
        const response = await pedidoService.obtenerPorId(pedidoId);
        if (response.exito && response.datos) {
          setPedido(response.datos);
        }
      } catch (error) {
        console.error('Error al cargar pedido:', error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarPedido();
  }, [pedidoId, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 text-lg">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar categorias={[]} tiendaNombre="Tienda" />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pago Pendiente</h1>
            <p className="text-gray-600">
              Tu pago está siendo procesado. Te notificaremos cuando se confirme el pago.
            </p>
          </div>

          {pedido?.numeroPedido && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Número de pedido</p>
              <p className="text-xl font-bold text-blue-600">#{pedido.numeroPedido}</p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              to={`/mi-cuenta?tab=pedidos`}
              className="block w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver mis pedidos
            </Link>
            <Link
              to="/"
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
