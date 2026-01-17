import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, User, Menu, X, Heart, ChevronDown, MapPin, Phone } from 'lucide-react';
import { authService } from '../services/auth.service';
import type { Usuario } from '../services/auth.service';
import type { CategoriaArbol } from '../services/categoria.service';

interface NavbarProps {
  onSearch?: (query: string) => void;
  cartItemCount?: number;
  categorias?: CategoriaArbol[];
}

export default function Navbar({ onSearch, cartItemCount = 0, categorias = [] }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Verificar si hay usuario autenticado
    if (authService.isAuthenticated()) {
      setUsuario(authService.getUsuario());
    }

    // Detectar scroll para cambiar estilo del navbar
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUsuario(null);
    setIsUserMenuOpen(false);
    window.location.href = '/';
  };

  return (
    <>
      {/* Barra superior (info/contacto) */}
      <div className="bg-gray-900 text-white text-sm py-2 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <a href="/contact" className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
                <Phone size={14} />
                <span>+57 300 123 4567</span>
              </a>
              <a href="/contact" className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
                <MapPin size={14} />
                <span>Bogotá, Colombia</span>
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/help" className="hover:text-blue-400 transition-colors">Ayuda</a>
              <span className="text-gray-600">|</span>
              <a href="/track-order" className="hover:text-blue-400 transition-colors">Rastrear Pedido</a>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar principal */}
      <nav
        className={`sticky top-0 z-50 bg-white border-b transition-all duration-300 ${
          isScrolled ? 'shadow-lg border-gray-200' : 'shadow-sm border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Primera fila: Logo, Búsqueda, Acciones */}
          <div className="flex items-center justify-between h-20">
            {/* Logo y Menú Mobile */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <a href="/" className="flex items-center space-x-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Ecommerce
                  </span>
                  <p className="text-xs text-gray-500 -mt-1">Tu tienda online</p>
                </div>
              </a>
            </div>

            {/* Búsqueda - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className={`relative transition-all duration-200 ${isSearchFocused ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Buscar productos, marcas y más..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Buscar
                  </button>
                </div>
              </form>
            </div>

            {/* Iconos de acción */}
            <div className="flex items-center space-x-2">
              {/* Búsqueda móvil */}
              <button
                onClick={() => {
                  if (onSearch && searchQuery.trim()) {
                    onSearch(searchQuery.trim());
                  }
                }}
                className="md:hidden p-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search size={22} />
              </button>

              {/* Lista de deseos */}
              <a
                href="/wishlist"
                className="relative p-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors group"
                aria-label="Wishlist"
              >
                <Heart size={22} className="group-hover:fill-red-500 group-hover:text-red-500 transition-all" />
              </a>

              {/* Carrito */}
              <a
                href="/cart"
                className="relative p-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors group"
                aria-label="Shopping cart"
              >
                <ShoppingCart size={22} className="group-hover:text-blue-600 transition-colors" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </a>

              {/* Usuario */}
              {usuario ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors group"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                      <User size={18} className="text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
                      {usuario.nombre}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Menú desplegable usuario */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{usuario.nombre}</p>
                        <p className="text-xs text-gray-500 truncate">{usuario.email}</p>
                      </div>
                      <div className="py-1">
                        <a
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Mi Perfil
                        </a>
                        <a
                          href="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Mis Pedidos
                        </a>
                        <a
                          href="/addresses"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Direcciones
                        </a>
                        <a
                          href="/wishlist"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Lista de Deseos
                        </a>
                      </div>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href="/login"
                  className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User size={18} />
                  <span className="hidden sm:block">Iniciar Sesión</span>
                </a>
              )}
            </div>
          </div>

          {/* Segunda fila: Navegación Desktop */}
          <div className="hidden lg:flex items-center justify-between py-3 border-t border-gray-100">
            <div className="flex items-center space-x-1" ref={categoriesRef}>
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all group"
              >
                <Menu size={18} />
                <span>Categorías</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isCategoriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl py-3 z-50 border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                  {categorias.length > 0 ? (
                    categorias
                      .filter(cat => cat.activo) // Solo mostrar categorías activas
                      .map((categoria) => (
                        <div key={categoria.catId} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          <a
                            href={`/categoria/${categoria.slug}`}
                            className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                            onClick={() => setIsCategoriesOpen(false)}
                          >
                            <span className="flex items-center gap-2">
                              <span>{categoria.nombre}</span>
                            </span>
                            {categoria.subCategorias && categoria.subCategorias.length > 0 && (
                              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                <span>{categoria.subCategorias.length}</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </span>
                            )}
                          </a>
                          {/* Mostrar subcategorías si existen */}
                          {categoria.subCategorias && categoria.subCategorias.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-900/50 pl-6 border-l-2 border-blue-200 dark:border-blue-800">
                              {categoria.subCategorias
                                .filter(sub => sub.activo)
                                .slice(0, 4) // Mostrar máximo 4 subcategorías
                                .map((subcategoria) => (
                                  <a
                                    key={subcategoria.catId}
                                    href={`/categoria/${subcategoria.slug}`}
                                    className="block px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                                    onClick={() => setIsCategoriesOpen(false)}
                                  >
                                    {subcategoria.nombre}
                                  </a>
                                ))}
                              {categoria.subCategorias.filter(sub => sub.activo).length > 4 && (
                                <a
                                  href={`/categoria/${categoria.slug}`}
                                  className="block px-3 py-2 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:bg-white dark:hover:bg-gray-800 transition-colors"
                                  onClick={() => setIsCategoriesOpen(false)}
                                >
                                  Ver todas las subcategorías →
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                      No hay categorías disponibles
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <a
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                Inicio
              </a>
              <a
                href="/products"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                Productos
              </a>
              <a
                href="/offers"
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all font-semibold"
              >
                Ofertas
              </a>
              <a
                href="/new"
                className="px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-all"
              >
                Nuevos
              </a>
              <a
                href="/about"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                Nosotros
              </a>
              <a
                href="/contact"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                Contacto
              </a>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <>
            <div className="lg:hidden border-t border-gray-200 bg-white">
              <div className="px-4 py-4 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Búsqueda móvil */}
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar productos..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                  </div>
                </form>

                {/* Enlaces móviles */}
                <a
                  href="/"
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inicio
                </a>
                <a
                  href="/categories"
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Categorías
                </a>
                <a
                  href="/products"
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Productos
                </a>
                <a
                  href="/offers"
                  className="block px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ofertas
                </a>
                <a
                  href="/new"
                  className="block px-4 py-3 text-base font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Nuevos
                </a>
                <a
                  href="/about"
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Nosotros
                </a>
                <a
                  href="/contact"
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contacto
                </a>

                {/* Sección usuario móvil */}
                {usuario ? (
                  <>
                    <hr className="my-3 border-gray-200" />
                    <div className="px-4 py-2">
                      <p className="text-sm font-semibold text-gray-900">{usuario.nombre}</p>
                      <p className="text-xs text-gray-500">{usuario.email}</p>
                    </div>
                    <a
                      href="/profile"
                      className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mi Perfil
                    </a>
                    <a
                      href="/orders"
                      className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mis Pedidos
                    </a>
                    <a
                      href="/addresses"
                      className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Direcciones
                    </a>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    <hr className="my-3 border-gray-200" />
                    <a
                      href="/login"
                      className="block px-4 py-3 text-base font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-center font-semibold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </a>
                    <a
                      href="/register"
                      className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-center border border-gray-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Registrarse
                    </a>
                  </>
                )}
              </div>
            </div>
            {/* Overlay para cerrar menú móvil */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
          </>
        )}
      </nav>
    </>
  );
}
