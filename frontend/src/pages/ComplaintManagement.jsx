import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, User, MessageSquare, Filter } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';

export default function ComplaintManagement() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [complaints, setComplaints] = useState([]);
    const [filter, setFilter] = useState('all'); // all, assigned_to_me, open, resolved
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [resolutionNotes, setResolutionNotes] = useState('');

    useEffect(() => {
        fetchComplaints();
    }, [filter]);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            let params = {};

            if (filter === 'assigned_to_me') {
                params.assigned_to = user.id;
                params.status = 'En Proceso';
            } else if (filter === 'open') {
                params.status = 'Abierto';
            } else if (filter === 'resolved') {
                params.status = 'Resuelto';
            }

            const response = await api.get('/complaints', { params });
            setComplaints(response.data.data || []);
        } catch (error) {
            console.error(error);
            addToast('Error al cargar reclamos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignToMe = async (complaintId) => {
        try {
            await api.put(`/complaints/${complaintId}/assign`, { assigned_to: user.id });
            addToast('Reclamo asignado exitosamente', 'success');
            fetchComplaints();
            setSelectedComplaint(null);
        } catch (error) {
            console.error(error);
            addToast('Error al asignar reclamo', 'error');
        }
    };

    const handleResolve = async (complaintId) => {
        if (!resolutionNotes.trim()) {
            addToast('Debes agregar notas de resolución', 'warning');
            return;
        }

        try {
            await api.put(`/complaints/${complaintId}/resolve`, { resolution_notes: resolutionNotes });
            addToast('Reclamo resuelto exitosamente', 'success');
            fetchComplaints();
            setSelectedComplaint(null);
            setResolutionNotes('');
        } catch (error) {
            console.error(error);
            addToast('Error al resolver reclamo', 'error');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Abierto': return 'bg-red-100 text-red-700 border-red-200';
            case 'En Proceso': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Resuelto': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Alta': return 'text-red-600 font-bold';
            case 'Media': return 'text-yellow-600 font-medium';
            case 'Baja': return 'text-green-600';
            default: return 'text-slate-600';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            Gestión de Reclamos
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Administra y resuelve las incidencias de los clientes.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        {[
                            { id: 'all', label: 'Todos' },
                            { id: 'open', label: 'Abiertos' },
                            { id: 'assigned_to_me', label: 'Mis Asignados' },
                            { id: 'resolved', label: 'Resueltos' }
                        ].map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition ${filter === f.id
                                    ? 'bg-brand-gold text-slate-900 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Complaints List */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden h-[calc(100vh-200px)] flex flex-col">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 flex justify-between items-center">
                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                    Lista de Reclamos
                                </h3>
                                <span className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-bold">
                                    {complaints.length}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700">
                                {loading ? (
                                    <div className="p-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold mx-auto"></div>
                                    </div>
                                ) : complaints.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500">
                                        No hay reclamos en esta categoría
                                    </div>
                                ) : (
                                    complaints.map((complaint) => (
                                        <button
                                            key={complaint.id}
                                            onClick={() => setSelectedComplaint(complaint)}
                                            className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${selectedComplaint?.id === complaint.id ? 'bg-brand-gold/10 border-l-4 border-brand-gold' : ''
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(complaint.status)}`}>
                                                    {complaint.status}
                                                </span>
                                                <span className={`text-xs ${getPriorityColor(complaint.priority)}`}>
                                                    {complaint.priority}
                                                </span>
                                            </div>
                                            <h4 className="font-medium text-slate-900 dark:text-white truncate mb-1">
                                                {complaint.subject}
                                            </h4>
                                            <p className="text-xs text-slate-500 mb-2">
                                                {complaint.customer?.first_name} {complaint.customer?.last_name}
                                            </p>
                                            <div className="flex justify-between items-center text-xs text-slate-400">
                                                <span>#{complaint.id}</span>
                                                <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Complaint Detail */}
                    <div className="lg:col-span-2">
                        {selectedComplaint ? (
                            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm h-full">
                                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                                {selectedComplaint.subject}
                                            </h2>
                                            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <User size={16} />
                                                    {selectedComplaint.customer?.first_name} {selectedComplaint.customer?.last_name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={16} />
                                                    {new Date(selectedComplaint.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedComplaint.status)} mb-2`}>
                                                {selectedComplaint.status}
                                            </div>
                                            {selectedComplaint.assignee && (
                                                <p className="text-sm text-slate-500">
                                                    Asignado a: <span className="font-medium">{selectedComplaint.assignee.first_name}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 mb-4">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                            <MessageSquare size={16} />
                                            Descripción del Problema
                                        </h3>
                                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                            {selectedComplaint.description}
                                        </p>
                                    </div>

                                    {selectedComplaint.Order && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                                            <AlertCircle size={16} className="text-blue-500" />
                                            Relacionado con la Orden #{selectedComplaint.Order.id} - Total: ${selectedComplaint.Order.total}
                                        </div>
                                    )}
                                </div>

                                {/* Actions Area */}
                                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-b-lg">
                                    {selectedComplaint.status === 'Resuelto' ? (
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                            <h3 className="font-bold text-green-800 dark:text-green-400 mb-2 flex items-center gap-2">
                                                <CheckCircle size={20} />
                                                Resolución
                                            </h3>
                                            <p className="text-green-700 dark:text-green-300">
                                                {selectedComplaint.resolution_notes}
                                            </p>
                                            <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                                                Resuelto el: {new Date(selectedComplaint.resolved_at).toLocaleString()}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {!selectedComplaint.assignee && (
                                                <button
                                                    onClick={() => handleAssignToMe(selectedComplaint.id)}
                                                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                                                >
                                                    Asignarme este reclamo
                                                </button>
                                            )}

                                            {(selectedComplaint.assignee?.id === user.id || !selectedComplaint.assignee) && (
                                                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                                                        Resolver Reclamo
                                                    </h3>
                                                    <textarea
                                                        value={resolutionNotes}
                                                        onChange={(e) => setResolutionNotes(e.target.value)}
                                                        placeholder="Describe cómo se resolvió el problema..."
                                                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg mb-3 h-32 focus:ring-2 focus:ring-brand-gold outline-none dark:bg-slate-700 dark:text-white"
                                                    />
                                                    <button
                                                        onClick={() => handleResolve(selectedComplaint.id)}
                                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                                                    >
                                                        Marcar como Resuelto
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center h-full flex flex-col items-center justify-center">
                                <MessageSquare size={48} className="text-slate-300 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    Selecciona un reclamo
                                </h3>
                                <p className="text-slate-500">
                                    Elige un reclamo de la lista para ver detalles y gestionar su resolución.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
