import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Download, Search, History, Calendar, Filter, X, Save, BarChart2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StockManagement() {
    const { addToast } = useToast();
    const [alerts, setAlerts] = useState([]);
    const [products, setProducts] = useState([]);
    const [movements, setMovements] = useState([]);
    const [patterns, setPatterns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('alerts');
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [adjustmentForm, setAdjustmentForm] = useState({
        type: 'entrada',
        quantity: '',
        reason: ''
    });

    const [movementFilters, setMovementFilters] = useState({
        start_date: '',
        end_date: '',
        movement_type: ''
    });

    const fetchStockData = useCallback(async () => {
        const controller = new AbortController();
        try {
            setLoading(true);
            if (activeTab === 'alerts') {
                const response = await api.get('/stock/alerts?is_active=true', { signal: controller.signal });
                setAlerts(response.data.data || []);
            } else if (activeTab === 'inventory') {
                const response = await api.get('/stock/report', { signal: controller.signal });
                setProducts(response.data.data?.products || []);
            } else if (activeTab === 'movements') {
                const params = { ...movementFilters };
                const [movementsRes, patternsRes] = await Promise.all([
                    api.get('/stock/movements', { params, signal: controller.signal }),
                    api.get('/stock/patterns', { params: { start_date: movementFilters.start_date, end_date: movementFilters.end_date }, signal: controller.signal })
                ]);
                setMovements(movementsRes.data.data || []);
                setPatterns(patternsRes.data.data || []);
            }
        } catch (error) {
            if (axios.isCancel(error)) return;
            console.error('Error fetching stock data:', error);
            addToast('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
        return () => controller.abort();
    }, [activeTab, movementFilters, addToast]);

    useEffect(() => {
        const abortRequest = fetchStockData();
        return () => {
            if (abortRequest && typeof abortRequest.then === 'function') {
                abortRequest.then(abort => abort && abort());
            }
        };
    }, [fetchStockData]);

    const handleAcknowledgeAlert = async (id) => {
        try {
            await api.put(`/stock/alerts/${id}/acknowledge`);
            addToast('Alerta reconocida', 'success');
            fetchStockData();
        } catch (error) {
            addToast('Error al reconocer alerta', 'error');
        }
    };

    const openAdjustmentModal = (product) => {
        setSelectedProduct(product);
        setAdjustmentForm({
            type: 'entrada',
            quantity: '',
            reason: ''
        });
        setIsModalOpen(true);
    };

    const handleStockAdjustment = async (e) => {
        e.preventDefault();
        if (!selectedProduct || !adjustmentForm.quantity || !adjustmentForm.reason) {
            addToast('Por favor complete todos los campos', 'error');
            return;
        }

        const quantity = parseInt(adjustmentForm.quantity);
        if (isNaN(quantity) || quantity <= 0) {
            addToast('La cantidad debe ser mayor a 0', 'error');
            return;
        }

        const change = adjustmentForm.type === 'entrada' ? quantity : -quantity;

        try {
            await api.put(`/stock/${selectedProduct.id}`, {
                quantity: change,
                reason: adjustmentForm.reason,
                movement_type: adjustmentForm.type
            });
            addToast('Stock actualizado exitosamente', 'success');
            setIsModalOpen(false);
            fetchStockData();
        } catch (error) {
            addToast(error.response?.data?.message || 'Error al actualizar stock', 'error');
        }
    };

    const getSeverityColor = (severity) => {
        const colors = {
            Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        };
        return colors[severity] || colors.Medium;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-CL');
    };

    // Export inventory to CSV
    const exportInventoryCSV = () => {
        const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (filteredProducts.length === 0) {
            addToast('No hay productos para exportar', 'error');
            return;
        }

        const headers = ['Producto', 'Stock Total', 'Stock Reservado', 'Stock Disponible', 'Estado'];
        const rows = filteredProducts.map(p => [
            p.name,
            p.stock,
            p.reserved_stock || 0,
            p.available_stock || p.stock,
            p.is_low_stock ? 'Stock Bajo' : 'Normal'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        addToast('Inventario exportado exitosamente', 'success');
    };

    // Export movements to CSV
    const exportMovementsCSV = () => {
        if (movements.length === 0) {
            addToast('No hay movimientos para exportar', 'error');
            return;
        }

        const headers = ['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Stock Previo', 'Nuevo Stock', 'Usuario', 'Motivo'];
        const rows = movements.map(m => [
            formatDate(m.created_at),
            m.Product?.name || 'N/A',
            m.movement_type?.toUpperCase() || 'N/A',
            m.quantity,
            m.previous_stock,
            m.new_stock,
            `${m.performer?.first_name || ''} ${m.performer?.last_name || ''}`.trim() || 'N/A',
            m.reason || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `movimientos_stock_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        addToast('Reporte de movimientos exportado exitosamente', 'success');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 py-8 relative">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        Gestión de Inventario
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Panel de control para el Administrador de Stock
                    </p>
                </div>

                <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('alerts')}
                        className={`px-6 py-3 font-medium transition border-b-2 whitespace-nowrap ${activeTab === 'alerts'
                            ? 'border-brand-gold text-brand-gold'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <AlertTriangle className="inline mr-2" size={18} />
                        Alertas de Stock
                    </button>
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`px-6 py-3 font-medium transition border-b-2 whitespace-nowrap ${activeTab === 'inventory'
                            ? 'border-brand-gold text-brand-gold'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <Package className="inline mr-2" size={18} />
                        Inventario General
                    </button>
                    <button
                        onClick={() => setActiveTab('movements')}
                        className={`px-6 py-3 font-medium transition border-b-2 whitespace-nowrap ${activeTab === 'movements'
                            ? 'border-brand-gold text-brand-gold'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <History className="inline mr-2" size={18} />
                        Historial y Patrones
                    </button>
                </div>

                {loading && !products.length && !alerts.length && !movements.length ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto"></div>
                    </div>
                ) : activeTab === 'alerts' ? (
                    <div className="grid gap-4">
                        {alerts.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <AlertTriangle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                    No hay alertas activas
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Todos los productos tienen stock suficiente
                                </p>
                            </div>
                        ) : (
                            alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className="bg-white dark:bg-slate-800 border-l-4 border-red-500 rounded-lg p-6 shadow-sm"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                    {alert.Product?.name}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                                                    {alert.severity}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <p className="text-slate-500 dark:text-slate-400">Stock Actual</p>
                                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{alert.current_stock}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 dark:text-slate-400">Umbral</p>
                                                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{alert.threshold}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 dark:text-slate-400">Diferencia</p>
                                                    <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                                                        -{alert.threshold - alert.current_stock}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {!alert.acknowledged_by && (
                                            <button
                                                onClick={() => handleAcknowledgeAlert(alert.id)}
                                                className="ml-4 px-4 py-2 bg-brand-gold text-slate-900 rounded-lg hover:bg-yellow-500 transition font-medium"
                                            >
                                                Reconocer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : activeTab === 'inventory' ? (
                    <div>
                        <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar producto..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                                />
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                <p className="text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                    {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length} productos
                                </p>
                                <button
                                    onClick={exportInventoryCSV}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-slate-900 rounded-lg hover:bg-yellow-500 transition font-medium whitespace-nowrap"
                                >
                                    <Download size={18} />
                                    Exportar CSV
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-900">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Producto</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reservado</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Disponible</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {products
                                            .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map((product) => (
                                                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="font-medium text-slate-900 dark:text-white">{product.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-lg font-bold text-slate-900 dark:text-white">{product.stock}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-slate-600 dark:text-slate-400">{product.reserved_stock}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-slate-900 dark:text-white font-semibold">{product.available_stock}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {product.is_low_stock ? (
                                                            <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-semibold">
                                                                Stock Bajo
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">
                                                                Normal
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => openAdjustmentModal(product)}
                                                            className="px-4 py-2 bg-brand-gold text-slate-900 rounded-lg hover:bg-yellow-500 transition font-medium text-sm"
                                                        >
                                                            Ajustar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2 mb-6">
                                <BarChart2 className="text-brand-gold" size={24} />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Patrones de Consumo (Top Productos)
                                </h2>
                            </div>

                            {patterns.length > 0 ? (
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={patterns} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#374151" />
                                            <XAxis type="number" stroke="#9CA3AF" />
                                            <YAxis dataKey="product_name" type="category" width={150} stroke="#9CA3AF" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                                itemStyle={{ color: '#F3F4F6' }}
                                            />
                                            <Legend />
                                            <Bar dataKey="total_consumed" name="Unidades Consumidas" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                    No hay datos suficientes para analizar patrones en este período.
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex flex-wrap items-end gap-4">
                                <div>
                                    <label className="text-sm text-slate-600 dark:text-slate-400 block mb-1">Desde</label>
                                    <input
                                        type="date"
                                        value={movementFilters.start_date}
                                        onChange={(e) => setMovementFilters({ ...movementFilters, start_date: e.target.value })}
                                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-600 dark:text-slate-400 block mb-1">Hasta</label>
                                    <input
                                        type="date"
                                        value={movementFilters.end_date}
                                        onChange={(e) => setMovementFilters({ ...movementFilters, end_date: e.target.value })}
                                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-600 dark:text-slate-400 block mb-1">Tipo</label>
                                    <select
                                        value={movementFilters.movement_type}
                                        onChange={(e) => setMovementFilters({ ...movementFilters, movement_type: e.target.value })}
                                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    >
                                        <option value="">Todos</option>
                                        <option value="entrada">Entrada</option>
                                        <option value="salida">Salida</option>
                                        <option value="ajuste">Ajuste</option>
                                        <option value="reserva">Reserva</option>
                                        <option value="cancelacion_reserva">Cancelación</option>
                                    </select>
                                </div>
                                <div className="flex-1"></div>
                                <button
                                    onClick={exportMovementsCSV}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-slate-900 rounded-lg hover:bg-yellow-500 transition font-medium"
                                >
                                    <Download size={18} />
                                    Exportar CSV
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-900">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Producto</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cantidad</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock Previo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nuevo Stock</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Usuario</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Razón</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {movements.map((movement) => (
                                            <tr key={movement.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                                                    {formatDate(movement.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-slate-900 dark:text-white">{movement.Product?.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${movement.movement_type === 'entrada' ? 'bg-green-100 text-green-800' :
                                                        movement.movement_type === 'salida' ? 'bg-red-100 text-red-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {movement.movement_type.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                                                    {movement.quantity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                                                    {movement.previous_stock}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-white">
                                                    {movement.new_stock}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                                                    {movement.performer?.first_name} {movement.performer?.last_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                                                    {movement.reason}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {isModalOpen && selectedProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Ajustar Stock: {selectedProduct.name}
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleStockAdjustment} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Tipo de Movimiento
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setAdjustmentForm({ ...adjustmentForm, type: 'entrada' })}
                                            className={`py-2 px-4 rounded-lg font-medium transition ${adjustmentForm.type === 'entrada'
                                                ? 'bg-green-100 text-green-800 ring-2 ring-green-500'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                                }`}
                                        >
                                            <TrendingUp className="inline mr-2" size={16} />
                                            Entrada
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAdjustmentForm({ ...adjustmentForm, type: 'salida' })}
                                            className={`py-2 px-4 rounded-lg font-medium transition ${adjustmentForm.type === 'salida'
                                                ? 'bg-red-100 text-red-800 ring-2 ring-red-500'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                                }`}
                                        >
                                            <TrendingDown className="inline mr-2" size={16} />
                                            Salida
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Cantidad
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={adjustmentForm.quantity}
                                        onChange={(e) => setAdjustmentForm({ ...adjustmentForm, quantity: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                                        placeholder="Ej: 50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Motivo / Nota
                                    </label>
                                    <textarea
                                        required
                                        value={adjustmentForm.reason}
                                        onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                                        rows="3"
                                        placeholder="Ej: Reposición de proveedor, Merma, etc."
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-brand-gold text-slate-900 rounded-lg hover:bg-yellow-500 transition font-medium flex items-center gap-2"
                                    >
                                        <Save size={18} />
                                        Guardar Ajuste
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
