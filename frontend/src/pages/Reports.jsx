import { useState, useEffect } from 'react';
import {
    TrendingUp, DollarSign, Package, ShoppingCart, AlertCircle,
    Calendar, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import api from '../services/api';
import { useToast } from '../hooks/useToast';

export default function Reports() {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dateRange, setDateRange] = useState({
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });

    // Dashboard KPIs
    const [dashboardData, setDashboardData] = useState(null);

    // Sales Report
    const [salesData, setSalesData] = useState(null);

    // Inventory Report
    const [inventoryData, setInventoryData] = useState(null);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (activeTab === 'sales') fetchSalesReport();
        else if (activeTab === 'inventory') fetchInventoryReport();
    }, [activeTab, dateRange]);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/reports/dashboard');
            setDashboardData(response.data.data);
        } catch (error) {
            console.error(error);
            // Silent fail for dashboard init
        } finally {
            setLoading(false);
        }
    };

    const fetchSalesReport = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reports/sales', { params: dateRange });
            setSalesData(response.data.data);
        } catch (error) {
            console.error(error);
            addToast('Error al cargar reporte de ventas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchInventoryReport = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reports/inventory');
            setInventoryData(response.data.data);
        } catch (error) {
            console.error(error);
            addToast('Error al cargar reporte de inventario', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(value || 0);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('es-CL').format(value || 0);
    };

    const KPICard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
            orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
            red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
            purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
        };

        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                            {title}
                        </p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                            {value}
                        </p>
                        {trend && (
                            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs mes anterior
                            </p>
                        )}
                    </div>
                    <div className={`p-3 rounded-lg ${colors[color]}`}>
                        <Icon size={24} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        Reportes y Análisis
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Panel de control ejecutivo con métricas clave del negocio
                    </p>
                </div>

                {/* Date Range Selector */}
                {activeTab !== 'dashboard' && activeTab !== 'inventory' && (
                    <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                            <Calendar className="text-slate-400" size={20} />
                            <div className="flex gap-4 flex-1">
                                <div>
                                    <label className="text-sm text-slate-600 dark:text-slate-400 block mb-1">
                                        Fecha Inicio
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.start_date}
                                        onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-600 dark:text-slate-400 block mb-1">
                                        Fecha Fin
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.end_date}
                                        onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (activeTab === 'sales') fetchSalesReport();
                                }}
                                className="px-4 py-2 bg-brand-gold text-slate-900 rounded-lg hover:bg-yellow-500 transition font-medium"
                            >
                                Aplicar
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                        { id: 'sales', label: 'Ventas', icon: DollarSign },
                        { id: 'inventory', label: 'Inventario', icon: Package }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition whitespace-nowrap ${activeTab === id
                                ? 'bg-brand-gold text-slate-900'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            <Icon size={18} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto"></div>
                        <p className="mt-4 text-slate-600 dark:text-slate-400">Generando reporte...</p>
                    </div>
                ) : (
                    <>
                        {/* Dashboard Tab */}
                        {activeTab === 'dashboard' && dashboardData && (
                            <div className="space-y-6">
                                {/* KPIs Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <KPICard title="Ventas Hoy" value={formatCurrency(dashboardData.kpis.today_sales)} icon={DollarSign} color="green" />
                                    <KPICard title="Ventas del Mes" value={formatCurrency(dashboardData.kpis.month_sales)} icon={TrendingUp} color="blue" />
                                    <KPICard title="Reservas Activas" value={formatNumber(dashboardData.kpis.active_reservations)} icon={ShoppingCart} color="purple" />
                                    <KPICard title="Alertas de Stock" value={formatNumber(dashboardData.kpis.low_stock_alerts)} icon={AlertCircle} color="orange" />
                                </div>

                                {/* Revenue Trend Chart */}
                                {dashboardData.revenue_trend && (
                                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tendencia de Ingresos (7 días)</h3>
                                        <div className="h-80 w-full min-w-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={dashboardData.revenue_trend}>
                                                    <defs>
                                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
                                                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                                    <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={(str) => new Date(str).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })} />
                                                    <YAxis stroke="#94a3b8" tickFormatter={(val) => `$${val / 1000}k`} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                                        formatter={(value) => [formatCurrency(value), 'Ingresos']}
                                                        labelFormatter={(label) => new Date(label).toLocaleDateString('es-CL')}
                                                    />
                                                    <Area type="monotone" dataKey="revenue" stroke="#D4AF37" fillOpacity={1} fill="url(#colorRevenue)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Sales Tab */}
                        {activeTab === 'sales' && salesData && (
                            <div className="space-y-6">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Pedidos</p>
                                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatNumber(salesData.summary.total_orders)}</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Ingresos Totales</p>
                                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(salesData.summary.total_revenue)}</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Ticket Promedio</p>
                                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(salesData.summary.average_order_value)}</p>
                                    </div>
                                </div>

                                {/* Charts Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Sales Over Time */}
                                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Ventas en el Tiempo</h3>
                                        <div className="h-80 w-full min-w-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={salesData.sales_over_time}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                                    <XAxis dataKey="period" stroke="#94a3b8" />
                                                    <YAxis yAxisId="left" stroke="#94a3b8" />
                                                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                                                    <Legend />
                                                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#D4AF37" name="Ingresos" strokeWidth={2} />
                                                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" name="Pedidos" strokeWidth={2} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Sales by Category */}
                                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Ventas por Categoría</h3>
                                        <div className="h-80 w-full min-w-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={salesData.sales_by_category}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        fill="#8884d8"
                                                        paddingAngle={5}
                                                        dataKey="total_revenue"
                                                        nameKey="category_name"
                                                        label={({ category_name, percent }) => `${category_name} (${(percent * 100).toFixed(0)}%)`}
                                                    >
                                                        {(salesData.sales_by_category || []).map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                                        formatter={(value) => formatCurrency(value)}
                                                    />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Products Table */}
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top 10 Productos</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="border-b border-slate-200 dark:border-slate-700">
                                                <tr>
                                                    <th className="py-3 px-4 text-slate-600 dark:text-slate-400">Producto</th>
                                                    <th className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">Unidades</th>
                                                    <th className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">Ingresos</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {salesData.top_products.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                        <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{item.Product?.name}</td>
                                                        <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">{formatNumber(item.total_quantity)}</td>
                                                        <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-bold">{formatCurrency(item.total_revenue)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Inventory Tab */}
                        {activeTab === 'inventory' && inventoryData && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Productos</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatNumber(inventoryData.summary.total_products)}</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Unidades Totales</p>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(inventoryData.summary.total_stock_units)}</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Valor Total</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(inventoryData.summary.total_stock_value)}</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Stock Bajo</p>
                                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatNumber(inventoryData.summary.low_stock_products)}</p>
                                    </div>
                                </div>

                                {/* Inventory Chart */}
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Valor de Inventario por Categoría</h3>
                                    <div className="h-96 w-full min-w-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={inventoryData.by_category} layout="vertical" margin={{ left: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                                                <XAxis type="number" stroke="#94a3b8" tickFormatter={(val) => `$${val / 1000}k`} />
                                                <YAxis dataKey="category" type="category" stroke="#94a3b8" width={100} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                                    formatter={(value) => formatCurrency(value)}
                                                />
                                                <Bar dataKey="total_value" fill="#D4AF37" radius={[0, 4, 4, 0]} name="Valor Stock" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
