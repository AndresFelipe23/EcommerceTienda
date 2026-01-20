import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import type { CategoriaArbol } from '../../services/categoria.service';

interface NavbarProps {
  categorias?: CategoriaArbol[];
  onSearch?: (query: string) => void;
  tiendaNombre?: string;
  tiendaTelefono?: string;
  tiendaWhatsapp?: string;
  tiendaEmail?: string;
  tiendaCiudad?: string;
  tiendaEstado?: string;
  configuracion?: {
    horarios?: {
      lunesAViernes?: string;
      sabado?: string;
      domingo?: string;
    };
    branding?: {
      mensajePromocional?: string;
    };
    redesSociales?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      tiktok?: string;
      youtube?: string;
      linkedin?: string;
      pinterest?: string;
    };
  } | null;
}

export default function Navbar({ 
  categorias = [], 
  onSearch,
  tiendaNombre = 'Tienda',
  tiendaTelefono,
  tiendaWhatsapp,
  tiendaEmail,
  tiendaCiudad,
  tiendaEstado,
  configuracion
}: NavbarProps) {
  const { totalItems } = useCart();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMenuMobileOpen, setIsMenuMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const categoriesRef = useRef<HTMLDivElement>(null);
  const menuMobileRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    };
    if (isCategoriesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCategoriesOpen]);

  // Cerrar menú mobile al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (menuMobileRef.current && !menuMobileRef.current.contains(target)) {
        setIsMenuMobileOpen(false);
      }

      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    // Solo agregar el listener después de un pequeño delay para evitar que se cierre inmediatamente
    if (isMenuMobileOpen || isUserMenuOpen) {
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      if (isMenuMobileOpen) {
        document.body.style.overflow = 'hidden';
      }

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMenuMobileOpen, isUserMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchQuery('');
    }
  };

  // Las categorías del array principal son las categorías padre (primer nivel del árbol)
  const categoriasPadre = categorias.filter(cat => cat.activo);

  return (
    <header className="bg-white">
      {/* Header desktop */}
      <div className="hidden lg:block">
        {/* Topbar */}
        <div className="bg-gray-900 text-white text-sm py-2">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-full">
              {/* Lado izquierdo: Mensaje promocional u horarios */}
              <div className="flex items-center gap-4">
                {/* Mensaje promocional (si está configurado) */}
                {configuracion?.branding?.mensajePromocional && (
                  <div className="text-gray-300">
                    {configuracion.branding.mensajePromocional}
                  </div>
                )}
                
                {/* Información alternativa si no hay mensaje promocional */}
                {!configuracion?.branding?.mensajePromocional && (
                  <>
                    {/* Horarios de atención (si están configurados) */}
                    {configuracion?.horarios?.lunesAViernes && (
                      <div className="text-gray-300 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Lun-Vie: {configuracion.horarios.lunesAViernes}</span>
                      </div>
                    )}
                    
                    {/* Ubicación (si está disponible) */}
                    {(tiendaCiudad || tiendaEstado) && !configuracion?.horarios?.lunesAViernes && (
                      <div className="text-gray-300 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>
                          {tiendaCiudad && tiendaEstado ? `${tiendaCiudad}, ${tiendaEstado}` : tiendaCiudad || tiendaEstado}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center h-full gap-3">
                {/* Teléfono (si está disponible) */}
                {tiendaTelefono && (
                  <a 
                    href={`tel:${tiendaTelefono}`} 
                    className="px-3 py-1.5 hover:text-white transition-colors flex items-center gap-1.5"
                    title={tiendaTelefono}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm">{tiendaTelefono}</span>
                  </a>
                )}
                
                {/* WhatsApp (si está disponible) */}
                {tiendaWhatsapp && (
                  <a 
                    href={`https://wa.me/${tiendaWhatsapp.replace(/[^0-9]/g, '')}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 hover:text-white transition-colors flex items-center gap-1.5"
                    title="Contactar por WhatsApp"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span className="text-sm">WhatsApp</span>
                  </a>
                )}
                
                {/* Redes sociales */}
                {configuracion?.redesSociales && (
                  <div className="flex items-center gap-2 border-l border-gray-700 pl-3">
                    {configuracion.redesSociales.facebook && (
                      <a 
                        href={configuracion.redesSociales.facebook} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-6 h-6 flex items-center justify-center hover:text-white transition-colors"
                        aria-label="Facebook"
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
                        className="w-6 h-6 flex items-center justify-center hover:text-white transition-colors"
                        aria-label="Instagram"
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
                        className="w-6 h-6 flex items-center justify-center hover:text-white transition-colors"
                        aria-label="Twitter/X"
                        title="Twitter/X"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                    )}
                    {configuracion.redesSociales.tiktok && (
                      <a 
                        href={configuracion.redesSociales.tiktok} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-6 h-6 flex items-center justify-center hover:text-white transition-colors"
                        aria-label="TikTok"
                        title="TikTok"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                        </svg>
                      </a>
                    )}
                    {configuracion.redesSociales.youtube && (
                      <a 
                        href={configuracion.redesSociales.youtube} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-6 h-6 flex items-center justify-center hover:text-white transition-colors"
                        aria-label="YouTube"
                        title="YouTube"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu desktop */}
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between py-4 gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {tiendaNombre}
              </span>
            </Link>

            {/* Buscador siempre visible */}
            <form onSubmit={handleSearch} className="flex-1 flex items-center max-w-lg mx-4 relative group">
              <div className="absolute left-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 w-full pl-12 pr-16 py-2.5 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-gray-900 placeholder-gray-400 transition-all shadow-sm hover:shadow-md"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm hover:shadow-md"
                aria-label="Buscar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* Menu desktop */}
            <div 
              className="flex-1 flex justify-center" 
              ref={categoriesRef}
            >
              <ul className="flex items-center space-x-8">
                <li>
                  <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    Inicio
                  </Link>
                </li>

                {categoriasPadre.length > 0 && (
                  <li 
                    className="relative"
                    onMouseEnter={() => setIsCategoriesOpen(true)}
                    onMouseLeave={(e) => {
                      // Verificar si el mouse está yendo al menú desplegable
                      const relatedTarget = e.relatedTarget as HTMLElement;
                      const dropdown = e.currentTarget.querySelector('.categories-dropdown') as HTMLElement;
                      if (!relatedTarget || !dropdown?.contains(relatedTarget)) {
                        setIsCategoriesOpen(false);
                      }
                    }}
                  >
                    <a 
                      href="#" 
                      onClick={(e) => e.preventDefault()}
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center"
                    >
                      Categorías
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </a>
                    {isCategoriesOpen && (
                      <div 
                        className="categories-dropdown absolute top-full left-0 pt-2 bg-transparent z-50"
                        onMouseEnter={() => setIsCategoriesOpen(true)}
                        onMouseLeave={() => setIsCategoriesOpen(false)}
                      >
                        <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[250px]">
                          {categoriasPadre.map((categoria) => (
                            <div key={categoria.catId} className="relative group">
                              <Link 
                                to={`/categoria/${categoria.slug}`} 
                                onClick={() => setIsCategoriesOpen(false)}
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                              >
                                {categoria.nombre}
                              </Link>
                              {categoria.subCategorias && categoria.subCategorias.filter(sub => sub.activo).length > 0 && (
                                <ul className="ml-4 mt-1 space-y-1">
                                  {categoria.subCategorias
                                    .filter(sub => sub.activo)
                                    .map((subcategoria) => (
                                      <li key={subcategoria.catId}>
                                        <Link 
                                          to={`/categoria/${subcategoria.slug}`} 
                                          onClick={() => setIsCategoriesOpen(false)}
                                          className="block px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                        >
                                          {subcategoria.nombre}
                                        </Link>
                                      </li>
                                    ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                )}

                <li>
                  <Link to="/sobre-nosotros" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    Sobre nosotros
                  </Link>
                </li>

                <li>
                  <Link to="/contacto" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>

            {/* Icon header */}
            <div className="flex items-center space-x-4 flex-shrink-0">

              <Link
                to="/carrito"
                className="text-gray-700 hover:text-blue-600 transition-colors p-2 relative"
                aria-label="Cart"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>

              <Link 
                to="/lista-deseos" 
                className="text-gray-700 hover:text-blue-600 transition-colors p-2 relative"
                title="Lista de deseos"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>

              {/* Usuario / Login */}
              {usuario ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserMenuOpen(!isUserMenuOpen);
                    }}
                    className="text-gray-700 hover:text-blue-600 transition-colors p-2 flex items-center"
                    aria-label="User Menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold mr-2">
                      {usuario.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm font-medium">{usuario.nombre}</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isUserMenuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="user-dropdown-menu absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{usuario.nombre} {usuario.apellido || ''}</p>
                        <p className="text-xs text-gray-500 mt-1">{usuario.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/perfil');
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Mi Cuenta
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/mis-pedidos');
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Mis Pedidos
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="hidden sm:flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/registro"
                    className="hidden sm:flex items-center px-4 py-2 text-sm font-medium text-white !text-white bg-black hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Registrarse
                  </Link>
                  <Link
                    to="/login"
                    className="sm:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
                    aria-label="Login"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Header Mobile */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 gap-2">
          <button
            onClick={() => setIsMenuMobileOpen(!isMenuMobileOpen)}
            className={`hamburger hamburger--squeeze flex-shrink-0 ${isMenuMobileOpen ? 'is-active' : ''}`}
            aria-label="Menu"
          >
            <span className="hamburger-box">
              <span className="hamburger-inner"></span>
            </span>
          </button>

          <Link to="/" className="flex items-center flex-shrink-0">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {tiendaNombre}
            </span>
          </Link>

          <form onSubmit={handleSearch} className="flex items-center flex-1 min-w-0 relative group mr-2">
            <div className="absolute left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-gray-900 placeholder-gray-400 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 px-2.5 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center"
              aria-label="Buscar"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          <div className="flex items-center space-x-2 flex-shrink-0">

            <Link
              to="/carrito"
              className="text-gray-700 p-2 relative"
              aria-label="Cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* Usuario / Login Mobile */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUserMenuOpen(!isUserMenuOpen);
                }}
                className="text-gray-700 p-2"
                aria-label="User Menu"
              >
                {usuario ? (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                    {usuario.nombre.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </button>
              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsUserMenuOpen(false)} />
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="user-dropdown-menu absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50"
                  >
                  {usuario ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{usuario.nombre} {usuario.apellido || ''}</p>
                        <p className="text-xs text-gray-500 mt-1">{usuario.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/perfil');
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Mi Cuenta
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/mis-pedidos');
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Mis Pedidos
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Iniciar Sesión
                      </Link>
                      <Link
                        to="/registro"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Registrarse
                      </Link>
                    </>
                  )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Mobile - Sidebar */}
      <div 
        ref={menuMobileRef}
        className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
          isMenuMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Topbar mobile */}
          <div className="bg-gray-900 text-white text-sm p-4">
            {/* Mensaje promocional u horarios */}
            {configuracion?.branding?.mensajePromocional && (
              <div className="text-gray-300 mb-2">{configuracion.branding.mensajePromocional}</div>
            )}
            {/* Información alternativa si no hay mensaje promocional */}
            {!configuracion?.branding?.mensajePromocional && (
              <>
                {/* Horarios de atención (si están configurados) */}
                {configuracion?.horarios?.lunesAViernes && (
                  <div className="text-gray-300 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Lun-Vie: {configuracion.horarios.lunesAViernes}</span>
                  </div>
                )}
                
                {/* Ubicación (si está disponible y no hay horarios) */}
                {(tiendaCiudad || tiendaEstado) && !configuracion?.horarios?.lunesAViernes && (
                  <div className="text-gray-300 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>
                      {tiendaCiudad && tiendaEstado ? `${tiendaCiudad}, ${tiendaEstado}` : tiendaCiudad || tiendaEstado}
                    </span>
                  </div>
                )}
              </>
            )}
            
            <div className="flex flex-wrap gap-3 text-xs items-center">
              {tiendaTelefono && (
                <a href={`tel:${tiendaTelefono}`} className="hover:text-white flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{tiendaTelefono}</span>
                </a>
              )}
              {tiendaWhatsapp && (
                <a 
                  href={`https://wa.me/${tiendaWhatsapp.replace(/[^0-9]/g, '')}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>
              )}
              
              {/* Redes sociales (mobile) */}
              {configuracion?.redesSociales && (
                <div className="flex items-center gap-2 border-l border-gray-700 pl-3">
                  {configuracion.redesSociales.facebook && (
                    <a 
                      href={configuracion.redesSociales.facebook} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                      aria-label="Facebook"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                  {configuracion.redesSociales.instagram && (
                    <a 
                      href={configuracion.redesSociales.instagram} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                      aria-label="Instagram"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                  {configuracion.redesSociales.twitter && (
                    <a 
                      href={configuracion.redesSociales.twitter} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                      aria-label="Twitter/X"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  )}
                  {configuracion.redesSociales.tiktok && (
                    <a 
                      href={configuracion.redesSociales.tiktok} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                      aria-label="TikTok"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                      </svg>
                    </a>
                  )}
                  {configuracion.redesSociales.youtube && (
                    <a 
                      href={configuracion.redesSociales.youtube} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                      aria-label="YouTube"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Menu items */}
          <ul className="flex-1 py-4">
            {usuario && (
              <li className="px-4 py-3 border-b border-gray-200 mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold mr-3">
                    {usuario.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{usuario.nombre} {usuario.apellido || ''}</p>
                    <p className="text-xs text-gray-500">{usuario.email}</p>
                  </div>
                </div>
              </li>
            )}
            {usuario && (
              <>
                <li>
                  <button
                    onClick={() => {
                      setIsMenuMobileOpen(false);
                      setTimeout(() => {
                        window.location.href = '/perfil';
                      }, 50);
                    }}
                    className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mi Cuenta
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setIsMenuMobileOpen(false);
                      navigate('/lista-deseos');
                    }}
                    className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Lista de Deseos
                  </button>
                </li>
              </>
            )}
            {usuario && (
              <li>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuMobileOpen(false);
                    navigate('/');
                  }}
                  className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar Sesión
                </button>
              </li>
            )}
            {!usuario && (
              <li>
                <Link 
                  to="/login" 
                  onClick={() => setIsMenuMobileOpen(false)} 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Iniciar Sesión
                </Link>
              </li>
            )}
            {!usuario && (
              <li>
                <Link 
                  to="/registro" 
                  onClick={() => setIsMenuMobileOpen(false)} 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Registrarse
                </Link>
              </li>
            )}
            <li>
              <Link 
                to="/" 
                onClick={() => setIsMenuMobileOpen(false)} 
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Inicio
              </Link>
            </li>
            {categoriasPadre.length > 0 && (
              <li>
                <div className="block px-4 py-3 text-gray-700 font-medium">
                  Categorías
                </div>
                <ul className="pl-4">
                  {categoriasPadre.map((categoria) => (
                    <li key={categoria.catId}>
                      <Link 
                        to={`/categoria/${categoria.slug}`} 
                        onClick={() => setIsMenuMobileOpen(false)}
                        className="block px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors font-medium"
                      >
                        {categoria.nombre}
                      </Link>
                      {categoria.subCategorias && categoria.subCategorias.filter(sub => sub.activo).length > 0 && (
                        <ul className="pl-4">
                          {categoria.subCategorias
                            .filter(sub => sub.activo)
                            .map((subcategoria) => (
                              <li key={subcategoria.catId}>
                                <Link 
                                  to={`/categoria/${subcategoria.slug}`} 
                                  onClick={() => setIsMenuMobileOpen(false)}
                                  className="block px-4 py-2 text-gray-500 hover:bg-gray-100 transition-colors text-sm"
                                >
                                  {subcategoria.nombre}
                                </Link>
                              </li>
                            ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            )}
            <li>
              <Link 
                to="/sobre-nosotros" 
                onClick={() => setIsMenuMobileOpen(false)} 
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Sobre nosotros
              </Link>
            </li>
            <li>
              <Link 
                to="/contacto" 
                onClick={() => setIsMenuMobileOpen(false)} 
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Contacto
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Overlay para menú mobile */}
      {isMenuMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMenuMobileOpen(false)}
        />
      )}



      {/* Estilos para hamburger menu */}
      <style>{`
        .hamburger {
          padding: 0;
          display: inline-block;
          cursor: pointer;
          transition-property: opacity, filter;
          transition-duration: 0.15s;
          transition-timing-function: linear;
          font: inherit;
          color: inherit;
          text-transform: none;
          background-color: transparent;
          border: 0;
          margin: 0;
          overflow: visible;
        }
        .hamburger-box {
          width: 24px;
          height: 18px;
          display: inline-block;
          position: relative;
        }
        .hamburger-inner {
          display: block;
          top: 50%;
          margin-top: -1.5px;
        }
        .hamburger-inner,
        .hamburger-inner::before,
        .hamburger-inner::after {
          width: 24px;
          height: 3px;
          background-color: #374151;
          border-radius: 2px;
          position: absolute;
          transition-property: transform;
          transition-duration: 0.15s;
          transition-timing-function: ease;
        }
        .hamburger-inner::before,
        .hamburger-inner::after {
          content: "";
          display: block;
        }
        .hamburger-inner::before {
          top: -8px;
        }
        .hamburger-inner::after {
          bottom: -8px;
        }
        .hamburger--squeeze .hamburger-inner {
          transition-duration: 0.075s;
          transition-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
        }
        .hamburger--squeeze .hamburger-inner::before {
          transition: top 0.075s 0.12s ease, opacity 0.075s ease;
        }
        .hamburger--squeeze .hamburger-inner::after {
          transition: bottom 0.075s 0.12s ease, transform 0.075s cubic-bezier(0.55, 0.055, 0.675, 0.19);
        }
        .hamburger--squeeze.is-active .hamburger-inner {
          transform: rotate(45deg);
          transition-delay: 0.12s;
          transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
        }
        .hamburger--squeeze.is-active .hamburger-inner::before {
          top: 0;
          opacity: 0;
          transition: top 0.075s ease, opacity 0.075s 0.12s ease;
        }
        .hamburger--squeeze.is-active .hamburger-inner::after {
          bottom: 0;
          transform: rotate(-90deg);
          transition: bottom 0.075s ease, transform 0.075s 0.12s cubic-bezier(0.215, 0.61, 0.355, 1);
        }
      `}</style>
    </header>
  );
}
