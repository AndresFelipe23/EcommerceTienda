import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { direccionService, type Direccion, type DireccionCreate, type DireccionUpdate } from '../services/direccion.service';
import { pedidoService, type PedidoResumen } from '../services/pedido.service';
import { Link, useNavigate } from 'react-router';
import Navbar from '../components/Layout/Navbar';

type Tab = 'perfil' | 'direcciones' | 'pedidos' | 'seguridad';

export default function MiCuenta() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDireccion, setEditingDireccion] = useState<Direccion | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('perfil');
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [isLoadingPedidos, setIsLoadingPedidos] = useState(false);

  useEffect(() => {
    cargarDirecciones();
  }, []);

  useEffect(() => {
    if (activeTab === 'pedidos') {
      cargarPedidos();
    }
  }, [activeTab]);

  const cargarDirecciones = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await direccionService.listar();
      if (response.exito && response.datos) {
        setDirecciones(response.datos);
      } else {
        setError(response.mensaje || 'Error al cargar direcciones');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
      return;
    }

    try {
      const response = await direccionService.eliminar(id);
      if (response.exito) {
        await cargarDirecciones();
      } else {
        alert(response.mensaje || 'Error al eliminar dirección');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleEditar = (direccion: Direccion) => {
    setEditingDireccion(direccion);
    setShowForm(true);
  };

  const handleNueva = () => {
    setEditingDireccion(null);
    setShowForm(true);
  };

  const handleCerrarForm = () => {
    setShowForm(false);
    setEditingDireccion(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cargarPedidos = async () => {
    try {
      setIsLoadingPedidos(true);
      const response = await pedidoService.listarMisPedidos(1, 5); // Solo mostrar los 5 más recientes
      if (response.exito && response.datos) {
        setPedidos(response.datos.items || []);
      } else {
        setPedidos([]);
      }
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      setPedidos([]);
    } finally {
      setIsLoadingPedidos(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${estadoInfo.color}`}>
        {estadoInfo.texto}
      </span>
    );
  };

  if (!usuario) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Debes iniciar sesión para ver tu cuenta</p>
            <Link to="/login" className="text-blue-600 hover:text-blue-500">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Banner del perfil */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-blue-600 text-4xl font-bold shadow-xl">
                {usuario.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">{usuario.nombre} {usuario.apellido || ''}</h1>
                <p className="text-blue-100 mt-1">{usuario.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('perfil')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'perfil'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi Perfil
              </button>
              <button
                onClick={() => setActiveTab('direcciones')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'direcciones'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Direcciones
              </button>
              <button
                onClick={() => setActiveTab('pedidos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'pedidos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Mis Pedidos
              </button>
              <button
                onClick={() => setActiveTab('seguridad')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'seguridad'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Seguridad
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido de las tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'perfil' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Información Personal */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Editar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-2">Nombre</label>
                      <p className="text-gray-900 font-medium">{usuario.nombre}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-2">Apellido</label>
                      <p className="text-gray-900 font-medium">{usuario.apellido || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-2">Email</label>
                      <p className="text-gray-900 font-medium">{usuario.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-2">Teléfono</label>
                      <p className="text-gray-900 font-medium">{usuario.telefono || 'No especificado'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('direcciones')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <span className="text-blue-600 font-medium">Ver Direcciones</span>
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setActiveTab('pedidos')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <span className="text-green-600 font-medium">Mis Pedidos</span>
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <span className="text-red-600 font-medium">Cerrar Sesión</span>
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'direcciones' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Mis Direcciones</h2>
                <button
                  onClick={handleNueva}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nueva Dirección
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600">Cargando direcciones...</p>
                </div>
              ) : direcciones.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-500 mb-4">No tienes direcciones registradas</p>
                  <button
                    onClick={handleNueva}
                    className="px-6 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Agregar Primera Dirección
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {direcciones.map((direccion) => (
                    <div
                      key={direccion.dirId}
                      className="border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all bg-white"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {direccion.nombre} {direccion.apellido || ''}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {direccion.esPorDefecto && (
                                <span className="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 rounded border border-blue-100">
                                  Por defecto
                                </span>
                              )}
                              <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-50 rounded border border-gray-100">
                                {direccion.tipo === 'Shipping' ? 'Envío' : 'Facturación'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 mb-4">
                        <p>{direccion.calle}</p>
                        <p>{[direccion.ciudad, direccion.estado, direccion.codigoPostal].filter(Boolean).join(', ')}</p>
                        {direccion.pais && <p>{direccion.pais}</p>}
                        {direccion.telefono && (
                          <p className="flex items-center mt-2">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {direccion.telefono}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleEditar(direccion)}
                          className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => direccion.dirId && handleEliminar(direccion.dirId)}
                          className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'pedidos' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Mis Pedidos</h2>
                <Link
                  to="/mis-pedidos"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Ver todos →
                </Link>
              </div>

              {isLoadingPedidos ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600">Cargando pedidos...</p>
                </div>
              ) : pedidos.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-gray-500 mb-4">No tienes pedidos aún</p>
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
                      className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">Pedido #{pedido.numeroPedido}</h3>
                            {obtenerBadgeEstado(pedido.estado)}
                          </div>
                          <p className="text-sm text-gray-500">{formatearFecha(pedido.fechaCreacion)}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {pedido.totalItems} {pedido.totalItems === 1 ? 'producto' : 'productos'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ${pedido.total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                          <svg className="w-5 h-5 text-gray-400 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {pedidos.length >= 5 && (
                    <div className="pt-4 border-t border-gray-200">
                      <Link
                        to="/mis-pedidos"
                        className="block text-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Ver todos los pedidos
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'seguridad' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Seguridad y Contraseña</h2>
              <div className="max-w-2xl">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Actual</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ingresa tu contraseña actual"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ingresa una nueva contraseña"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirma tu nueva contraseña"
                    />
                  </div>
                  <button className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                    Actualizar Contraseña
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Formulario de Dirección */}
        {showForm && (
          <FormDireccion
            direccion={editingDireccion}
            onClose={handleCerrarForm}
            onSuccess={cargarDirecciones}
          />
        )}
      </div>
    </>
  );
}

// Componente para el formulario de dirección
function FormDireccion({
  direccion,
  onClose,
  onSuccess,
}: {
  direccion: Direccion | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<DireccionCreate>({
    nombre: direccion?.nombre || '',
    apellido: direccion?.apellido || '',
    calle: direccion?.calle || '',
    ciudad: direccion?.ciudad || '',
    estado: direccion?.estado || '',
    codigoPostal: direccion?.codigoPostal || '',
    pais: direccion?.pais || '',
    telefono: direccion?.telefono || '',
    tipo: direccion?.tipo || 'Shipping',
    esPorDefecto: direccion?.esPorDefecto || false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let response;
      if (direccion?.dirId) {
        // Actualizar
        const updateData: DireccionUpdate = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          calle: formData.calle,
          ciudad: formData.ciudad,
          estado: formData.estado,
          codigoPostal: formData.codigoPostal,
          pais: formData.pais,
          telefono: formData.telefono,
          tipo: formData.tipo,
          esPorDefecto: formData.esPorDefecto,
          dirId: direccion.dirId,
        };
        response = await direccionService.actualizar(updateData);
      } else {
        // Crear
        response = await direccionService.crear(formData);
      }

      if (response.exito) {
        onSuccess();
        onClose();
      } else {
        setError(response.mensaje || 'Error al guardar dirección');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {direccion ? 'Editar Dirección' : 'Nueva Dirección'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calle y Número <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.calle}
                  onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.codigoPostal}
                    onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.pais}
                    onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'Shipping' | 'Billing' })}
                  disabled={isLoading}
                >
                  <option value="Shipping">Envío</option>
                  <option value="Billing">Facturación</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.esPorDefecto}
                    onChange={(e) => setFormData({ ...formData, esPorDefecto: e.target.checked })}
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-700">Marcar como dirección por defecto</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : direccion ? 'Actualizar Dirección' : 'Guardar Dirección'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
