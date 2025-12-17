import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Download, ShoppingBag, Calendar, Printer } from 'lucide-react';
import api from '../services/api';

export default function OrderConfirmation() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${id}`);
                setOrder(res.data.order);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Generando boleta...</div>;
    if (!order) return <div className="min-h-screen flex items-center justify-center text-red-500">Orden no encontrada</div>;

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadTicket = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/orders/${id}/ticket`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al descargar ticket');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ticket-${order.id.slice(0, 8)}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading ticket:', error);
            alert('Error al descargar el ticket');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4 print:bg-white print:p-0">
            <div className="max-w-3xl mx-auto">

                {/* Success Message - Hidden on Print */}
                <div className="text-center mb-8 print:hidden">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">¡Pago Exitoso!</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Tus productos han sido reservados correctamente.
                    </p>
                </div>

                {/* Ticket Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 print:shadow-none print:border-none">
                    {/* Header */}
                    <div className="bg-slate-900 text-white p-6 text-center print:bg-white print:text-black print:border-b-2 print:border-black">
                        <h2 className="text-2xl font-serif tracking-wider uppercase">WhiteStar Perfumes</h2>
                        <p className="text-sm opacity-80 mt-1">Comprobante de Reserva</p>
                    </div>

                    {/* Body */}
                    <div className="p-8 space-y-6">

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-6 text-sm">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400">N° de Orden</p>
                                <p className="font-mono font-bold text-lg text-slate-900 dark:text-white">#{order.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-500 dark:text-slate-400">Fecha</p>
                                <p className="font-medium text-slate-900 dark:text-white">
                                    {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>

                        <hr className="border-dashed border-slate-300 dark:border-slate-600" />

                        {/* Items */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-900 dark:text-white">Detalle de Productos</h3>
                            {order.OrderItems?.map((item) => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 print:hidden">
                                            {item.quantity}x
                                        </div>
                                        <span className="print:font-bold print:mr-2 print:inline-block hidden">{item.quantity}x</span>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{item.Product?.name}</p>
                                            <p className="text-xs text-slate-500">Reserva Confirmada</p>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                        ${(Number(item.price) * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <hr className="border-slate-300 dark:border-slate-600" />

                        {/* Totals */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Subtotal</span>
                                <span>${(Number(order.total) - Number(order.tax)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Impuesto</span>
                                <span>${Number(order.tax).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white pt-2">
                                <span>Total Pagado</span>
                                <span>${Number(order.total).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-sm text-amber-800 dark:text-amber-200 mt-6 print:bg-transparent print:text-black print:border print:border-black">
                            <p className="font-bold flex items-center gap-2">
                                <Calendar size={16} />
                                Información de Retiro
                            </p>
                            <p className="mt-1">
                                Tus productos están reservados por <strong>7 días</strong>.
                                Presenta este comprobante (digital o impreso) en la tienda para retirar.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions - Hidden on Print */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center print:hidden">
                    <button
                        onClick={handleDownloadTicket}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-gold text-slate-900 rounded-xl hover:brightness-110 transition font-bold shadow-lg shadow-brand-gold/20"
                    >
                        <Download size={20} />
                        Descargar Ticket PDF
                    </button>

                    <button
                        onClick={handlePrint}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium shadow-sm"
                    >
                        <Printer size={20} />
                        Imprimir Boleta
                    </button>

                    <Link
                        to="/reservations"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium shadow-sm"
                    >
                        <ShoppingBag size={20} />
                        Ir a Mis Reservas
                    </Link>
                </div>

            </div>
        </div>
    );
}
