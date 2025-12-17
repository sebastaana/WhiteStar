import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Package, Search, AlertTriangle, CheckCircle, XCircle, TrendingDown,
    Barcode, DollarSign, Tag, Filter, X, Eye, ShoppingCart, Clock,
    RefreshCw, Info, Zap, Star
} from 'lucide-react';
import { getImageUrl } from '../utils/image';

export default function SellerStockView() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [stockFilter, setStockFilter] = useState('all'); // all, available, low, out
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // Check permissions
    useEffect(() => {
        if (!user || !['Vendedor', 'Admin', 'Gerente'].includes(user.role)) {
            navigate('/');
        }
    }, [user, navigate]);

    // Fetch data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            setProducts(productsRes.data.products || []);
            setCategories(categoriesRes.data.categories || []);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;

        let matchesStock = true;
        if (stockFilter === 'available') matchesStock = product.stock > 10;
        if (stockFilter === 'low') matchesStock = product.stock > 0 && product.stock <= 10;
        if (stockFilter === 'out') matchesStock = product.stock === 0;

        return matchesSearch && matchesCategory && matchesStock;
    });

    // Calculate stats
    const stats = {
        total: products.length,
        available: products.filter(p => p.stock > 10).length,
        low: products.filter(p => p.stock > 0 && p.stock <= 10).length,
        out: products.filter(p => p.stock === 0).length
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { label: 'Agotado', color: 'red', icon: XCircle };
        if (stock <= 10) return { label: 'Stock Bajo', color: 'yellow', icon: AlertTriangle };
        return { label: 'Disponible', color: 'green', icon: CheckCircle };
    };

    const getStockColor = (stock) => {
        if (stock === 0) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
        if (stock <= 10) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                                <Package className="w-10 h-10 text-brand-gold" />
                                Consulta de Stock
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                Vista rápida de disponibilidad de productos para atención al cliente
                            </p>
                        </div>
                        <button
                            onClick={fetchData}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-slate-900 rounded-lg font-bold hover:shadow-lg transition-all"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Actualizar
                        </button>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Última actualización: {lastUpdate.toLocaleTimeString('es-CL')}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                            <Package className="w-5 h-5 text-slate-500" />
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Total Productos</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-2xl font-black text-green-600 dark:text-green-400">{stats.available}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Disponibles</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center justify-between mb-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            <span className="text-2xl font-black text-yellow-600 dark:text-yellow-400">{stats.low}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Stock Bajo</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-red-200 dark:border-red-800">
                        <div className="flex items-center justify-between mb-2">
                            <XCircle className="w-5 h-5 text-red-500" />
                            <span className="text-2xl font-black text-red-600 dark:text-red-400">{stats.out}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Agotados</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar producto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                            <option value="all">Todas las categorías</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>

                        {/* Stock Filter */}
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                            <option value="all">Todos los stocks</option>
                            <option value="available">Disponibles (+ de 10)</option>
                            <option value="low">Stock Bajo (1-10)</option>
                            <option value="out">Agotados</option>
                        </select>
                    </div>

                    {(searchTerm || selectedCategory !== 'all' || stockFilter !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('all');
                                setStockFilter('all');
                            }}
                            className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-brand-gold transition"
                        >
                            <X className="w-4 h-4" />
                            Limpiar filtros
                        </button>
                    )}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.length === 0 ? (
                        <div className="col-span-full bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
                            <Package className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400 font-semibold">
                                No se encontraron productos
                            </p>
                        </div>
                    ) : (
                        filteredProducts.map((product) => {
                            const status = getStockStatus(product.stock);
                            const StatusIcon = status.icon;

                            return (
                                <div
                                    key={product.id}
                                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all"
                                >
                                    {/* Product Image */}
                                    <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 p-4">
                                        <img
                                            src={getImageUrl(product.image_url)}
                                            alt={product.name}
                                            className="w-full h-full object-contain"
                                        />
                                        {/* Stock Badge */}
                                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${getStockColor(product.stock)} flex items-center gap-1`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {status.label}
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <div className="mb-3">
                                            {product.Category && (
                                                <span className="inline-block px-2 py-1 bg-brand-gold/10 text-brand-gold text-xs font-bold rounded mb-2">
                                                    {product.Category.name}
                                                </span>
                                            )}
                                            <h3 className="font-black text-lg text-slate-900 dark:text-white mb-1">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                                {product.description}
                                            </p>
                                        </div>

                                        {/* Stock Info */}
                                        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    Stock Disponible
                                                </span>
                                                <span className="text-2xl font-black text-brand-gold">
                                                    {product.stock}
                                                </span>
                                            </div>
                                            {product.stock > 0 && (
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${product.stock > 10 ? 'bg-green-500' : 'bg-yellow-500'
                                                            }`}
                                                        style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Precio</p>
                                                <p className="text-2xl font-black text-slate-900 dark:text-white">
                                                    ${parseFloat(product.price).toFixed(2)}
                                                </p>
                                            </div>
                                            {product.stock > 0 && (
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Valor Total</p>
                                                    <p className="text-lg font-bold text-brand-gold">
                                                        ${(parseFloat(product.price) * product.stock).toFixed(2)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/product/${product.id}`)}
                                                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-brand-gold hover:text-slate-900 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Ver
                                            </button>
                                            {product.stock > 0 && (
                                                <button
                                                    onClick={() => navigate(`/product/${product.id}`)}
                                                    className="flex-1 px-4 py-2 bg-brand-gold text-slate-900 rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                                >
                                                    <ShoppingCart className="w-4 h-4" />
                                                    Vender
                                                </button>
                                            )}
                                        </div>

                                        {/* Additional Info */}
                                        {product.stock === 0 && (
                                            <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                <p className="text-xs text-red-700 dark:text-red-300 font-bold flex items-center gap-2">
                                                    <Info className="w-3 h-3" />
                                                    Informar al cliente sobre reposición
                                                </p>
                                            </div>
                                        )}
                                        {product.stock > 0 && product.stock <= 5 && (
                                            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                                <p className="text-xs text-yellow-700 dark:text-yellow-300 font-bold flex items-center gap-2">
                                                    <Zap className="w-3 h-3" />
                                                    ¡Últimas unidades disponibles!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Quick Tips */}
                <div className="mt-8 bg-gradient-to-r from-brand-gold/10 to-yellow-500/10 rounded-xl p-6 border border-brand-gold/20">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5 text-brand-gold" />
                        Tips para Vendedores
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Verifica el stock antes de confirmar la venta al cliente</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span>Si el stock está bajo (amarillo), informa al cliente que quedan pocas unidades</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span>Para productos agotados, ofrece alternativas similares o toma datos para notificar cuando haya stock</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <RefreshCw className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                            <span>Actualiza la vista regularmente para tener información en tiempo real</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
