import { useState, useEffect } from 'react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { tiendaService } from '../services/tienda.service';
import { categoriaService, type CategoriaArbol } from '../services/categoria.service';
import Swal from 'sweetalert2';

export default function Contacto() {
  const [categorias, setCategorias] = useState<CategoriaArbol[]>([]);
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
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        const tiendaResponse = await tiendaService.obtenerActual();
        if (tiendaResponse.exito && tiendaResponse.datos) {
          const tienda = tiendaResponse.datos;
          const tiendaId = tienda.tieId;
          
          // Guardar información de la tienda
          setTiendaInfo({
            nombre: tienda.nombre,
            email: tienda.email,
            telefono: tienda.telefono,
            whatsapp: tienda.whatsapp,
            direccion: tienda.direccion,
            ciudad: tienda.ciudad,
            estado: tienda.estado,
            codigoPostal: tienda.codigoPostal,
            pais: tienda.pais,
          });

          // Parsear configuración JSON
          if (tienda.configuracionJson && tienda.configuracionJson.trim() !== '') {
            try {
              const parsedConfig = JSON.parse(tienda.configuracionJson);
              setConfiguracion({
                redesSociales: parsedConfig.redesSociales,
                horarios: parsedConfig.horarios,
              });
            } catch (e) {
              console.error('Error al parsear configuracionJson:', e);
            }
          }
          
          const categoriasResponse = await categoriaService.obtenerArbol(tiendaId);
          if (categoriasResponse.exito && categoriasResponse.datos) {
            setCategorias(categoriasResponse.datos);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.nombre || !formData.email || !formData.mensaje) {
      await Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor, completa todos los campos obligatorios.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      await Swal.fire({
        icon: 'error',
        title: 'Email inválido',
        text: 'Por favor, ingresa un email válido.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implementar envío del formulario al backend
      // Por ahora, simulamos el envío
      await new Promise(resolve => setTimeout(resolve, 1000));

      await Swal.fire({
        icon: 'success',
        title: '¡Mensaje enviado!',
        text: 'Gracias por contactarnos. Te responderemos pronto.',
        confirmButtonColor: '#2563eb'
      });

      // Limpiar formulario
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: ''
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo enviar el mensaje. Por favor, intenta de nuevo.',
        confirmButtonColor: '#2563eb'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Construir dirección completa
  const direccionCompleta = [
    tiendaInfo?.direccion,
    tiendaInfo?.ciudad,
    tiendaInfo?.estado,
    tiendaInfo?.codigoPostal,
    tiendaInfo?.pais
  ].filter(Boolean).join(', ') || 'Dirección no disponible';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        categorias={categorias} 
        tiendaNombre={tiendaInfo?.nombre || 'Tienda'}
        tiendaTelefono={tiendaInfo?.telefono}
        tiendaWhatsapp={tiendaInfo?.whatsapp}
        tiendaEmail={tiendaInfo?.email}
        tiendaCiudad={tiendaInfo?.ciudad}
        tiendaEstado={tiendaInfo?.estado}
        configuracion={configuracion}
      />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
              Contacto
            </h1>
            <p className="text-xl text-center text-blue-100 max-w-2xl mx-auto">
              Estamos aquí para ayudarte. Contáctanos y te responderemos lo antes posible.
            </p>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Información de Contacto */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Información de Contacto</h2>
                
                <div className="space-y-6 mb-8">
                  {tiendaInfo?.telefono && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Teléfono</h3>
                        <a href={`tel:${tiendaInfo.telefono}`} className="text-blue-600 hover:text-blue-700">
                          {tiendaInfo.telefono}
                        </a>
                      </div>
                    </div>
                  )}

                  {tiendaInfo?.whatsapp && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">WhatsApp</h3>
                        <a 
                          href={`https://wa.me/${tiendaInfo.whatsapp.replace(/[^0-9]/g, '')}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700"
                        >
                          {tiendaInfo.whatsapp}
                        </a>
                      </div>
                    </div>
                  )}

                  {tiendaInfo?.email && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Email</h3>
                        <a href={`mailto:${tiendaInfo.email}`} className="text-blue-600 hover:text-blue-700">
                          {tiendaInfo.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {direccionCompleta !== 'Dirección no disponible' && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Dirección</h3>
                        <p className="text-gray-600">{direccionCompleta}</p>
                      </div>
                    </div>
                  )}

                  {(configuracion?.horarios?.lunesAViernes || configuracion?.horarios?.sabado || configuracion?.horarios?.domingo) && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Horario de Atención</h3>
                        {configuracion.horarios.lunesAViernes && (
                          <p className="text-gray-600">Lunes - Viernes: {configuracion.horarios.lunesAViernes}</p>
                        )}
                        {configuracion.horarios.sabado && (
                          <p className="text-gray-600">Sábado: {configuracion.horarios.sabado}</p>
                        )}
                        {configuracion.horarios.domingo && (
                          <p className="text-gray-600">Domingo: {configuracion.horarios.domingo}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Redes Sociales */}
                  {configuracion?.redesSociales && Object.values(configuracion.redesSociales).some(Boolean) && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Síguenos</h3>
                        <div className="flex flex-wrap gap-3">
                          {configuracion.redesSociales.facebook && (
                            <a 
                              href={configuracion.redesSociales.facebook} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                              title="Facebook"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                            </a>
                          )}
                          {configuracion.redesSociales.instagram && (
                            <a 
                              href={configuracion.redesSociales.instagram} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-pink-600 hover:text-pink-700"
                              title="Instagram"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                            </a>
                          )}
                          {configuracion.redesSociales.twitter && (
                            <a 
                              href={configuracion.redesSociales.twitter} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-500"
                              title="Twitter"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Formulario de Contacto */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Envíanos un Mensaje</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+57 300 000 0000"
                    />
                  </div>

                  <div>
                    <label htmlFor="asunto" className="block text-sm font-medium text-gray-700 mb-2">
                      Asunto
                    </label>
                    <select
                      id="asunto"
                      name="asunto"
                      value={formData.asunto}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecciona un asunto</option>
                      <option value="consulta">Consulta General</option>
                      <option value="pedido">Consulta sobre Pedido</option>
                      <option value="devolucion">Devolución o Reembolso</option>
                      <option value="sugerencia">Sugerencia</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Escribe tu mensaje aquí..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

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
    </div>
  );
}
