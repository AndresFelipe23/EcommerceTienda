import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/image.utils';
import { direccionService, type Direccion, type DireccionCreate } from '../services/direccion.service';
import { metodoPagoService, type MetodoPagoDisponible } from '../services/metodoPago.service';
import { pedidoService } from '../services/pedido.service';
import { mercadoPagoService } from '../services/mercadoPago.service';
import PagoForm from '../components/Checkout/PagoForm';

export default function CheckoutPage() {
  const { carrito, isLoading: carritoLoading } = useCart();
  const { isAuthenticated, usuario } = useAuth();
  const navigate = useNavigate();

  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPagoDisponible[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPedido, setIsCreatingPedido] = useState(false);

  // Estados para direcciones
  const [direccionEnvioSeleccionada, setDireccionEnvioSeleccionada] = useState<string>('');
  const [direccionFacturacionSeleccionada, setDireccionFacturacionSeleccionada] = useState<string>('');
  const [usarMismaDireccion, setUsarMismaDireccion] = useState(true);
  const [showFormDireccionEnvio, setShowFormDireccionEnvio] = useState(false);
  const [showFormDireccionFacturacion, setShowFormDireccionFacturacion] = useState(false);

  // Formulario de dirección
  const [formDireccion, setFormDireccion] = useState<DireccionCreate>({
    nombre: usuario?.nombre || '',
    apellido: usuario?.apellido || '',
    calle: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    pais: 'Colombia',
    telefono: usuario?.telefono || '',
    tipo: 'Envío',
  });

  // Método de pago seleccionado
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<string>('');
  const [notasPedido, setNotasPedido] = useState('');
  const [mostrarFormularioPago, setMostrarFormularioPago] = useState(false);
  const [pagoConfirmado, setPagoConfirmado] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?returnUrl=/checkout');
      return;
    }

    if (!carritoLoading && (!carrito || !carrito.items || carrito.items.length === 0)) {
      navigate('/carrito');
      return;
    }

    cargarDatos();
  }, [isAuthenticated, carrito, carritoLoading, navigate]);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);

      // Cargar direcciones y métodos de pago en paralelo
      const [direccionesResponse, metodosPagoResponse] = await Promise.all([
        direccionService.listar(),
        metodoPagoService.obtenerDisponibles(),
      ]);

      if (direccionesResponse.exito && direccionesResponse.datos) {
        setDirecciones(direccionesResponse.datos);
        // Seleccionar la primera dirección por defecto si existe
        if (direccionesResponse.datos.length > 0) {
          const direccionPorDefecto = direccionesResponse.datos.find(d => d.esPorDefecto) || direccionesResponse.datos[0];
          setDireccionEnvioSeleccionada(direccionPorDefecto.dirId || '');
          setDireccionFacturacionSeleccionada(direccionPorDefecto.dirId || '');
        }
      }

      if (metodosPagoResponse.exito && metodosPagoResponse.datos) {
        console.log('Métodos de pago disponibles:', metodosPagoResponse.datos);
        setMetodosPago(metodosPagoResponse.datos);
        // Seleccionar el primer método de pago por defecto
        if (metodosPagoResponse.datos.length > 0) {
          setMetodoPagoSeleccionado(metodosPagoResponse.datos[0].metId);
        }
      } else {
        console.error('Error al cargar métodos de pago:', metodosPagoResponse.mensaje);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar datos del checkout',
        confirmButtonText: 'Entendido',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCrearDireccion = async (tipo: 'envio' | 'facturacion') => {
    try {
      const response = await direccionService.crear(formDireccion);
      if (response.exito && response.datos) {
        // Recargar direcciones
        const direccionesResponse = await direccionService.listar();
        if (direccionesResponse.exito && direccionesResponse.datos) {
          setDirecciones(direccionesResponse.datos);
          
          // Seleccionar la nueva dirección
          if (tipo === 'envio') {
            setDireccionEnvioSeleccionada(response.datos.dirId || '');
            setShowFormDireccionEnvio(false);
          } else {
            setDireccionFacturacionSeleccionada(response.datos.dirId || '');
            setShowFormDireccionFacturacion(false);
          }
        }

        // Limpiar formulario
        setFormDireccion({
          nombre: usuario?.nombre || '',
          apellido: usuario?.apellido || '',
          calle: '',
          ciudad: '',
          estado: '',
          codigoPostal: '',
          pais: 'Colombia',
          telefono: usuario?.telefono || '',
          tipo: tipo === 'envio' ? 'Envío' : 'Facturación',
        });

        Swal.fire({
          icon: 'success',
          title: 'Dirección creada',
          text: 'La dirección se ha creado correctamente',
          confirmButtonText: 'Entendido',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.mensaje || 'Error al crear la dirección',
          confirmButtonText: 'Entendido',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al crear la dirección',
        confirmButtonText: 'Entendido',
      });
    }
  };

  const handleContinuarAlPago = () => {
    // Validaciones
    if (!direccionEnvioSeleccionada) {
      Swal.fire({
        icon: 'warning',
        title: 'Dirección requerida',
        text: 'Por favor, selecciona o crea una dirección de envío',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    if (!direccionFacturacionSeleccionada && !usarMismaDireccion) {
      Swal.fire({
        icon: 'warning',
        title: 'Dirección requerida',
        text: 'Por favor, selecciona o crea una dirección de facturación',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    if (!metodoPagoSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Método de pago requerido',
        text: 'Por favor, selecciona un método de pago',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    // Mostrar formulario de pago
    setMostrarFormularioPago(true);
  };

  const handlePagoConfirmado = async (datosPago: any) => {
    if (!carrito?.carId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el carrito',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    try {
      setIsCreatingPedido(true);

      // Obtener las direcciones seleccionadas
      const direccionEnvio = direcciones.find(d => d.dirId === direccionEnvioSeleccionada);
      const direccionFacturacion = usarMismaDireccion 
        ? direccionEnvio 
        : direcciones.find(d => d.dirId === direccionFacturacionSeleccionada);

      if (!direccionEnvio || !direccionFacturacion) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo obtener las direcciones seleccionadas',
          confirmButtonText: 'Entendido',
        });
        return;
      }

      // Convertir direcciones al formato requerido
      const direccionEnvioDto: DireccionCreate = {
        dirId: direccionEnvio.dirId,
        nombre: direccionEnvio.nombre,
        apellido: direccionEnvio.apellido,
        calle: direccionEnvio.calle,
        ciudad: direccionEnvio.ciudad,
        estado: direccionEnvio.estado,
        codigoPostal: direccionEnvio.codigoPostal,
        pais: direccionEnvio.pais,
        telefono: direccionEnvio.telefono,
        tipo: direccionEnvio.tipo,
      };

      const direccionFacturacionDto: DireccionCreate = {
        dirId: direccionFacturacion.dirId,
        nombre: direccionFacturacion.nombre,
        apellido: direccionFacturacion.apellido,
        calle: direccionFacturacion.calle,
        ciudad: direccionFacturacion.ciudad,
        estado: direccionFacturacion.estado,
        codigoPostal: direccionFacturacion.codigoPostal,
        pais: direccionFacturacion.pais,
        telefono: direccionFacturacion.telefono,
        tipo: direccionFacturacion.tipo,
      };

      // Crear pedido DESPUÉS del pago confirmado
      const response = await pedidoService.crearDesdeCarrito({
        carritoId: carrito.carId,
        metodoPagoId: metodoPagoSeleccionado,
        direccionEnvio: direccionEnvioDto,
        direccionFacturacion: direccionFacturacionDto,
        cuponId: carrito.cuponId,
        notas: notasPedido || undefined,
      });

      if (response.exito && response.datos) {
        setPagoConfirmado(true);
        // Limpiar datos temporales si existen
        localStorage.removeItem('pedidoTemporal');
        localStorage.removeItem('mercadoPagoInitPoint');
        
        Swal.fire({
          icon: 'success',
          title: '¡Pedido creado!',
          html: `
            <p>Tu pedido #${response.datos.numeroPedido} se ha creado exitosamente.</p>
            <p class="mt-2 text-sm text-gray-600">El pago ha sido procesado correctamente.</p>
          `,
          confirmButtonText: 'Ver pedido',
          confirmButtonColor: '#2563eb',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate(`/mi-cuenta?tab=pedidos`);
          } else {
            navigate('/');
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.mensaje || 'Error al crear el pedido',
          confirmButtonText: 'Entendido',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al crear el pedido. Por favor, intenta de nuevo.',
        confirmButtonText: 'Entendido',
      });
    } finally {
      setIsCreatingPedido(false);
      setMostrarFormularioPago(false);
    }
  };

  if (isLoading || carritoLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 text-lg">Cargando checkout...</p>
        </div>
      </div>
    );
  }

  if (!carrito || !carrito.items || carrito.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar categorias={[]} onSearch={() => {}} />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Carrito vacío</h1>
            <p className="text-gray-600 mb-8">No hay productos en tu carrito para proceder al checkout</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir a comprar
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar categorias={[]} onSearch={() => {}} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Compra</h1>
          <p className="text-gray-600">Revisa tu pedido y completa la información necesaria</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Formularios */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dirección de Envío */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Dirección de Envío</h2>
              
              {direcciones.length > 0 && !showFormDireccionEnvio ? (
                <div className="space-y-4">
                  <select
                    value={direccionEnvioSeleccionada}
                    onChange={(e) => setDireccionEnvioSeleccionada(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona una dirección</option>
                    {direcciones.map((direccion) => (
                      <option key={direccion.dirId} value={direccion.dirId}>
                        {direccion.nombre} {direccion.apellido} - {direccion.calle}, {direccion.ciudad}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowFormDireccionEnvio(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Agregar nueva dirección
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <input
                        type="text"
                        value={formDireccion.nombre}
                        onChange={(e) => setFormDireccion({ ...formDireccion, nombre: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                      <input
                        type="text"
                        value={formDireccion.apellido}
                        onChange={(e) => setFormDireccion({ ...formDireccion, apellido: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Calle *</label>
                    <input
                      type="text"
                      value={formDireccion.calle}
                      onChange={(e) => setFormDireccion({ ...formDireccion, calle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                      <input
                        type="text"
                        value={formDireccion.ciudad}
                        onChange={(e) => setFormDireccion({ ...formDireccion, ciudad: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <input
                        type="text"
                        value={formDireccion.estado}
                        onChange={(e) => setFormDireccion({ ...formDireccion, estado: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                      <input
                        type="text"
                        value={formDireccion.codigoPostal}
                        onChange={(e) => setFormDireccion({ ...formDireccion, codigoPostal: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                      <input
                        type="text"
                        value={formDireccion.pais}
                        onChange={(e) => setFormDireccion({ ...formDireccion, pais: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="text"
                        value={formDireccion.telefono}
                        onChange={(e) => setFormDireccion({ ...formDireccion, telefono: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCrearDireccion('envio')}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Guardar dirección
                    </button>
                    {direcciones.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowFormDireccionEnvio(false)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dirección de Facturación */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Dirección de Facturación</h2>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={usarMismaDireccion}
                    onChange={(e) => {
                      setUsarMismaDireccion(e.target.checked);
                      if (e.target.checked) {
                        setDireccionFacturacionSeleccionada(direccionEnvioSeleccionada);
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  Usar la misma dirección de envío
                </label>
              </div>

              {usarMismaDireccion ? (
                <p className="text-gray-600 text-sm">Se usará la misma dirección de envío para facturación</p>
              ) : direcciones.length > 0 && !showFormDireccionFacturacion ? (
                <div className="space-y-4">
                  <select
                    value={direccionFacturacionSeleccionada}
                    onChange={(e) => setDireccionFacturacionSeleccionada(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona una dirección</option>
                    {direcciones.map((direccion) => (
                      <option key={direccion.dirId} value={direccion.dirId}>
                        {direccion.nombre} {direccion.apellido} - {direccion.calle}, {direccion.ciudad}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowFormDireccionFacturacion(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Agregar nueva dirección
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mismo formulario que dirección de envío pero con tipo Facturación */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <input
                        type="text"
                        value={formDireccion.nombre}
                        onChange={(e) => setFormDireccion({ ...formDireccion, nombre: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                      <input
                        type="text"
                        value={formDireccion.apellido}
                        onChange={(e) => setFormDireccion({ ...formDireccion, apellido: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Calle *</label>
                    <input
                      type="text"
                      value={formDireccion.calle}
                      onChange={(e) => setFormDireccion({ ...formDireccion, calle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCrearDireccion('facturacion')}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Guardar dirección
                    </button>
                    {direcciones.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowFormDireccionFacturacion(false)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Método de Pago */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Método de Pago</h2>
              
              {metodosPago.length > 0 ? (
                <div className="space-y-3">
                  {metodosPago.map((metodo) => {
                    // Detectar Mercado Pago de forma más robusta
                    const tipoLower = metodo.tipo?.toLowerCase() || '';
                    const nombreLower = metodo.nombre?.toLowerCase() || '';
                    const esMercadoPago = tipoLower === 'mercadopago' || 
                                        tipoLower.includes('mercadopago') ||
                                        nombreLower.includes('mercado pago') ||
                                        nombreLower.includes('mercadopago');
                    
                    return (
                      <label
                        key={metodo.metId}
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          metodoPagoSeleccionado === metodo.metId
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="metodoPago"
                          value={metodo.metId}
                          checked={metodoPagoSeleccionado === metodo.metId}
                          onChange={(e) => setMetodoPagoSeleccionado(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        {metodo.iconoUrl ? (
                          <img src={getImageUrl(metodo.iconoUrl)} alt={metodo.nombre} className="w-8 h-8 object-contain" />
                        ) : esMercadoPago ? (
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                            </svg>
                          </div>
                        ) : null}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{metodo.nombre}</div>
                          {metodo.comisionPorcentaje && (
                            <div className="text-sm text-gray-500">Comisión: {metodo.comisionPorcentaje}%</div>
                          )}
                          {esMercadoPago && metodoPagoSeleccionado === metodo.metId && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                              <p className="font-medium">Serás redirigido a Mercado Pago para completar el pago de forma segura.</p>
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hay métodos de pago disponibles</p>
              )}
            </div>

            {/* Notas del Pedido */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Notas del Pedido (Opcional)</h2>
              <textarea
                value={notasPedido}
                onChange={(e) => setNotasPedido(e.target.value)}
                placeholder="Instrucciones especiales o comentarios adicionales..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                rows={4}
                disabled={mostrarFormularioPago}
              />
            </div>

            {/* Formulario de Pago */}
            {mostrarFormularioPago && metodoPagoSeleccionado && (
              <PagoForm
                metodoPago={metodosPago.find(m => m.metId === metodoPagoSeleccionado)!}
                total={carrito?.total || 0}
                direccionEnvio={direcciones.find(d => d.dirId === direccionEnvioSeleccionada) ? {
                  dirId: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.dirId,
                  nombre: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.nombre,
                  apellido: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.apellido,
                  calle: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.calle,
                  ciudad: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.ciudad,
                  estado: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.estado,
                  codigoPostal: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.codigoPostal,
                  pais: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.pais,
                  telefono: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.telefono,
                  tipo: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.tipo,
                } : formDireccion}
                direccionFacturacion={usarMismaDireccion 
                  ? (direcciones.find(d => d.dirId === direccionEnvioSeleccionada) ? {
                      dirId: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.dirId,
                      nombre: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.nombre,
                      apellido: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.apellido,
                      calle: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.calle,
                      ciudad: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.ciudad,
                      estado: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.estado,
                      codigoPostal: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.codigoPostal,
                      pais: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.pais,
                      telefono: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.telefono,
                      tipo: direcciones.find(d => d.dirId === direccionEnvioSeleccionada)!.tipo,
                    } : formDireccion)
                  : (direcciones.find(d => d.dirId === direccionFacturacionSeleccionada) ? {
                      dirId: direcciones.find(d => d.dirId === direccionFacturacionSeleccionada)!.dirId,
                      nombre: direcciones.find(d => d.dirId === direccionFacturacionSeleccionada)!.nombre,
                      apellido: direcciones.find(d => d.dirId === direccionFacturacionSeleccionada)!.apellido,
                      calle: direcciones.find(d => d.dirId === direccionFacturacionSeleccionada)!.calle,
                      ciudad: direcciones.find(d => d.dirId === direccionFacturacionSeleccionada)!.ciudad,
                      estado: direcciones.find(d => d.dirId === direccionFacturacionSeleccionada)!.estado,
                      codigoPostal: direcciones.find(d => d.dirId === direccionFacturacionSeleccionada)!.codigoPostal,
                      pais: direcciones.find(d => d.dirId === direccionFacturacionSeleccionada)!.pais,
                      telefono: direcciones.find(d => d.dirId === direccionFacturacionSeleccionada)!.telefono,
                      tipo: direcciones.find(d => d.dirId === direccionFacturacionSeleccionada)!.tipo,
                    } : formDireccion)}
                onPagoConfirmado={handlePagoConfirmado}
                onCancelar={() => setMostrarFormularioPago(false)}
              />
            )}
          </div>

          {/* Columna derecha - Resumen del Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del Pedido</h2>

              {/* Resumen simplificado: solo cantidad y valor */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cantidad de productos:</span>
                  <span className="font-medium text-gray-900">{carrito.totalItems}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valor total:</span>
                  <span className="text-xl font-bold text-gray-900">${carrito.total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
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
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span>${carrito.total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>

              {!mostrarFormularioPago ? (
                <button
                  type="button"
                  onClick={handleContinuarAlPago}
                  disabled={isCreatingPedido}
                  className="w-full mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar al Pago
                </button>
              ) : (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 text-center">
                    Completa el pago en el formulario de abajo
                  </p>
                </div>
              )}

              <Link
                to="/carrito"
                className="block w-full mt-3 text-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Volver al carrito
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
