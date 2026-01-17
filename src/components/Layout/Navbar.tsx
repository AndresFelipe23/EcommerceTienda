import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import type { CategoriaArbol } from '../../services/categoria.service';

interface NavbarProps {
  categorias?: CategoriaArbol[];
  onSearch?: (query: string) => void;
  tiendaNombre?: string;
}

export default function Navbar({ 
  categorias = [], 
  onSearch,
  tiendaNombre = 'Tienda'
}: NavbarProps) {
  const { totalItems } = useCart();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMenuMobileOpen, setIsMenuMobileOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
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
      setIsSearchModalOpen(false);
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
              <div className="text-gray-300">
                Free shipping for standard order over $100
              </div>

              <div className="flex items-center h-full">
                <a href="#" className="px-6 py-2 hover:text-white transition-colors">
                  Help & FAQs
                </a>

                <a href="#" className="px-6 py-2 hover:text-white transition-colors">
                  EN
                </a>

                <a href="#" className="px-6 py-2 hover:text-white transition-colors">
                  USD
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Menu desktop */}
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {tiendaNombre}
              </span>
            </Link>

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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="text-gray-700 hover:text-blue-600 transition-colors p-2"
                aria-label="Search"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

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
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsMenuMobileOpen(!isMenuMobileOpen)}
            className={`hamburger hamburger--squeeze ${isMenuMobileOpen ? 'is-active' : ''}`}
            aria-label="Menu"
          >
            <span className="hamburger-box">
              <span className="hamburger-inner"></span>
            </span>
          </button>

          <Link to="/" className="flex items-center">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {tiendaNombre}
            </span>
          </Link>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="text-gray-700 p-2"
              aria-label="Search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

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
            <div className="text-gray-300 mb-2">Free shipping for standard order over $100</div>
            <div className="flex flex-wrap gap-2 text-xs items-center">
              <a href="#" className="hover:text-white">Help & FAQs</a>
              <a href="#" className="hover:text-white">EN</a>
              <a href="#" className="hover:text-white">USD</a>
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

      {/* Modal Search */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Search</h2>
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
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
