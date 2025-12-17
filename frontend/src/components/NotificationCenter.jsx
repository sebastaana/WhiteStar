import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, CheckCheck, Trash2, Package, ShoppingCart, AlertTriangle, MessageSquare, ClipboardList } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationIcon = ({ type }) => {
    const icons = {
        order_created: ShoppingCart,
        order_updated: Package,
        reservation_confirmed: Check,
        stock_alert: AlertTriangle,
        complaint_assigned: MessageSquare,
        task_assigned: ClipboardList,
        general: Bell
    };

    const Icon = icons[type] || Bell;
    return <Icon className="w-5 h-5" />;
};

const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch notifications when opening
    useEffect(() => {
        if (isOpen) {
            fetchNotifications(showUnreadOnly);
        }
    }, [isOpen, showUnreadOnly, fetchNotifications]);

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }

        if (notification.link) {
            navigate(notification.link);
            setIsOpen(false);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
    };

    const handleDelete = async (e, notificationId) => {
        e.stopPropagation();
        await deleteNotification(notificationId);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-500 dark:text-red-400';
            case 'medium': return 'text-yellow-500 dark:text-yellow-400';
            case 'low': return 'text-blue-500 dark:text-blue-400';
            default: return 'text-gray-500 dark:text-gray-400';
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return 'Ahora';
        if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
        if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)}d`;
        return new Date(date).toLocaleDateString();
    };

    const displayedNotifications = showUnreadOnly
        ? notifications.filter(n => !n.read)
        : notifications;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
                title="Notificaciones"
                aria-label={`Ver notificaciones (${unreadCount} no leídas)`}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 animate-fade-in-down max-h-[600px] flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Notificaciones
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowUnreadOnly(false)}
                                className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition ${!showUnreadOnly
                                        ? 'bg-brand-gold text-slate-900'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                Todas
                            </button>
                            <button
                                onClick={() => setShowUnreadOnly(true)}
                                className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition ${showUnreadOnly
                                        ? 'bg-brand-gold text-slate-900'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                No leídas ({unreadCount})
                            </button>
                        </div>

                        {/* Mark all as read */}
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-sm font-medium transition"
                            >
                                <CheckCheck className="w-4 h-4" />
                                Marcar todas como leídas
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="p-8 text-center text-slate-500">
                                Cargando...
                            </div>
                        ) : displayedNotifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p>No hay notificaciones</p>
                            </div>
                        ) : (
                            displayedNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 border-b border-slate-200 dark:border-slate-800 cursor-pointer transition ${notification.read
                                            ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 ${getPriorityColor(notification.priority)}`}>
                                            <NotificationIcon type={notification.type} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-slate-500 dark:text-slate-500">
                                                    {getTimeAgo(notification.created_at)}
                                                </span>
                                                <button
                                                    onClick={(e) => handleDelete(e, notification.id)}
                                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition text-red-500"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
