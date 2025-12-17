import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, LogOut, User, Menu, X, Search, Moon, Sun,
  Heart, Settings, Home, Zap, Bell, ChevronDown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useCart } from '../hooks/useCart';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { getItemCount } = useCart();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const cartCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    setFavorites(saved ? JSON.parse(saved) : []);
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
    setUserDropdown(false);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setShowLogoutModal(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <>
      {/* Navbar Principal */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
          ? 'bg-white dark:bg-slate-900 shadow-lg border-b border-slate-200 dark:border-slate-800'
          : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-brand-gold rounded-lg opacity-20 group-hover:opacity-30 transition" />
                <Zap className="w-5 h-5 text-brand-gold" fill="currentColor" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-black bg-gradient-to-r from-brand-gold to-yellow-500 bg-clip-text text-transparent">
                  <span>White</span>Star
                </h1>
              </div>
            </Link>

            {/* Search Bar Desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-sm mx-8"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Buscar perfumes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Buscar perfumes en el catálogo"
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
                />
              </div>
            </form>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className="px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition flex items-center gap-2"
              >
                <Home size={18} /> Inicio
              </Link>
              <Link
                to="/catalog"
                className="px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition"
              >
                Catálogo
              </Link>
              {user && (
                <Link
                  to="/reservations"
                  className="px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition"
                >
                  Reservas
                </Link>
              )}

              {/* Menú Desplegable de Acciones según Rol */}
              {user && (
                ['Admin', 'Gerente', 'Vendedor', 'Administrador de Stock', 'Atención al Cliente'].includes(user?.role)
              ) && (
                  <div className="relative group">
                    <button className="px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition flex items-center gap-2">
                      Acciones
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        {/* Admin, Gerente, Vendedor */}
                        {['Admin', 'Gerente', 'Vendedor'].includes(user?.role) && (
                          <Link
                            to="/admin-dashboard"
                            className="flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm transition"
                          >
                            <Settings size={16} />
                            {user?.role === 'Vendedor' ? 'Gestión de Productos' : 'Panel de Administración'}
                          </Link>
                        )}

                        {/* Vendedor - Solo Consulta de Stock */}
                        {user?.role === 'Vendedor' && (
                          <Link
                            to="/seller-stock"
                            className="flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm transition"
                          >
                            <Settings size={16} />
                            Consulta de Stock
                          </Link>
                        )}

                        {/* Admin, Gerente, Admin Stock - Gestión Completa */}
                        {['Admin', 'Gerente', 'Administrador de Stock'].includes(user?.role) && (
                          <Link
                            to="/stock-management"
                            className="flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm transition"
                          >
                            <Settings size={16} />
                            Gestión de Inventario
                          </Link>
                        )}

                        {/* Admin, Gerente */}
                        {['Admin', 'Gerente'].includes(user?.role) && (
                          <>
                            <Link
                              to="/reports"
                              className="flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm transition"
                            >
                              <Settings size={16} />
                              Reportes y Análisis
                            </Link>
                            <Link
                              to="/users"
                              className="flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm transition"
                            >
                              <User size={16} />
                              Gestión de Usuarios
                            </Link>
                            <Link
                              to="/tasks"
                              className="flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm transition"
                            >
                              <Settings size={16} />
                              Gestión de Tareas
                            </Link>
                          </>
                        )}

                        {/* Admin, Gerente, Atención al Cliente */}
                        {['Admin', 'Gerente', 'Atención al Cliente'].includes(user?.role) && (
                          <Link
                            to="/customer-service/dashboard"
                            className="flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm transition"
                          >
                            <User size={16} />
                            Atención al Cliente
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
                aria-label="Cambiar tema"
                title={isDark ? 'Tema Claro' : 'Tema Oscuro'}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-brand-gold" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {/* Favorites Badge - Temporalmente deshabilitado */}
              {/* <button
                onClick={() => navigate('/favorites')}
                className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition hidden sm:block text-slate-700 dark:text-slate-300"
                title="Favoritos"
                aria-label={`Ver favoritos (${favorites.length} productos)`}
              >
                <Heart className="w-5 h-5" aria-hidden="true" />
                {favorites.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse-ring" aria-hidden="true">
                    {favorites.length}
                  </span>
                )}
              </button> */}

              {/* Notifications */}
              <div className="hidden sm:block">
                <NotificationCenter />
              </div>

              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
                title="Carrito"
                aria-label={`Ver carrito de compras (${cartCount} productos)`}
              >
                <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-gold text-slate-900 text-xs font-bold rounded-full flex items-center justify-center animate-bounce-gentle" aria-hidden="true">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-gold to-yellow-500 flex items-center justify-center">
                      <span className="text-slate-900 font-bold text-sm">
                        {user.first_name?.charAt(0)}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {userDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg animate-fade-in-down">
                      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {user.email}
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 bg-brand-gold text-slate-900 text-xs font-bold rounded">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm transition"
                        >
                          <User size={18} />
                          Mis Pedidos
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm transition"
                        >
                          <Settings size={18} />
                          Configuración
                        </Link>
                      </div>

                      <div className="border-t border-slate-200 dark:border-slate-800 py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm transition"
                        >
                          <LogOut size={18} />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-slate-700 dark:text-slate-300 font-medium text-sm hover:text-brand-gold transition"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 font-bold text-sm rounded-lg hover:shadow-lg transition transform hover:scale-105"
                  >
                    Registrarse
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-900 dark:text-white"
                aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Search Mobile */}
          {mobileMenuOpen && (
            <form onSubmit={handleSearch} className="mt-4 md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Buscar perfumes"
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>
            </form>
          )}
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <>
          {/* Overlay con z-index más alto */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer con scroll suave y padding bottom */}
          <div className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 z-[70] md:hidden overflow-y-auto border-l border-slate-200 dark:border-slate-800 shadow-2xl transform transition-transform duration-300 ease-out">
            {/* Header del menú móvil */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-gold" fill="currentColor" />
                <span className="text-lg font-black bg-gradient-to-r from-brand-gold to-yellow-500 bg-clip-text text-transparent">
                  WhiteStar
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Cerrar menú"
              >
                <X className="w-6 h-6 text-slate-900 dark:text-white" />
              </button>
            </div>

            {/* Contenido del menú con padding bottom para evitar que el último elemento quede oculto */}
            <div className="p-4 space-y-2 pb-20">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium transition-colors min-h-[48px]"
              >
                <Home size={20} />
                Inicio
              </Link>
              <Link
                to="/catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium transition-colors min-h-[48px]"
              >
                <Search size={20} />
                Catálogo
              </Link>

              {user ? (
                <>
                  <hr className="border-slate-200 dark:border-slate-800 my-3" />

                  {/* Información del usuario */}
                  <div className="px-4 py-3 bg-gradient-to-r from-brand-gold/10 to-yellow-500/10 rounded-xl border border-brand-gold/20 mb-3">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 bg-brand-gold text-slate-900 text-xs font-bold rounded">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium transition-colors min-h-[48px]"
                  >
                    <User size={20} />
                    Mis Pedidos
                  </Link>

                  {user && (
                    <Link
                      to="/reservations"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium transition-colors min-h-[48px]"
                    >
                      <Settings size={20} />
                      Reservas
                    </Link>
                  )}

                  {/* Sección de Administración */}
                  {['Admin', 'Gerente', 'Vendedor', 'Administrador de Stock', 'Atención al Cliente'].includes(user?.role) && (
                    <>
                      <hr className="border-slate-200 dark:border-slate-800 my-3" />
                      <p className="px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Administración
                      </p>
                    </>
                  )}

                  {['Admin', 'Gerente', 'Vendedor'].includes(user?.role) && (
                    <Link
                      to="/admin-dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium transition-colors min-h-[48px]"
                    >
                      <Settings size={20} />
                      {user?.role === 'Vendedor' ? 'Productos' : 'Panel Admin'}
                    </Link>
                  )}
                  {user?.role === 'Vendedor' && (
                    <Link
                      to="/seller-stock"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium transition-colors min-h-[48px]"
                    >
                      <Settings size={20} />
                      Consulta de Stock
                    </Link>
                  )}
                  {['Admin', 'Gerente', 'Administrador de Stock'].includes(user?.role) && (
                    <Link
                      to="/stock-management"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium transition-colors min-h-[48px]"
                    >
                      <Settings size={20} />
                      Inventario
                    </Link>
                  )}
                  {['Admin', 'Gerente'].includes(user?.role) && (
                    <>
                      <Link
                        to="/reports"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium transition-colors min-h-[48px]"
                      >
                        <Settings size={20} />
                        Reportes
                      </Link>
                      <Link
                        to="/users"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium transition-colors min-h-[48px]"
                      >
                        <User size={20} />
                        Usuarios
                      </Link>
                      <Link
                        to="/tasks"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium transition-colors min-h-[48px]"
                      >
                        <Settings size={20} />
                        Tareas
                      </Link>
                    </>
                  )}
                  {['Admin', 'Gerente', 'Atención al Cliente'].includes(user?.role) && (
                    <Link
                      to="/customer-service/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium transition-colors min-h-[48px]"
                    >
                      <User size={20} />
                      Atención Cliente
                    </Link>
                  )}

                  <hr className="border-slate-200 dark:border-slate-800 my-3" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-medium transition-colors min-h-[48px]"
                  >
                    <LogOut size={20} />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <hr className="border-slate-200 dark:border-slate-800 my-3" />
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center text-slate-900 dark:text-white font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[48px]"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 font-bold rounded-xl hover:shadow-lg transition-all min-h-[48px]"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal de Confirmación de Cierre de Sesión */}
      {showLogoutModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm animate-fade-in-down">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogOut className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  ¿Cerrar sesión?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  ¿Estás seguro que quieres cerrar tu sesión?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
                >
                  Sí, cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
