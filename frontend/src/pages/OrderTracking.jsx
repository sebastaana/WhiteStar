import { useState } from 'react';
import { Search, Package, Calendar, CheckCircle, XCircle, Truck, Clock } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';

export default function OrderTracking() {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('orders'); // orders, reservations
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setSelectedItem(null);
            const endpoint = activeTab === 'orders'
                ? '/customer-service/orders/search'
                : '/customer-service/reservations/search';

            const response = await api.get(endpoint, { params: { query } });
            setResults(response.data.data || []);

            if (response.data.data?.length === 0) {
                addToast(`No se encontraron ${activeTab === 'orders' ? 'órdenes' : 'reservas'}`, 'info');
            }
        } catch (error) {
            console.error(error);
            addToast('Error al realizar la búsqueda', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.put(`/customer-service/orders/${id}/status`, { status: newStatus });
            addToast('Estado actualizado exitosamente', 'success');
            // Refresh results
            const updatedResults = results.map(item =>
                item.id === id ? { ...item, status: newStatus } : item
            );
            setResults(updatedResults);
            if (selectedItem?.id === id) {
                setSelectedItem({ ...selectedItem, status: newStatus });
            }
        } catch (error) {
            console.error(error);
            addToast('Error al actualizar estado', 'error');
        }
    };

    const handleConfirmReservation = async (id) => {
        try {
            await api.put(`/customer-service/reservations/${id}/confirm`);
            addToast('Reserva confirmada exitosamente', 'success');
            // Refresh results
            const updatedResults = results.map(item =>
                item.id === id ? { ...item, status: 'Confirmada' } : item
            );
            setResults(updatedResults);
            if (selectedItem?.id === id) {
                setSelectedItem({ ...selectedItem, status: 'Confirmada' });
            }
        } catch (error) {
            console.error(error);
            addToast('Error al confirmar reserva', 'error');
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(value || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-CL');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Seguimiento de Pedidos
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Gestiona el estado de pedidos y confirma reservas de clientes.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => { setActiveTab('orders'); setResults([]); setSelectedItem(null); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${activeTab === 'orders'
                            ? 'bg-brand-gold text-slate-900'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        <Package size={20} />
                        Órdenes
                    </button>
                    <button
                        onClick={() => { setActiveTab('reservations'); setResults([]); setSelectedItem(null); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${activeTab === 'reservations'
                            ? 'bg-brand-gold text-slate-900'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        <Calendar size={20} />
                        Reservas
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 mb-6 shadow-sm">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={activeTab === 'orders' ? "Buscar por ID de orden..." : "Buscar por nombre de cliente..."}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-brand-gold text-slate-900 rounded-lg font-bold hover:bg-yellow-500 transition disabled:opacity-50"
                        >
                            {loading ? 'Buscando...' : 'Buscar'}
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Results List */}
                    <div className="lg:col-span-1 space-y-4">
                        {results.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        Resultados ({results.length})
                                    </h3>
                                </div>
                                <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
                                    {results.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setSelectedItem(item)}
                                            className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${selectedItem?.id === item.id ? 'bg-brand-gold/10 border-l-4 border-brand-gold' : ''
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    #{item.id}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded ${item.status === 'Entregado' || item.status === 'Confirmada' ? 'bg-green-100 text-green-700' :
                                                    item.status === 'Cancelado' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                                {activeTab === 'orders'
                                                    ? `${item.User?.first_name} ${item.User?.last_name}`
                                                    : item.Product?.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {formatDate(item.created_at)}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detail View */}
                    <div className="lg:col-span-2">
                        {selectedItem ? (
                            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                            {activeTab === 'orders' ? `Orden #${selectedItem.id}` : `Reserva #${selectedItem.id}`}
                                        </h2>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            Cliente: {activeTab === 'orders'
                                                ? `${selectedItem.User?.first_name} ${selectedItem.User?.last_name}`
                                                : `${selectedItem.customer?.first_name} ${selectedItem.customer?.last_name}`}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {activeTab === 'orders' ? selectedItem.User?.email : selectedItem.customer?.email}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-brand-gold">
                                            {activeTab === 'orders'
                                                ? formatCurrency(selectedItem.total)
                                                : formatCurrency(selectedItem.Product?.price)}
                                        </p>
                                        <p className="text-sm text-slate-500">Total</p>
                                    </div>
                                </div>

                                {/* Status Management */}
                                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-6 mb-6">
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                                        Gestión de Estado
                                    </h3>

                                    {activeTab === 'orders' ? (
                                        <div className="flex flex-wrap gap-3">
                                            {['Pendiente', 'Confirmado', 'Enviado', 'Entregado', 'Cancelado'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleUpdateStatus(selectedItem.id, status)}
                                                    disabled={selectedItem.status === status}
                                                    className={`px-4 py-2 rounded-lg font-medium transition ${selectedItem.status === status
                                                        ? 'bg-slate-200 dark:bg-slate-600 text-slate-500 cursor-not-allowed'
                                                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-brand-gold hover:text-brand-gold'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div>
                                            {selectedItem.status === 'Pendiente' ? (
                                                <button
                                                    onClick={() => handleConfirmReservation(selectedItem.id)}
                                                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold flex items-center gap-2"
                                                >
                                                    <CheckCircle size={20} />
                                                    Confirmar Reserva
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                                                    <CheckCircle size={20} />
                                                    Reserva Confirmada
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Items List (for orders) */}
                                {activeTab === 'orders' && selectedItem.OrderItems && (
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                                            Productos
                                        </h3>
                                        <div className="space-y-3">
                                            {selectedItem.OrderItems.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-700 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">
                                                            {item.Product?.name}
                                                        </p>
                                                        <p className="text-sm text-slate-500">
                                                            Cantidad: {item.quantity}
                                                        </p>
                                                    </div>
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {formatCurrency(item.price)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Product Info (for reservations) */}
                                {activeTab === 'reservations' && selectedItem.Product && (
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                                            Producto Reservado
                                        </h3>
                                        <div className="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-700 rounded-lg">
                                            <img
                                                src={selectedItem.Product.image_url}
                                                alt={selectedItem.Product.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {selectedItem.Product.name}
                                                </p>
                                                <p className="text-brand-gold font-bold">
                                                    {formatCurrency(selectedItem.Product.price)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center h-full flex flex-col items-center justify-center">
                                {activeTab === 'orders' ? (
                                    <Truck size={48} className="text-slate-300 mb-4" />
                                ) : (
                                    <Clock size={48} className="text-slate-300 mb-4" />
                                )}
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    Selecciona un elemento
                                </h3>
                                <p className="text-slate-500">
                                    Realiza una búsqueda y selecciona un resultado para ver los detalles.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
