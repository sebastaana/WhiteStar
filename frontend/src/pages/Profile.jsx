import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  Package, Calendar, DollarSign, User, Settings, Heart,
  TrendingUp, Award, ShoppingBag, Clock, CheckCircle, Truck, Box,
  Home, Bell, MapPin, CreditCard, Shield, LogOut, ChevronRight, Sparkles, MessageSquare
} from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get('/orders');
        setOrders(response.data.orders || []);
      } catch (err) {
        setError('Error al cargar pedidos');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );

  // Calcular stats
  const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  const completedOrders = orders.filter(o => o.status === 'Entregado').length;
  const pendingOrders = orders.filter(o => o.status === 'Pendiente' || o.status === 'Confirmado').length;

  const menuItems = [
    { id: 'overview', label: 'Resumen', icon: Home },
    { id: 'orders', label: 'Mis Pedidos', icon: Package },
    { id: 'complaints', label: 'Mis Reclamos', icon: MessageSquare, link: '/my-complaints' },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col fixed h-screen z-40`}>
        {/* User Profile Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-gold to-yellow-500 rounded-full flex items-center justify-center text-slate-900 font-black text-xl flex-shrink-0">
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-900 dark:text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-brand-gold/20 text-brand-gold rounded text-xs font-bold">
                  {user?.role}
                </span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            item.link ? (
              <Link
                key={item.id}
                to={item.link}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-bold">{item.label}</span>}
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === item.id
                  ? 'bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 shadow-lg shadow-brand-gold/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-bold">{item.label}</span>}
                {sidebarOpen && activeView === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            )
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-bold">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-72' : 'ml-20'} transition-all duration-300`}>
        <div className="p-8">
          {error && <ErrorMessage message={error} />}

          {/* Overview */}
          {activeView === 'overview' && (
            <div className="space-y-8">
              {/* Welcome Header */}
              <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-brand-gold" />
                  ¡Hola, {user?.first_name}!
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Bienvenido a tu panel personal de WhiteStar
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{orders.length}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Pedidos</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{completedOrders}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Completados</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    {pendingOrders > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs font-bold rounded-full animate-pulse">
                        {pendingOrders} activos
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{pendingOrders}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">En Proceso</p>
                </div>

                <div className="bg-gradient-to-br from-brand-gold/20 to-yellow-500/20 dark:from-brand-gold/10 dark:to-yellow-500/10 rounded-2xl p-6 border border-brand-gold/30 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-brand-gold rounded-xl">
                      <DollarSign className="w-6 h-6 text-slate-900" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-brand-gold" />
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                    ${totalSpent.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Total Gastado</p>
                </div>
              </div>

              {/* Recent Orders & VIP Badge */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Package className="w-6 h-6 text-brand-gold" />
                      Pedidos Recientes
                    </h2>
                    <button
                      onClick={() => setActiveView('orders')}
                      className="text-brand-gold font-bold hover:underline text-sm"
                    >
                      Ver todos
                    </button>
                  </div>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div>
                          <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
                            #{order.id.substring(0, 8).toUpperCase()}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {new Date(order.created_at).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p className="font-black text-brand-gold">${parseFloat(order.total).toFixed(2)}</p>
                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${order.status === 'Entregado' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                              order.status === 'Enviado' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                order.status === 'Confirmado' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                                  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                              }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <div className="text-center py-8">
                        <Box className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-600 dark:text-slate-400">No tienes pedidos aún</p>
                        <button
                          onClick={() => navigate('/catalog')}
                          className="mt-4 px-6 py-2 bg-brand-gold text-slate-900 rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                          Explorar Catálogo
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* VIP Badge */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-brand-gold to-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-brand-gold/30">
                      <Award size={32} className="text-slate-900" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Cliente VIP</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Compras frecuentes</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Progreso al siguiente nivel</span>
                      <span className="font-bold text-slate-900 dark:text-white">75%</span>
                    </div>
                    <div className="w-full bg-purple-200 dark:bg-purple-900 rounded-full h-3">
                      <div className="bg-gradient-to-r from-purple-600 to-purple-500 h-full rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 text-center mt-4">
                      ¡Sigue comprando para desbloquear más beneficios!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders View */}
          {activeView === 'orders' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Mis Pedidos</h1>
                <p className="text-slate-600 dark:text-slate-400">Historial completo de tus compras</p>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
                  <Box className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 font-semibold mb-4">
                    No tienes pedidos aún
                  </p>
                  <button
                    onClick={() => navigate('/catalog')}
                    className="px-6 py-3 bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    Explorar Catálogo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="font-mono text-sm text-slate-500 dark:text-slate-400 mb-1">
                            Pedido #{order.id.substring(0, 8).toUpperCase()}
                          </p>
                          <p className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-2">
                            <Calendar size={14} />
                            {new Date(order.created_at).toLocaleDateString('es-CL', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
                            <p className="text-2xl font-black text-brand-gold">
                              ${parseFloat(order.total).toFixed(2)}
                            </p>
                          </div>
                          <span className={`px-4 py-2 rounded-xl font-bold text-sm ${order.status === 'Entregado' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                            order.status === 'Enviado' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                              order.status === 'Confirmado' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                            }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {order.OrderItems && order.OrderItems.length > 0 && (
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                          <p className="font-bold text-slate-900 dark:text-white mb-3 text-sm">
                            Artículos ({order.OrderItems.length}):
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {order.OrderItems.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl"
                              >
                                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                                <div className="flex-1">
                                  <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                    {item.Product?.name || 'Producto'}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Cantidad: {item.quantity}
                                  </p>
                                </div>
                                <p className="font-bold text-brand-gold">
                                  ${parseFloat(item.price).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Favorites View */}
          {activeView === 'favorites' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Mis Favoritos</h1>
                <p className="text-slate-600 dark:text-slate-400">Productos que te encantan</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
                <Heart className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 font-semibold mb-4">
                  No tienes favoritos guardados
                </p>
                <button
                  onClick={() => navigate('/catalog')}
                  className="px-6 py-3 bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  Explorar Catálogo
                </button>
              </div>
            </div>
          )}

          {/* Settings View */}
          {activeView === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Configuración</h1>
                <p className="text-slate-600 dark:text-slate-400">Administra tu cuenta y preferencias</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                  <h3 className="font-black text-xl text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-gold" />
                    Información Personal
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={user?.first_name}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Apellido
                      </label>
                      <input
                        type="text"
                        value={user?.last_name}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                  <h3 className="font-black text-xl text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-brand-gold" />
                    Preferencias
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                      <input type="checkbox" className="w-5 h-5 rounded text-brand-gold" />
                      <span className="text-slate-900 dark:text-white font-medium">
                        Recibir notificaciones por email
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                      <input type="checkbox" className="w-5 h-5 rounded text-brand-gold" defaultChecked />
                      <span className="text-slate-900 dark:text-white font-medium">
                        Ofertas y promociones exclusivas
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                      <input type="checkbox" className="w-5 h-5 rounded text-brand-gold" defaultChecked />
                      <span className="text-slate-900 dark:text-white font-medium">
                        Actualizaciones de pedidos
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Confirmación de Cierre de Sesión */}
      {showLogoutModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm">
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
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
                >
                  Sí, cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
