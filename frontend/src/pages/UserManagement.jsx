import { useState, useEffect } from 'react';
import { Users, Shield, Search, Save, X, Edit2, Ban, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function UserManagement() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role_name: 'Cliente',
        is_active: true
    });

    const roles = ['Cliente', 'Vendedor', 'Administrador de Stock', 'Atención al Cliente', 'Gerente', 'Admin'];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data.users || []);
        } catch (error) {
            console.error(error);
            addToast('Error al cargar usuarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setFormData({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role_name: user.Role?.name || 'Cliente',
            is_active: user.is_active !== false // Default to true if undefined
        });
    };

    const handleSave = async () => {
        if (!editingUser) return;

        try {
            // 1. Update details
            await api.put(`/users/${editingUser.id}`, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email
            });

            // 2. Update role
            if (formData.role_name !== editingUser.Role?.name) {
                await api.put(`/users/${editingUser.id}/role`, { role_name: formData.role_name });
            }

            // 3. Update status
            if (formData.is_active !== editingUser.is_active) {
                await api.put(`/users/${editingUser.id}/status`, { is_active: formData.is_active });
            }

            addToast('Usuario actualizado exitosamente', 'success');
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            console.error(error);
            addToast(error.response?.data?.message || 'Error al actualizar usuario', 'error');
        }
    };

    const filteredUsers = users.filter(u =>
        u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                        <Users className="text-brand-gold" />
                        Gestión de Usuarios
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Administra los roles, permisos y estado de los usuarios.
                    </p>
                </div>

                {/* Search */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Usuario</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Email</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Rol</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Estado</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-gold to-yellow-500 flex items-center justify-center text-slate-900 font-bold">
                                                    {u.first_name[0]}{u.last_name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{u.first_name} {u.last_name}</p>
                                                    <p className="text-xs text-slate-500">ID: {u.id.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            {u.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold
                                                ${u.Role?.name === 'Admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                                    u.Role?.name === 'Gerente' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                        u.Role?.name === 'Vendedor' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                            'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                                }`}>
                                                <Shield size={12} />
                                                {u.Role?.name || 'Sin Rol'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold
                                                ${u.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {u.is_active !== false ? 'Activo' : 'Suspendido'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEditClick(u)}
                                                className="p-2 text-slate-400 hover:text-brand-gold transition rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                                                title="Editar Usuario"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Editar Usuario</h3>
                            <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Info */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                                    Información Personal
                                </h4>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-gold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Apellido</label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-gold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-gold outline-none"
                                    />
                                </div>
                            </div>

                            {/* Role & Status */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                                    Rol y Estado
                                </h4>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rol</label>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                        {roles.map(role => (
                                            <label key={role} className={`flex items-center p-2 rounded-lg border cursor-pointer transition text-sm
                                                ${formData.role_name === role
                                                    ? 'border-brand-gold bg-brand-gold/10 ring-1 ring-brand-gold'
                                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    value={role}
                                                    checked={formData.role_name === role}
                                                    onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                                                    className="w-4 h-4 text-brand-gold focus:ring-brand-gold"
                                                />
                                                <span className="ml-3 font-medium text-slate-900 dark:text-white">{role}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Estado de Cuenta</label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_active: true })}
                                            className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2 transition
                                                ${formData.is_active
                                                    ? 'bg-green-100 border-green-500 text-green-700'
                                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50'
                                                }`}
                                        >
                                            <CheckCircle size={18} />
                                            Activo
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_active: false })}
                                            className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2 transition
                                                ${!formData.is_active
                                                    ? 'bg-red-100 border-red-500 text-red-700'
                                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50'
                                                }`}
                                        >
                                            <Ban size={18} />
                                            Suspendido
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="px-4 py-2 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-brand-gold text-slate-900 font-bold rounded-lg hover:brightness-110 transition flex items-center gap-2"
                            >
                                <Save size={18} />
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
