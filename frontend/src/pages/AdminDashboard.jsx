import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  Users, Package, ShoppingBag, TrendingUp, Plus, Edit, Trash2,
  Search, X, DollarSign, Eye, Check, AlertCircle, BarChart3,
  Sparkles, Crown, Zap, Home, Grid, Layers, Menu, ChevronRight,
  Tag, FileText, Settings, Bell
} from 'lucide-react';
import { getImageUrl } from '../utils/image';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [promotions, setPromotions] = useState([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image_url: ''
  });

  const [promotionForm, setPromotionForm] = useState({
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    start_date: '',
    end_date: '',
    product_id: '',
    category_id: '',
    min_purchase_amount: '',
    max_discount_amount: '',
    usage_limit: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (!user || !['Admin', 'Gerente', 'Vendedor'].includes(user.role)) {
      navigate('/');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/categories')
      ]);

      setProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories || []);

      // Fetch orders (All authorized roles)
      try {
        const ordersRes = await api.get('/orders');
        setOrders(ordersRes.data.orders || []);
      } catch (e) {
        console.error('Error fetching orders:', e);
      }

      // Fetch promotions (Vendedor+)
      if (['Admin', 'Gerente', 'Vendedor'].includes(user.role)) {
        try {
          const promotionsRes = await api.get('/promotions');
          setPromotions(promotionsRes.data.data || []);
        } catch (e) {
          console.error('Error fetching promotions:', e);
        }
      }

      // Fetch users (Only Admin/Gerente)
      if (['Admin', 'Gerente'].includes(user.role)) {
        try {
          const usersRes = await api.get('/users');
          setUsers(usersRes.data.users || []);
        } catch (e) {
          console.error('Error fetching users:', e);
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast('Por favor selecciona un archivo de imagen', 'error', 3000);
        return;
      }


      if (file.size > 5 * 1024 * 1024) {
        addToast('La imagen no debe superar 5MB', 'error', 3000);
        return;
      }

      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description || '');
      formData.append('price', parseFloat(productForm.price));
      formData.append('stock', parseInt(productForm.stock, 10));
      formData.append('category_id', productForm.category_id);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        addToast('✓ Producto actualizado', 'success', 2000);
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        addToast('✓ Producto creado', 'success', 2000);
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', stock: '', category_id: '', image_url: '' });
      setImageFile(null);
      setImagePreview(null);
      fetchData();
    } catch (err) {
      console.error('Error submitting product:', err.response?.data);
      addToast(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error', 'error', 3000);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      addToast('✓ Producto eliminado', 'success', 2000);
      fetchData();
    } catch (err) {
      addToast('Error al eliminar', 'error', 2000);
    }
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category_id: product.category_id || '',
      image_url: product.image_url || ''
    });
    setImageFile(null);
    setImagePreview(product.image_url || null);
    setShowProductModal(true);
  };
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, categoryForm);
        addToast('✓ Categoría actualizada', 'success', 2000);
      } else {
        await api.post('/categories', categoryForm);
        addToast('✓ Categoría creada', 'success', 2000);
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '' });
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error', 'error', 3000);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await api.delete(`/categories/${id}`);
      addToast('✓ Categoría eliminada', 'success', 2000);
      fetchData();
    } catch (err) {
      addToast('Error al eliminar', 'error', 2000);
    }
  };

  const openEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || ''
    });
    setShowCategoryModal(true);
  };


  // CRUD Promociones
  const handlePromotionSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...promotionForm,
        discount_value: parseFloat(promotionForm.discount_value),
        min_purchase_amount: promotionForm.min_purchase_amount ? parseFloat(promotionForm.min_purchase_amount) : 0,
        max_discount_amount: promotionForm.max_discount_amount ? parseFloat(promotionForm.max_discount_amount) : null,
        usage_limit: promotionForm.usage_limit ? parseInt(promotionForm.usage_limit) : null,
        product_id: promotionForm.product_id || null,
        category_id: promotionForm.category_id || null
      };

      if (editingPromotion) {
        await api.put(`/promotions/${editingPromotion.id}`, formData);
        addToast('✓ Promoción actualizada', 'success', 2000);
      } else {
        await api.post('/promotions', formData);
        addToast('✓ Promoción creada', 'success', 2000);
      }
      setShowPromotionModal(false);
      setEditingPromotion(null);
      setPromotionForm({
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        start_date: '',
        end_date: '',
        product_id: '',
        category_id: '',
        min_purchase_amount: '',
        max_discount_amount: '',
        usage_limit: ''
      });
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error', 'error', 3000);
    }
  };

  const handleDeletePromotion = async (id) => {
    if (!confirm('¿Eliminar esta promoción?')) return;
    try {
      await api.delete(`/promotions/${id}`);
      addToast('✓ Promoción eliminada', 'success', 2000);
      fetchData();
    } catch (err) {
      addToast('Error al eliminar', 'error', 2000);
    }
  };

  const openEditPromotion = (promotion) => {
    setEditingPromotion(promotion);
    setPromotionForm({
      name: promotion.name,
      description: promotion.description || '',
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value,
      start_date: promotion.start_date ? new Date(promotion.start_date).toISOString().split('T')[0] : '',
      end_date: promotion.end_date ? new Date(promotion.end_date).toISOString().split('T')[0] : '',
      product_id: promotion.product_id || '',
      category_id: promotion.category_id || '',
      min_purchase_amount: promotion.min_purchase_amount || '',
      max_discount_amount: promotion.max_discount_amount || '',
      usage_limit: promotion.usage_limit || ''
    });
    setShowPromotionModal(true);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus });
      addToast('✓ Estado actualizado', 'success', 2000);
      fetchData();
    } catch (err) {
      addToast('Error al actualizar', 'error', 2000);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  const pendingOrders = orders.filter(o => o.status === 'Pendiente').length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'categories', label: 'Categorías', icon: Tag },
    { id: 'promotions', label: 'Promociones', icon: Sparkles },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    ...((['Admin', 'Gerente'].includes(user?.role)) ? [{ id: 'users', label: 'Usuarios', icon: Users }] : [])
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col fixed h-screen z-40`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-brand-gold to-yellow-500 rounded-xl">
                  <Crown className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 dark:text-white">Admin</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">WhiteStar</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setSearchTerm('');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === item.id
                ? 'bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 shadow-lg shadow-brand-gold/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-bold">{item.label}</span>}
              {sidebarOpen && activeView === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <div className="p-8">
          {error && <ErrorMessage message={error} />}

          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                  Bienvenido, {user?.first_name} 👋
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Aquí está un resumen de tu tienda
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    {lowStockProducts > 0 && (
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
                        {lowStockProducts} bajos
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{products.length}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Productos</p>
                  <button
                    onClick={() => setActiveView('products')}
                    className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline"
                  >
                    Ver todos →
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    {pendingOrders > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs font-bold rounded-full animate-pulse">
                        {pendingOrders} nuevos
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{orders.length}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Pedidos</p>
                  <button
                    onClick={() => setActiveView('orders')}
                    className="mt-4 text-purple-600 dark:text-purple-400 text-sm font-bold hover:underline"
                  >
                    Gestionar →
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{users.length}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Usuarios</p>
                  {['Admin', 'Gerente'].includes(user?.role) && (
                    <button
                      onClick={() => setActiveView('users')}
                      className="mt-4 text-green-600 dark:text-green-400 text-sm font-bold hover:underline"
                    >
                      Ver todos →
                    </button>
                  )}
                </div>

                <div className="bg-gradient-to-br from-brand-gold/20 to-yellow-500/20 dark:from-brand-gold/10 dark:to-yellow-500/10 rounded-2xl p-6 border border-brand-gold/30 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-brand-gold rounded-xl">
                      <DollarSign className="w-6 h-6 text-slate-900" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-brand-gold" />
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                    ${totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Ingresos Totales</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Acciones Rápidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => {
                      setActiveView('products');
                      setEditingProduct(null);
                      setProductForm({ name: '', description: '', price: '', stock: '', category_id: '', image_url: '' });
                      setImageFile(null);
                      setImagePreview(null);
                      setShowProductModal(true);
                    }}
                    className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-gold dark:hover:border-brand-gold transition-all hover:shadow-lg text-left group"
                  >
                    <Plus className="w-8 h-8 text-brand-gold mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Nuevo Producto</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Agregar producto al catálogo</p>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('categories');
                      setEditingCategory(null);
                      setCategoryForm({ name: '', description: '' });
                      setShowCategoryModal(true);
                    }}
                    className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-gold dark:hover:border-brand-gold transition-all hover:shadow-lg text-left group"
                  >
                    <Tag className="w-8 h-8 text-brand-gold mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Nueva Categoría</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Organizar productos</p>
                  </button>

                  <button
                    onClick={() => setActiveView('orders')}
                    className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-gold dark:hover:border-brand-gold transition-all hover:shadow-lg text-left group"
                  >
                    <ShoppingBag className="w-8 h-8 text-brand-gold mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Ver Pedidos</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Gestionar órdenes</p>
                  </button>
                </div>
              </div>

              {/* Recent Orders */}
              {orders.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Pedidos Recientes</h2>
                    <button
                      onClick={() => setActiveView('orders')}
                      className="text-brand-gold font-bold hover:underline"
                    >
                      Ver todos
                    </button>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="p-4 border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
                              #{order.id.substring(0, 8).toUpperCase()}
                            </p>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {order.User?.first_name} {order.User?.last_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-brand-gold">
                              ${parseFloat(order.total).toFixed(2)}
                            </p>
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
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Products View */}
          {activeView === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Productos</h1>
                  <p className="text-slate-600 dark:text-slate-400">{products.length} productos en total</p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({ name: '', description: '', price: '', stock: '', category_id: '', image_url: '' });
                    setImageFile(null);
                    setImagePreview(null);
                    setShowProductModal(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Nuevo Producto
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all group"
                  >
                    <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                      <img
                        src={getImageUrl(product.image_url)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditProduct(product)}
                          className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg hover:scale-110 transition-transform"
                        >
                          <Edit size={16} className="text-blue-600" />
                        </button>
                        {['Admin', 'Gerente'].includes(user?.role) && (
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg hover:scale-110 transition-transform"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        )}
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${product.stock > 10
                          ? 'bg-green-500 text-white'
                          : product.stock > 0
                            ? 'bg-yellow-500 text-white'
                            : 'bg-red-500 text-white'
                          }`}>
                          Stock: {product.stock}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {product.Category?.name || 'Sin categoría'}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white mt-1 mb-2 truncate">
                        {product.name}
                      </h3>
                      <p className="text-2xl font-black text-brand-gold">
                        ${parseFloat(product.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories View */}
          {activeView === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Categorías</h1>
                  <p className="text-slate-600 dark:text-slate-400">{categories.length} categorías</p>
                </div>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({ name: '', description: '' });
                    setShowCategoryModal(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Nueva Categoría
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-brand-gold/10 rounded-xl">
                        <Tag className="w-6 h-6 text-brand-gold" />
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditCategory(category)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition"
                        >
                          <Edit size={16} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-black text-xl text-slate-900 dark:text-white mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {category.description || 'Sin descripción'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders View */}
          {activeView === 'orders' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Pedidos</h1>
                <p className="text-slate-600 dark:text-slate-400">{orders.length} pedidos totales</p>
              </div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-mono text-sm text-slate-500 dark:text-slate-400 mb-2">
                          #{order.id.substring(0, 8).toUpperCase()}
                        </p>
                        <p className="font-bold text-lg text-slate-900 dark:text-white">
                          {order.User?.first_name} {order.User?.last_name}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{order.User?.email}</p>
                        {order.OrderItems && order.OrderItems.length > 0 && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            {order.OrderItems.length} productos
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total</p>
                          <p className="text-2xl font-black text-brand-gold">
                            ${parseFloat(order.total).toFixed(2)}
                          </p>
                        </div>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-brand-gold"
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Confirmado">Confirmado</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Entregado">Entregado</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users View */}
          {activeView === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Usuarios</h1>
                  <p className="text-slate-600 dark:text-slate-400">{users.length} usuarios registrados</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-black text-slate-900 dark:text-white uppercase">Usuario</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-slate-900 dark:text-white uppercase">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-slate-900 dark:text-white uppercase">Rol</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-slate-900 dark:text-white uppercase">Registro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                {u.first_name?.[0]}{u.last_name?.[0]}
                              </div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {u.first_name} {u.last_name}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {u.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${u.Role?.name === 'Admin'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              : u.Role?.name === 'Gerente'
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              }`}>
                              {u.Role?.name || 'Cliente'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                            {new Date(u.created_at).toLocaleDateString('es-CL')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Promotions View */}
          {activeView === 'promotions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Promociones</h1>
                  <p className="text-slate-600 dark:text-slate-400">{promotions.length} promociones totales</p>
                </div>
                <button
                  onClick={() => {
                    setEditingPromotion(null);
                    setPromotionForm({
                      name: '',
                      description: '',
                      discount_type: 'percentage',
                      discount_value: '',
                      start_date: '',
                      end_date: '',
                      product_id: '',
                      category_id: '',
                      min_purchase_amount: '',
                      max_discount_amount: '',
                      usage_limit: ''
                    });
                    setShowPromotionModal(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Nueva Promoción
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions.map((promo) => {
                  const isActive = promo.is_active && new Date(promo.start_date) <= new Date() && new Date(promo.end_date) >= new Date();
                  return (
                    <div
                      key={promo.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-brand-gold" />
                            <h3 className="font-black text-lg text-slate-900 dark:text-white truncate">
                              {promo.name}
                            </h3>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {promo.description || 'Sin descripción'}
                          </p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditPromotion(promo)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition"
                          >
                            <Edit size={16} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeletePromotion(promo.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Descuento:</span>
                          <span className="font-black text-brand-gold">
                            {promo.discount_type === 'percentage'
                              ? `${promo.discount_value}%`
                              : `$${parseFloat(promo.discount_value).toFixed(2)}`
                            }
                          </span>
                        </div>

                        {promo.Product && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Producto:</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                              {promo.Product.name}
                            </span>
                          </div>
                        )}

                        {promo.Category && !promo.Product && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Categoría:</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {promo.Category.name}
                            </span>
                          </div>
                        )}

                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500 dark:text-slate-400">Inicio:</span>
                            <span className="text-slate-900 dark:text-white">
                              {new Date(promo.start_date).toLocaleDateString('es-CL')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Fin:</span>
                            <span className="text-slate-900 dark:text-white">
                              {new Date(promo.end_date).toLocaleDateString('es-CL')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isActive
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}>
                            {isActive ? 'Activa' : 'Inactiva'}
                          </span>
                          {promo.usage_limit && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {promo.usage_count || 0}/{promo.usage_limit} usos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {promotions.length === 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
                  <Sparkles className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 font-semibold mb-4">
                    No hay promociones creadas
                  </p>
                  <button
                    onClick={() => setShowPromotionModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    Crear Primera Promoción
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal Producto - Same as before */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="sticky top-0 p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {editingProduct ? 'Editar Producto' : 'Crear Producto'}
              </h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nombre</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Descripción</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Stock</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Categoría</label>
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Imagen</label>
                {imagePreview && (
                  <div className="mb-4 relative">
                    <img
                      src={getImageUrl(imagePreview)}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (imagePreview && imagePreview.startsWith('blob:')) {
                          URL.revokeObjectURL(imagePreview);
                        }
                        setImageFile(null);
                        setImagePreview(null);
                        setProductForm({ ...productForm, image_url: '' });
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-brand-gold file:text-slate-900 hover:file:bg-yellow-500 cursor-pointer"
                  required={!editingProduct && !imagePreview}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 py-4 rounded-xl font-black hover:shadow-lg transition-all"
              >
                {editingProduct ? 'Actualizar' : 'Crear'} Producto
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Categoría - Same as before */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {editingCategory ? 'Editar Categoría' : 'Crear Categoría'}
              </h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nombre</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Descripción</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  rows="3"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 py-4 rounded-xl font-black hover:shadow-lg transition-all"
              >
                {editingCategory ? 'Actualizar' : 'Crear'} Categoría
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Promoción */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="sticky top-0 p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {editingPromotion ? 'Editar Promoción' : 'Crear Promoción'}
              </h2>
              <button
                onClick={() => setShowPromotionModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePromotionSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nombre de la Promoción</label>
                <input
                  type="text"
                  value={promotionForm.name}
                  onChange={(e) => setPromotionForm({ ...promotionForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="Ej: Descuento de Verano"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Descripción</label>
                <textarea
                  value={promotionForm.description}
                  onChange={(e) => setPromotionForm({ ...promotionForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  rows="3"
                  placeholder="Descripción de la promoción..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tipo de Descuento</label>
                  <select
                    value={promotionForm.discount_type}
                    onChange={(e) => setPromotionForm({ ...promotionForm, discount_type: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed_amount">Monto Fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Valor del Descuento {promotionForm.discount_type === 'percentage' ? '(%)' : '($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={promotionForm.discount_value}
                    onChange={(e) => setPromotionForm({ ...promotionForm, discount_value: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    placeholder={promotionForm.discount_type === 'percentage' ? '10' : '5000'}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={promotionForm.start_date}
                    onChange={(e) => setPromotionForm({ ...promotionForm, start_date: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Fecha de Fin</label>
                  <input
                    type="date"
                    value={promotionForm.end_date}
                    onChange={(e) => setPromotionForm({ ...promotionForm, end_date: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    required
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Aplicar a:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Producto Específico</label>
                    <select
                      value={promotionForm.product_id}
                      onChange={(e) => {
                        setPromotionForm({ ...promotionForm, product_id: e.target.value, category_id: '' });
                      }}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    >
                      <option value="">Ninguno</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Categoría Completa</label>
                    <select
                      value={promotionForm.category_id}
                      onChange={(e) => {
                        setPromotionForm({ ...promotionForm, category_id: e.target.value, product_id: '' });
                      }}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    >
                      <option value="">Ninguna</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Selecciona un producto O una categoría (no ambos)
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Compra Mínima ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={promotionForm.min_purchase_amount}
                    onChange={(e) => setPromotionForm({ ...promotionForm, min_purchase_amount: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Descuento Máximo ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={promotionForm.max_discount_amount}
                    onChange={(e) => setPromotionForm({ ...promotionForm, max_discount_amount: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    placeholder="Sin límite"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Límite de Usos</label>
                  <input
                    type="number"
                    value={promotionForm.usage_limit}
                    onChange={(e) => setPromotionForm({ ...promotionForm, usage_limit: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    placeholder="Ilimitado"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 py-4 rounded-xl font-black hover:shadow-lg transition-all"
              >
                {editingPromotion ? 'Actualizar' : 'Crear'} Promoción
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
