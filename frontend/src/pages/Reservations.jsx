import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Package, Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getImageUrl } from '../utils/image';

export default function Reservations() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const isStaff = ['Admin', 'Gerente', 'Vendedor', 'Atención al Cliente'].includes(user?.role);

    useEffect(() => {
        fetchReservations();
    }, [filter]);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const endpoint = isStaff ? '/reservations' : '/reservations/my';
            const params = filter !== 'all' ? `?status=${filter}` : '';
            const response = await api.get(`${endpoint}${params}`);
            setReservations(response.data.data || []);
        } catch (error) {
            addToast('Error al cargar reservas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id) => {
        try {
            await api.post(`/reservations/${id}/confirm`);
            addToast('Reserva confirmada exitosamente', 'success');
            fetchReservations();
        } catch (error) {
            addToast(error.response?.data?.message || 'Error al confirmar reserva', 'error');
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('¿Estás seguro de cancelar esta reserva?')) return;

        try {
            await api.delete(`/reservations/${id}`);
            addToast('Reserva cancelada', 'success');
            fetchReservations();
        } catch (error) {
            addToast('Error al cancelar reserva', 'error');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            Pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            Confirmada: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            Completada: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            Cancelada: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            Expirada: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        };

        const icons = {
            Pendiente: Clock,
            Confirmada: CheckCircle,
            Completada: CheckCircle,
            Cancelada: XCircle,
            Expirada: AlertCircle
        };

        const Icon = icons[status];

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${styles[status]}`}>
                <Icon size={16} />
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        {isStaff ? 'Gestión de Reservas' : 'Mis Reservas'}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        {isStaff ? 'Administra todas las reservas de clientes' : 'Consulta y gestiona tus reservas'}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['all', 'Pendiente', 'Confirmada', 'Completada', 'Cancelada'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === status
                                ? 'bg-brand-gold text-slate-900'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {status === 'all' ? 'Todas' : status}
                        </button>
                    ))}
                </div>

                {/* Reservations List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto"></div>
                        <p className="mt-4 text-slate-600 dark:text-slate-400">Cargando reservas...</p>
                    </div>
                ) : reservations.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                            No hay reservas
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            {filter === 'all' ? 'No tienes reservas registradas' : `No hay reservas con estado "${filter}"`}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {reservations.map((reservation) => (
                            <div
                                key={reservation.id}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:shadow-lg transition"
                            >
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Product Image */}
                                    {reservation.Product?.image_url && (
                                        <img
                                            src={getImageUrl(reservation.Product.image_url)}
                                            alt={reservation.Product.name}
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                    )}

                                    {/* Details */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                    {reservation.Product?.name}
                                                </h3>
                                                {isStaff && reservation.customer && (
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        Cliente: {reservation.customer.first_name} {reservation.customer.last_name}
                                                    </p>
                                                )}
                                            </div>
                                            {getStatusBadge(reservation.status)}
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Cantidad</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">{reservation.quantity} unidades</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Total</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">${parseFloat(reservation.total_price).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Fecha de Reserva</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {new Date(reservation.reservation_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Expira</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {new Date(reservation.expiry_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {reservation.notes && (
                                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 italic">
                                                Nota: {reservation.notes}
                                            </p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2 mt-4">
                                            {reservation.order_id && (
                                                <button
                                                    onClick={() => navigate(`/order-confirmation/${reservation.order_id}`)}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                                                >
                                                    <FileText size={16} />
                                                    Ver Boleta
                                                </button>
                                            )}
                                            {isStaff && reservation.status === 'Pendiente' && (
                                                <button
                                                    onClick={() => handleConfirm(reservation.id)}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                                                >
                                                    Confirmar
                                                </button>
                                            )}
                                            {(reservation.status === 'Pendiente' || reservation.status === 'Confirmada') && (
                                                <button
                                                    onClick={() => handleCancel(reservation.id)}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                                                >
                                                    Cancelar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
