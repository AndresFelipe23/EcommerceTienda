// Usar enlaces simples en lugar de Link de react-router si no hay routing configurado
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, CreditCard, Truck, Shield, HeadphonesIcon } from 'lucide-react';

interface FooterProps {
  tiendaNombre?: string;
  tiendaEmail?: string;
  tiendaTelefono?: string;
  tiendaDireccion?: string;
}

export default function Footer({
  tiendaNombre = 'Tu Tienda',
  tiendaEmail,
  tiendaTelefono,
  tiendaDireccion,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Sección principal del footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Información de la tienda */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">{tiendaNombre}</h3>
            <p className="text-sm text-gray-400 mb-4">
              Tu tienda de confianza para encontrar los mejores productos al mejor precio.
            </p>
            {tiendaDireccion && (
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-sm">{tiendaDireccion}</span>
              </div>
            )}
            {tiendaTelefono && (
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4" />
                <a href={`tel:${tiendaTelefono}`} className="text-sm hover:text-white transition-colors">
                  {tiendaTelefono}
                </a>
              </div>
            )}
            {tiendaEmail && (
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${tiendaEmail}`} className="text-sm hover:text-white transition-colors">
                  {tiendaEmail}
                </a>
              </div>
            )}
            {/* Redes sociales */}
            <div className="flex gap-3 mt-4">
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-blue-400 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm hover:text-white transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/productos" className="text-sm hover:text-white transition-colors">
                  Productos
                </a>
              </li>
              <li>
                <a href="/categorias" className="text-sm hover:text-white transition-colors">
                  Categorías
                </a>
              </li>
              <li>
                <a href="/ofertas" className="text-sm hover:text-white transition-colors">
                  Ofertas
                </a>
              </li>
              <li>
                <a href="/nosotros" className="text-sm hover:text-white transition-colors">
                  Nosotros
                </a>
              </li>
              <li>
                <a href="/contacto" className="text-sm hover:text-white transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Ayuda y soporte */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Ayuda y Soporte</h3>
            <ul className="space-y-2">
              <li>
                <a href="/preguntas-frecuentes" className="text-sm hover:text-white transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <a href="/envios" className="text-sm hover:text-white transition-colors">
                  Envíos y Devoluciones
                </a>
              </li>
              <li>
                <a href="/politica-privacidad" className="text-sm hover:text-white transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="/terminos-condiciones" className="text-sm hover:text-white transition-colors">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="/garantias" className="text-sm hover:text-white transition-colors">
                  Garantías
                </a>
              </li>
              <li>
                <a href="/soporte" className="text-sm hover:text-white transition-colors">
                  Soporte Técnico
                </a>
              </li>
            </ul>
          </div>

          {/* Información adicional */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Información</h3>
            <div className="space-y-4">
              {/* Métodos de pago */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Métodos de Pago
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded">Tarjeta</span>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded">Efectivo</span>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded">Transferencia</span>
                </div>
              </div>

              {/* Envíos */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Envíos
                </h4>
                <p className="text-xs text-gray-400">
                  Envíos a todo el país. Entrega rápida y segura.
                </p>
              </div>

              {/* Seguridad */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Compra Segura
                </h4>
                <p className="text-xs text-gray-400">
                  Tus datos están protegidos. Compra con confianza.
                </p>
              </div>

              {/* Atención al cliente */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <HeadphonesIcon className="w-4 h-4" />
                  Atención 24/7
                </h4>
                <p className="text-xs text-gray-400">
                  Estamos aquí para ayudarte cuando lo necesites.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © {currentYear} {tiendaNombre}. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="/politica-privacidad" className="text-gray-400 hover:text-white transition-colors">
                Privacidad
              </a>
              <a href="/terminos-condiciones" className="text-gray-400 hover:text-white transition-colors">
                Términos
              </a>
              <a href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
