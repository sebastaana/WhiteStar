import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import api from '../services/api';
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle, ArrowLeft, Send } from 'lucide-react';

export default function MyComplaints() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        priority: 'Media'
    });

    useEffect(() => {
        if (user) {
            fetchMyComplaints();
        }
    }, [user]);

    const fetchMyComplaints = async () => {
        try {
            setLoading(true);
            const response = await api.get('/complaints/my');
            setComplaints(response.data.data || []);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            addToast('Error al cargar tus reclamos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.subject.trim() || !formData.description.trim()) {
            addToast('Por favor completa todos los campos', 'error');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/complaints', formData);
            addToast('Reclamo enviado exitosamente', 'success');
            setFormData({ subject: '', description: '', priority: 'Media' });
            setShowForm(false);
            fetchMyComplaints();
        } catch (error) {
            console.error('Error submitting complaint:', error);
            addToast('Error al enviar el reclamo', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Resuelto':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'En Proceso':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-red-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resuelto':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'En Proceso':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            default:
                return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Alta':
                return 'text-red-600 dark:text-red-400';
            case 'Baja':
                return 'text-green-600 dark:text-green-400';
            default:
                return 'text-yellow-600 dark:text-yellow-400';
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Acceso Requerido</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Debes iniciar sesión para ver tus reclamos</p>
                    <Link to="/login" className="px-6 py-3 bg-brand-gold text-slate-900 rounded-xl font-bold hover:bg-yellow-500 transition">
                        Iniciar Sesión
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/profile" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition">
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                                Mis Reclamos
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                Envía y revisa el estado de tus reclamos
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-slate-900 rounded-xl font-bold hover:bg-yellow-500 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Reclamo
                    </button>
                </div>

                {/* Formulario de nuevo reclamo */}
                {showForm && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-8">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            Enviar Nuevo Reclamo
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Asunto *
                                </label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="Ej: Problema con mi pedido"
                                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Descripción *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe tu problema con detalle..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Prioridad
                                </label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                                >
                                    <option value="Baja">Baja</option>
                                    <option value="Media">Media</option>
                                    <option value="Alta">Alta</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-3 bg-brand-gold text-slate-900 rounded-xl font-bold hover:bg-yellow-500 transition disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Enviar Reclamo
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Lista de reclamos */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-brand-gold" />
                            Historial de Reclamos
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-10 h-10 border-3 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin mx-auto" />
                            <p className="text-slate-500 mt-4">Cargando reclamos...</p>
                        </div>
                    ) : complaints.length === 0 ? (
                        <div className="p-12 text-center">
                            <MessageSquare className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                No tienes reclamos
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                Si tienes algún problema, puedes enviar un reclamo y nuestro equipo lo atenderá.
                            </p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-slate-900 rounded-xl font-bold hover:bg-yellow-500 transition"
                            >
                                <Plus className="w-5 h-5" />
                                Crear Primer Reclamo
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            {complaints.map((complaint) => (
                                <div key={complaint.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            {getStatusIcon(complaint.status)}
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white">
                                                    {complaint.subject}
                                                </h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                                    {complaint.description}
                                                </p>
                                                <div className="flex items-center gap-4 mt-3 text-xs">
                                                    <span className="text-slate-500">
                                                        #{complaint.id}
                                                    </span>
                                                    <span className="text-slate-500">
                                                        {new Date(complaint.created_at).toLocaleDateString()}
                                                    </span>
                                                    <span className={`font-medium ${getPriorityColor(complaint.priority)}`}>
                                                        Prioridad: {complaint.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(complaint.status)}`}>
                                            {complaint.status}
                                        </span>
                                    </div>

                                    {complaint.resolution_notes && (
                                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                            <p className="text-sm font-medium text-green-800 dark:text-green-400">
                                                Resolución:
                                            </p>
                                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                                {complaint.resolution_notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
