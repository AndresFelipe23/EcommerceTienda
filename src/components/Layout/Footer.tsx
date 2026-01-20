import { Link } from 'react-router';
import type { CategoriaArbol } from '../../services/categoria.service';

interface Configuracion {
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
  };
}

interface FooterProps {
  tiendaNombre?: string;
  tiendaEmail?: string;
  tiendaTelefono?: string;
  tiendaWhatsapp?: string;
  tiendaDireccion?: string;
  tiendaCiudad?: string;
  tiendaEstado?: string;
  tiendaCodigoPostal?: string;
  tiendaPais?: string;
  categorias?: CategoriaArbol[];
  configuracion?: Configuracion | null;
}

export default function Footer({
  tiendaNombre = 'Tu Tienda',
  tiendaEmail,
  tiendaTelefono,
  tiendaWhatsapp,
  tiendaDireccion,
  tiendaCiudad,
  tiendaEstado,
  tiendaCodigoPostal,
  tiendaPais,
  categorias = [],
  configuracion,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar suscripción al newsletter
  };

  // Obtener categorías padre para el footer (máximo 6)
  const categoriasFooter = categorias.filter(cat => cat.activo).slice(0, 6);

  // Redes sociales desde la configuración JSON
  const redesSociales = configuracion?.redesSociales || {};
  
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Barra superior: Información importante, Contacto rápido, Idioma/Moneda */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            {/* Lado izquierdo: Información importante */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Mensaje de envío gratis */}
              <div className="text-gray-300 flex items-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Envío gratis para pedidos superiores a $100</span>
              </div>
              
              {/* Horarios de atención (si están configurados) */}
              {configuracion?.horarios?.lunesAViernes && (
                <div className="text-gray-300 flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Lun-Vie: {configuracion.horarios.lunesAViernes}</span>
                </div>
              )}
              
              {/* Teléfono de contacto (si está disponible) */}
              {tiendaTelefono && (
                <div className="text-gray-300 flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${tiendaTelefono}`} className="hover:text-white transition-colors">
                    {tiendaTelefono}
                  </a>
                </div>
              )}
              
              {/* WhatsApp (si está disponible) */}
              {tiendaWhatsapp && (
                <div className="text-gray-300 flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <a 
                    href={`https://wa.me/${tiendaWhatsapp.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
              )}
            </div>
            
            {/* Lado derecho: Email de contacto (si está disponible) */}
            {tiendaEmail && (
              <div className="flex items-center gap-4">
                <div className="text-gray-300 flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${tiendaEmail}`} className="hover:text-white transition-colors">
                    {tiendaEmail}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Sección principal del footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Información de la tienda */}
          <div className="lg:col-span-1">
            <h3 className="text-white text-xl font-bold mb-6">
              {tiendaNombre}
            </h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Tu destino para encontrar los mejores productos. Calidad, estilo y servicio excepcional.
            </p>
            
            {/* Información de contacto */}
            <div className="space-y-3 mb-6">
              {(tiendaDireccion || tiendaCiudad || tiendaEstado) && (
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="text-gray-400 text-sm">
                    {tiendaDireccion && <div>{tiendaDireccion}</div>}
                    {(tiendaCiudad || tiendaEstado || tiendaCodigoPostal) && (
                      <div className="mt-1">
                        {tiendaCiudad && <span>{tiendaCiudad}</span>}
                        {tiendaCiudad && tiendaEstado && <span>, </span>}
                        {tiendaEstado && <span>{tiendaEstado}</span>}
                        {tiendaCodigoPostal && <span> {tiendaCodigoPostal}</span>}
                      </div>
                    )}
                    {tiendaPais && <div className="mt-1">{tiendaPais}</div>}
                  </div>
                </div>
              )}
              {tiendaTelefono && (
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${tiendaTelefono}`} className="text-gray-400 text-sm hover:text-white transition-colors">
                    {tiendaTelefono}
                  </a>
                </div>
              )}
              {tiendaWhatsapp && (
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <a href={`https://wa.me/${tiendaWhatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-white transition-colors">
                    {tiendaWhatsapp}
                  </a>
                </div>
              )}
              {tiendaEmail && (
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${tiendaEmail}`} className="text-gray-400 text-sm hover:text-white transition-colors">
                    {tiendaEmail}
                  </a>
                </div>
              )}
            </div>

            {/* Horarios de atención (si están configurados) */}
            {configuracion?.horarios && (configuracion.horarios.lunesAViernes || configuracion.horarios.sabado || configuracion.horarios.domingo) && (
              <div className="mb-6">
                <h5 className="text-white text-sm font-semibold mb-2">Horarios de Atención</h5>
                <div className="text-gray-400 text-sm space-y-1">
                  {configuracion.horarios.lunesAViernes && (
                    <div>Lunes - Viernes: {configuracion.horarios.lunesAViernes}</div>
                  )}
                  {configuracion.horarios.sabado && (
                    <div>Sábado: {configuracion.horarios.sabado}</div>
                  )}
                  {configuracion.horarios.domingo && (
                    <div>Domingo: {configuracion.horarios.domingo}</div>
                  )}
                </div>
              </div>
            )}

            {/* Redes sociales */}
            {(redesSociales.facebook || redesSociales.instagram || redesSociales.twitter || redesSociales.tiktok || redesSociales.youtube || redesSociales.linkedin || redesSociales.pinterest) && (
              <div className="flex items-center space-x-4">
                {redesSociales.facebook && (
                  <a 
                    href={redesSociales.facebook} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {redesSociales.instagram && (
                  <a 
                    href={redesSociales.instagram} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full text-gray-400 hover:bg-pink-600 hover:text-white transition-all duration-300"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {redesSociales.twitter && (
                  <a 
                    href={redesSociales.twitter} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full text-gray-400 hover:bg-blue-400 hover:text-white transition-all duration-300"
                    aria-label="Twitter/X"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                )}
                {redesSociales.tiktok && (
                  <a 
                    href={redesSociales.tiktok} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full text-gray-400 hover:bg-black hover:text-white transition-all duration-300"
                    aria-label="TikTok"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                    </svg>
                  </a>
                )}
                {redesSociales.youtube && (
                  <a 
                    href={redesSociales.youtube} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-300"
                    aria-label="YouTube"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
                {redesSociales.linkedin && (
                  <a 
                    href={redesSociales.linkedin} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full text-gray-400 hover:bg-blue-700 hover:text-white transition-all duration-300"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {redesSociales.pinterest && (
                  <a 
                    href={redesSociales.pinterest} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-300"
                    aria-label="Pinterest"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19c-.721 0-1.418-.109-2.073-.312.286-.465.713-1.227.871-1.878.095-.362.055-.488-.19-.808-.383-.504-1.146-2.143-1.146-3.449 0-3.182 2.432-5.829 6.344-5.829 3.324 0 5.163 2.383 5.163 5.549 0 3.533-2.239 6.527-5.456 6.527-1.074 0-2.083-.558-2.428-1.304l-.658 2.51c-.238.923-.881 2.069-1.312 2.77A11.99 11.99 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Categorías */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-6">
              Categorías
            </h4>
            {categoriasFooter.length > 0 ? (
              <ul className="space-y-3">
                {categoriasFooter.map((categoria) => (
                  <li key={categoria.catId}>
                    <Link 
                      to={`/categoria/${categoria.slug}`} 
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {categoria.nombre}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-3">
                <li>
                  <Link to="/productos" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Todos los Productos
                  </Link>
                </li>
                <li>
                  <Link to="/ofertas" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Ofertas
                  </Link>
                </li>
                <li>
                  <Link to="/nuevos" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Nuevos Productos
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-6">
              Ayuda
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/rastrear-pedido" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Rastrear Pedido
                </Link>
              </li>
              <li>
                <Link to="/devoluciones" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link to="/envios" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Envíos
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contacto
                </Link>
              </li>
              <li>
                <Link 
                  to={configuracion?.politicas?.privacidad || "/politica-privacidad"} 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link 
                  to={configuracion?.politicas?.terminos || "/terminos"} 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Términos y Condiciones
                </Link>
              </li>
              {configuracion?.politicas?.devoluciones && (
                <li>
                  <Link 
                    to={configuracion.politicas.devoluciones} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Política de Devoluciones
                  </Link>
                </li>
              )}
              {configuracion?.politicas?.envios && (
                <li>
                  <Link 
                    to={configuracion.politicas.envios} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Política de Envíos
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-6">
              Newsletter
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              Suscríbete para recibir ofertas exclusivas y novedades
            </p>
            <form onSubmit={handleNewsletter} className="space-y-3">
              <div>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="tu@email.com"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <button 
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Suscribirse
              </button>
            </form>
            <p className="text-gray-500 text-xs mt-4">
              Al suscribirte, aceptas nuestra política de privacidad
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Copyright */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Copyright © {currentYear} <span className="text-white font-semibold">{tiendaNombre}</span>. Todos los derechos reservados.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Diseñado con ❤️ para ofrecerte la mejor experiencia de compra
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
