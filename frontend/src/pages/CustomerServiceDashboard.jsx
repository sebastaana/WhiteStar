import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Users, MessageSquare, Package, Calendar, AlertCircle, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function CustomerServiceDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({
        pendingComplaints: 0,
        myComplaints: 0,
        pendingReservations: 0,
        recentOrders: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // In a real app, we would have a dedicated dashboard endpoint
        // For now, we'll simulate it by fetching counts from different endpoints
        const fetchStats = async () => {
            try {
                // This is a simplified simulation. In production, create a specific endpoint
                // to avoid multiple requests
                const [complaintsRes, myComplaintsRes] = await Promise.all([
                    api.get('/complaints', { params: { status: 'Abierto', limit: 1 } }),
                    api.get('/complaints', { params: { assigned_to: user.id, status: 'En Proceso', limit: 1 } })
                ]);

                setStats({
                    pendingComplaints: complaintsRes.data.pagination?.total || 0,
                    myComplaints: myComplaintsRes.data.pagination?.total || 0,
                    pendingReservations: 5, // Placeholder
                    recentOrders: 12 // Placeholder
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user?.id]);

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
        </div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    const quickActions = [
        {
            title: 'Buscar Cliente',
            description: 'Ver historial y perfil completo',
            icon: Users,
            to: '/customer-service/customers',
            color: 'bg-blue-500'
        },
        {
            title: 'Gestionar Reclamos',
            description: 'Atender incidencias pendientes',
            icon: MessageSquare,
            to: '/customer-service/complaints',
            color: 'bg-red-500'
        },
        {
            title: 'Seguimiento Pedidos',
            description: 'Ver estado de envíos',
            icon: Package,
            to: '/customer-service/orders',
            color: 'bg-brand-gold'
        },
        {
            title: 'Reservas',
            description: 'Confirmar reservas de stock',
            icon: Calendar,
            to: '/customer-service/orders', // Same page, different tab
            color: 'bg-green-500'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Panel de Atención al Cliente
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Bienvenido, {user.first_name}. Aquí tienes un resumen de tu actividad.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                                <AlertCircle size={24} />
                            </div>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                Urgente
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                            {loading ? '-' : stats.pendingComplaints}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Reclamos sin asignar
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <MessageSquare size={24} />
                            </div>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                En Proceso
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                            {loading ? '-' : stats.myComplaints}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Mis casos activos
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                                <Calendar size={24} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                            {loading ? '-' : stats.pendingReservations}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Reservas por confirmar
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-400">
                                <Clock size={24} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                            98%
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Tasa de respuesta
                        </p>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Acciones Rápidas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {quickActions.map((action, idx) => (
                        <Link
                            key={idx}
                            to={action.to}
                            className="group bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
                        >
                            <div className={`p-4 rounded-full ${action.color} text-white mb-4 group-hover:scale-110 transition duration-300`}>
                                <action.icon size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                                {action.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {action.description}
                            </p>
                        </Link>
                    ))}
                </div>

                {/* Recent Activity Section could go here */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-brand-gold" />
                        Actividad Reciente del Sistema
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                            <div className="p-2 bg-green-100 text-green-600 rounded-full">
                                <CheckCircle size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    Reserva #1234 confirmada
                                </p>
                                <p className="text-xs text-slate-500">Hace 5 minutos • Por Juan Pérez</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                                <MessageSquare size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    Nuevo reclamo asignado: "Producto dañado"
                                </p>
                                <p className="text-xs text-slate-500">Hace 15 minutos • Sistema</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
