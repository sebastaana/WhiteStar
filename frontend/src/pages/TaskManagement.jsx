import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import api from '../services/api';
import {
    CheckSquare, Clock, AlertCircle, Plus, X, Edit2, Trash2,
    User, Calendar, Flag, Search, Filter, ChevronDown, TrendingUp,
    CheckCircle, Circle, PlayCircle, XCircle
} from 'lucide-react';

export default function TaskManagement() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        priority: 'media',
        status: 'pendiente'
    });

    // Check permissions
    useEffect(() => {
        if (!user || !['Admin', 'Gerente'].includes(user.role)) {
            navigate('/');
            showToast('No tienes permisos para acceder a esta página', 'error');
        }
    }, [user, navigate, showToast]);

    // Fetch tasks and users
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksRes, usersRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/users')
            ]);
            setTasks(tasksRes.data.tasks || []);
            setUsers(usersRes.data.users || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTask) {
                await api.put(`/tasks/${editingTask.id}`, formData);
                showToast('Tarea actualizada exitosamente', 'success');
            } else {
                await api.post('/tasks', formData);
                showToast('Tarea creada exitosamente', 'success');
            }
            fetchData();
            closeModal();
        } catch (error) {
            console.error('Error saving task:', error);
            showToast('Error al guardar la tarea', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;
        try {
            await api.delete(`/tasks/${id}`);
            showToast('Tarea eliminada exitosamente', 'success');
            fetchData();
        } catch (error) {
            console.error('Error deleting task:', error);
            showToast('Error al eliminar la tarea', 'error');
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.put(`/tasks/${id}`, { status: newStatus });
            showToast('Estado actualizado', 'success');
            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Error al actualizar estado', 'error');
        }
    };

    const openModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title,
                description: task.description || '',
                assigned_to: task.assigned_to,
                due_date: task.due_date ? task.due_date.split('T')[0] : '',
                priority: task.priority,
                status: task.status
            });
        } else {
            setEditingTask(null);
            setFormData({
                title: '',
                description: '',
                assigned_to: '',
                due_date: '',
                priority: 'media',
                status: 'pendiente'
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTask(null);
    };

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesPriority && matchesSearch;
    });

    // Calculate stats
    const stats = {
        total: tasks.length,
        pendiente: tasks.filter(t => t.status === 'pendiente').length,
        en_proceso: tasks.filter(t => t.status === 'en_proceso').length,
        completada: tasks.filter(t => t.status === 'completada').length,
        vencidas: tasks.filter(t => new Date(t.due_date) < new Date() && t.status !== 'completada').length
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critica': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            case 'alta': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
            case 'media': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'baja': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completada': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'en_proceso': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'pendiente': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'cancelada': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completada': return CheckCircle;
            case 'en_proceso': return PlayCircle;
            case 'pendiente': return Circle;
            case 'cancelada': return XCircle;
            default: return Circle;
        }
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
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                        <CheckSquare className="w-10 h-10 text-brand-gold" />
                        Gestión de Tareas
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Monitorea y administra el cumplimiento de tareas del equipo
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                            <CheckSquare className="w-5 h-5 text-slate-500" />
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Total Tareas</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center justify-between mb-2">
                            <Circle className="w-5 h-5 text-yellow-500" />
                            <span className="text-2xl font-black text-yellow-600 dark:text-yellow-400">{stats.pendiente}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Pendientes</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-2">
                            <PlayCircle className="w-5 h-5 text-blue-500" />
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.en_proceso}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">En Proceso</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-2xl font-black text-green-600 dark:text-green-400">{stats.completada}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Completadas</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-red-200 dark:border-red-800">
                        <div className="flex items-center justify-between mb-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <span className="text-2xl font-black text-red-600 dark:text-red-400">{stats.vencidas}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Vencidas</p>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar tareas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>

                        {/* Filter Status */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="en_proceso">En Proceso</option>
                            <option value="completada">Completada</option>
                            <option value="cancelada">Cancelada</option>
                        </select>

                        {/* Filter Priority */}
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                            <option value="all">Todas las prioridades</option>
                            <option value="critica">Crítica</option>
                            <option value="alta">Alta</option>
                            <option value="media">Media</option>
                            <option value="baja">Baja</option>
                        </select>

                        {/* Add Task Button */}
                        <button
                            onClick={() => openModal()}
                            className="px-6 py-2 bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Nueva Tarea
                        </button>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-4">
                    {filteredTasks.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
                            <CheckSquare className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400 font-semibold">
                                No hay tareas que coincidan con los filtros
                            </p>
                        </div>
                    ) : (
                        filteredTasks.map((task) => {
                            const StatusIcon = getStatusIcon(task.status);
                            const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'completada';

                            return (
                                <div
                                    key={task.id}
                                    className={`bg-white dark:bg-slate-900 rounded-xl p-6 border ${isOverdue ? 'border-red-300 dark:border-red-800' : 'border-slate-200 dark:border-slate-800'
                                        } hover:shadow-lg transition-all`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <StatusIcon className="w-5 h-5 text-slate-400" />
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                                    {task.title}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(task.priority)}`}>
                                                    {task.priority.toUpperCase()}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(task.status)}`}>
                                                    {task.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                                {isOverdue && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 animate-pulse">
                                                        VENCIDA
                                                    </span>
                                                )}
                                            </div>

                                            {task.description && (
                                                <p className="text-slate-600 dark:text-slate-400 mb-4">
                                                    {task.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    <span>
                                                        Asignado a: <span className="font-bold">{task.assignedTo?.first_name} {task.assignedTo?.last_name}</span>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>
                                                        Vence: <span className="font-bold">{new Date(task.due_date).toLocaleDateString('es-CL')}</span>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    <span>
                                                        Creado por: <span className="font-bold">{task.createdBy?.first_name} {task.createdBy?.last_name}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Quick Status Update */}
                                            {task.status !== 'completada' && (
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                                                    className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                                                >
                                                    <option value="pendiente">Pendiente</option>
                                                    <option value="en_proceso">En Proceso</option>
                                                    <option value="completada">Completada</option>
                                                    <option value="cancelada">Cancelada</option>
                                                </select>
                                            )}

                                            <button
                                                onClick={() => openModal(task)}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(task.id)}
                                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                    {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Título *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Descripción
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Asignar a *
                                        </label>
                                        <select
                                            required
                                            value={formData.assigned_to}
                                            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                        >
                                            <option value="">Seleccionar usuario</option>
                                            {users.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.first_name} {u.last_name} ({u.Role?.name})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Fecha de Vencimiento *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.due_date}
                                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Prioridad *
                                        </label>
                                        <select
                                            required
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                        >
                                            <option value="baja">Baja</option>
                                            <option value="media">Media</option>
                                            <option value="alta">Alta</option>
                                            <option value="critica">Crítica</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Estado *
                                        </label>
                                        <select
                                            required
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                        >
                                            <option value="pendiente">Pendiente</option>
                                            <option value="en_proceso">En Proceso</option>
                                            <option value="completada">Completada</option>
                                            <option value="cancelada">Cancelada</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 rounded-lg font-bold hover:shadow-lg transition-all"
                                    >
                                        {editingTask ? 'Actualizar' : 'Crear'} Tarea
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
