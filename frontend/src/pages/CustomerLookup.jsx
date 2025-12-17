import { useState, useEffect } from 'react';
import { Search, User, ShoppingBag, Calendar, AlertCircle, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';

export default function CustomerLookup() {
    const { addToast } = useToast();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        fetchInitialCustomers();
    }, []);

    const fetchInitialCustomers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/customer-service/customers/search');
            setCustomers(response.data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (query.length < 2) {
            addToast('Ingresa al menos 2 caracteres', 'warning');
            return;
        }

        try {
            setLoading(true);
            setSelectedCustomer(null);
            setProfileData(null);
            const response = await api.get('/customer-service/customers/search', { params: { query } });
            setCustomers(response.data.data || []);
            if (response.data.data?.length === 0) {
                addToast('No se encontraron clientes', 'info');
            }
        } catch (error) {
            console.error(error);
            addToast('Error al buscar clientes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCustomer = async (customer) => {
        try {
            setLoading(true);
            setSelectedCustomer(customer);
            const response = await api.get(`/customer-service/customers/${customer.id}/profile`);
            setProfileData(response.data.data);
        } catch (error) {
            console.error(error);
            addToast('Error al cargar perfil del cliente', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(value || 0);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Búsqueda de Clientes
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Busca clientes por nombre, email o teléfono para ver su historial completo.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 mb-6 shadow-sm">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar por nombre, apellido o email..."
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
                        {customers.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        Resultados ({customers.length})
                                    </h3>
                                </div>
                                <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
                                    {customers.map((customer) => (
                                        <button
                                            key={customer.id}
                                            onClick={() => handleSelectCustomer(customer)}
                                            className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition flex items-center justify-between ${selectedCustomer?.id === customer.id ? 'bg-brand-gold/10 border-l-4 border-brand-gold' : ''
                                                }`}
                                        >
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {customer.first_name} {customer.last_name}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {customer.email}
                                                </p>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-400" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Customer Profile Detail */}
                    <div className="lg:col-span-2">
                        {profileData ? (
                            <div className="space-y-6">
                                {/* Customer Header */}
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold text-2xl font-bold">
                                                {profileData.customer.first_name[0]}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                                    {profileData.customer.first_name} {profileData.customer.last_name}
                                                </h2>
                                                <p className="text-slate-600 dark:text-slate-400">
                                                    {profileData.customer.email}
                                                </p>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    Cliente desde: {formatDate(profileData.customer.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium">
                                            {profileData.customer.Role?.name || 'Cliente'}
                                        </span>
                                    </div>

                                    {/* Statistics */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Gastado</p>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(profileData.statistics.total_spent)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Órdenes</p>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                                {profileData.statistics.total_orders}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Reservas</p>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                                {profileData.statistics.total_reservations}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Reclamos</p>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                                {profileData.statistics.total_complaints}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity Tabs */}
                                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <ShoppingBag size={20} className="text-brand-gold" />
                                            Últimas Órdenes
                                        </h3>
                                        {profileData.orders.length > 0 ? (
                                            <div className="space-y-4">
                                                {profileData.orders.map((order) => (
                                                    <div key={order.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="font-medium text-slate-900 dark:text-white">
                                                                    Orden #{order.id}
                                                                </p>
                                                                <p className="text-sm text-slate-500">
                                                                    {formatDate(order.created_at)}
                                                                </p>
                                                            </div>
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${order.status === 'Entregado' ? 'bg-green-100 text-green-700' :
                                                                order.status === 'Cancelado' ? 'bg-red-100 text-red-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-end">
                                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                {order.OrderItems?.length || 0} productos
                                                            </p>
                                                            <p className="font-bold text-slate-900 dark:text-white">
                                                                {formatCurrency(order.total)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 italic">No hay órdenes registradas</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Reservations */}
                                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Calendar size={20} className="text-brand-gold" />
                                            Reservas Recientes
                                        </h3>
                                        {profileData.reservations.length > 0 ? (
                                            <div className="space-y-3">
                                                {profileData.reservations.map((res) => (
                                                    <div key={res.id} className="border-b border-slate-100 dark:border-slate-700 pb-3 last:border-0 last:pb-0">
                                                        <div className="flex justify-between">
                                                            <p className="font-medium text-slate-900 dark:text-white text-sm">
                                                                {res.Product?.name}
                                                            </p>
                                                            <span className={`text-xs px-2 py-0.5 rounded ${res.status === 'Confirmada' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                                }`}>
                                                                {res.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {formatDate(res.created_at)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 italic text-sm">No hay reservas</p>
                                        )}
                                    </div>

                                    {/* Complaints */}
                                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <AlertCircle size={20} className="text-red-500" />
                                            Reclamos
                                        </h3>
                                        {profileData.complaints.length > 0 ? (
                                            <div className="space-y-3">
                                                {profileData.complaints.map((comp) => (
                                                    <div key={comp.id} className="border-b border-slate-100 dark:border-slate-700 pb-3 last:border-0 last:pb-0">
                                                        <div className="flex justify-between">
                                                            <p className="font-medium text-slate-900 dark:text-white text-sm truncate pr-2">
                                                                {comp.subject}
                                                            </p>
                                                            <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${comp.status === 'Resuelto' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                {comp.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {formatDate(comp.created_at)} • {comp.priority}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 italic text-sm">No hay reclamos registrados</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
                                <User size={48} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    Selecciona un cliente
                                </h3>
                                <p className="text-slate-500">
                                    Busca y selecciona un cliente de la lista para ver su perfil completo.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
