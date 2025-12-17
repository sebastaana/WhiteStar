import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, Gift, Truck, Lock, AlertTriangle, Sparkles } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { useState } from 'react';
import { useToast } from '../hooks/useToast';
import { getImageUrl } from '../utils/image';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const subtotal = getTotal();
  const tax = +(subtotal * 0.19).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  const savings = +(subtotal * 0.15).toFixed(2);

  const handleSafeUpdateQty = async (item, nextQty) => {
    if (nextQty < 1) return;
    if (typeof item.stock === 'number' && nextQty > item.stock) {
      addToast(`Solo hay ${item.stock} unidades en stock`, 'info', 2500);
      return;
    }
    setUpdatingId(item.id);
    try {
      updateQuantity(item.id, nextQty);
    } catch (err) {
      addToast(err.response?.data?.message || 'No se pudo actualizar la cantidad', 'error', 2500);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      addToast('Debes iniciar sesión para continuar', 'info', 2000);
      navigate('/login');
      return;
    }
    if (cart.length === 0) {
      addToast('Tu carrito está vacío', 'info', 2000);
      return;
    }
    setSubmitting(true);
    try {
      const items = cart.map((item) => ({ product_id: item.id, quantity: item.quantity }));
      await api.post('/orders', { items, tax: tax.toFixed(2) });
      clearCart();
      addToast('✓ ¡Pedido creado exitosamente!', 'success', 3000);
      navigate('/profile');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear el pedido';
      addToast(msg, 'error', 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Mesh gradient background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-40 w-[480px] h-[480px] bg-gradient-to-br from-yellow-500/20 via-brand-gold/10 to-amber-300/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] bg-gradient-to-tr from-slate-700/20 via-slate-500/10 to-slate-300/20 blur-3xl rounded-full" />
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto py-16 px-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-6 rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur border border-white/40 dark:border-slate-700/40 shadow-[0_0_50px_-12px_rgba(212,175,55,0.35)] mb-6">
                <ShoppingCart className="w-14 h-14 text-brand-gold" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3">Tu carrito está vacío</h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">Explora nuestras fragancias premium y encuentra tu aroma ideal</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/catalog"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-brand-gold to-yellow-500 hover:shadow-lg hover:brightness-110 transition"
                >
                  <Sparkles size={20} />
                  Ver Catálogo
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold border border-slate-300/70 dark:border-slate-600/70 bg-white/50 dark:bg-slate-900/40 backdrop-blur hover:bg-white/70 dark:hover:bg-slate-900/60 text-slate-900 dark:text-white transition"
                >
                  Inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mesh gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-48 -left-48 w-[560px] h-[560px] bg-gradient-to-br from-yellow-500/20 via-brand-gold/10 to-amber-300/20 blur-3xl rounded-full" />
        <div className="absolute top-1/3 -right-40 w-[420px] h-[420px] bg-gradient-to-tr from-slate-700/20 via-slate-500/10 to-slate-300/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-[380px] h-[380px] bg-gradient-to-tr from-amber-300/20 via-yellow-400/10 to-brand-gold/20 blur-3xl rounded-full" />
      </div>

      <div className="bg-white/70 dark:bg-slate-950/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto py-12 px-4">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3">
              Tu Carrito
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              {cart.length} {cart.length === 1 ? 'perfume' : 'perfumes'} seleccionado{cart.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-5">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl p-5 border border-white/40 dark:border-slate-700/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-[0_0_60px_-18px_rgba(212,175,55,0.35)] hover:shadow-[0_0_80px_-14px_rgba(212,175,55,0.45)] transition"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Imagen */}
                    <Link to={`/product/${item.id}`} className="flex-shrink-0">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100/80 to-slate-200/80 dark:from-slate-800/60 dark:to-slate-700/60">
                        <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    </Link>

                    {/* Detalles */}
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            to={`/product/${item.id}`}
                            className="text-lg md:text-xl font-bold text-slate-900 dark:text-white hover:text-brand-gold transition"
                          >
                            {item.name}
                          </Link>
                          {item.Category && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">📁 {item.Category.name}</p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            removeFromCart(item.id);
                            addToast(`${item.name} removido del carrito`, 'info', 1500);
                          }}
                          className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-white/40 dark:hover:bg-slate-800/40 rounded-lg transition h-fit"
                          title="Eliminar del carrito"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Precios */}
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-extrabold text-brand-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.35)]">
                          ${parseFloat(item.price).toFixed(2)}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 line-through">
                          ${(parseFloat(item.price) * 1.15).toFixed(2)}
                        </span>
                      </div>

                      {/* Stock */}
                      {typeof item.stock === 'number' && (
                        <div className="flex items-center gap-2 text-xs">
                          {item.stock > 10 ? (
                            <span className="px-2 py-1 rounded-full bg-green-100/60 dark:bg-green-900/30 text-green-700 dark:text-green-200 font-semibold">
                              En stock: {item.stock}
                            </span>
                          ) : item.stock > 0 ? (
                            <span className="px-2 py-1 rounded-full bg-yellow-100/60 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200 font-semibold">
                              Stock bajo: {item.stock}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full bg-red-100/60 dark:bg-red-900/30 text-red-700 dark:text-red-200 font-semibold flex items-center gap-1">
                              <AlertTriangle size={12} />
                              Agotado
                            </span>
                          )}
                        </div>
                      )}

                      {/* Controles */}
                      <div className="flex items-center justify-between gap-4 mt-2">
                        <div className="flex items-center rounded-xl border border-white/40 dark:border-slate-600/50 bg-white/50 dark:bg-slate-800/40 backdrop-blur">
                          <button
                            onClick={() => handleSafeUpdateQty(item, item.quantity - 1)}
                            className="px-3 py-2 hover:bg-white/70 dark:hover:bg-slate-700/60 transition text-slate-700 dark:text-slate-200 disabled:opacity-50"
                            disabled={updatingId === item.id || item.quantity <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val)) handleSafeUpdateQty(item, val);
                            }}
                            min="1"
                            className="w-14 text-center border-0 bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none"
                            disabled={updatingId === item.id}
                          />
                          <button
                            onClick={() => handleSafeUpdateQty(item, item.quantity + 1)}
                            className="px-3 py-2 hover:bg-white/70 dark:hover:bg-slate-700/60 transition text-slate-700 dark:text-slate-200 disabled:opacity-50"
                            disabled={updatingId === item.id}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-600 dark:text-slate-400">Subtotal</p>
                          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div>
              <div className="rounded-2xl p-8 border border-white/40 dark:border-slate-700/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-[0_0_70px_-18px_rgba(212,175,55,0.35)] sticky top-24">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Resumen</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 dark:text-slate-300">Subtotal</span>
                    <span className="font-semibold text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between items-center p-3 rounded-xl border border-emerald-300/50 bg-emerald-100/40 dark:bg-emerald-900/20 dark:border-emerald-800">
                      <span className="text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2">
                        <Gift size={16} />
                        Ahorras
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">-${savings.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 dark:text-slate-300">Impuesto (19%)</span>
                    <span className="font-semibold text-slate-900 dark:text-white">${tax.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-white/40 dark:border-slate-700/50 pt-4 flex justify-between items-center">
                    <span className="text-lg font-black text-slate-900 dark:text-white">Total</span>
                    <span className="text-3xl font-black text-brand-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.35)]">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="w-full py-4 rounded-xl font-black text-slate-900 bg-gradient-to-r from-brand-gold to-yellow-500 hover:shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2"
                >
                  Ir a Pagar
                </Link>

                <Link
                  to="/catalog"
                  className="mt-3 block text-center w-full py-3 rounded-xl font-bold border border-white/40 dark:border-slate-700/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur hover:bg-white/60 dark:hover:bg-slate-900/60 text-slate-900 dark:text-white transition"
                >
                  Seguir comprando
                </Link>

                <button
                  onClick={() => {
                    if (confirm('¿Vaciar el carrito?')) {
                      clearCart();
                      addToast('Carrito vaciado', 'info', 1500);
                    }
                  }}
                  className="mt-2 w-full py-2 rounded-xl font-medium text-red-600 dark:text-red-400 hover:bg-red-50/60 dark:hover:bg-red-900/20 transition"
                >
                  Vaciar carrito
                </button>

                <div className="mt-8 space-y-3 pt-6 border-t border-white/40 dark:border-slate-700/50">
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <Truck className="w-5 h-5 text-brand-gold" />
                    <span>Envío gratis a partir de $100</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <Lock className="w-5 h-5 text-brand-gold" />
                    <span>Pago 100% seguro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA soporte */}
          <div className="mt-16 rounded-2xl p-10 border border-white/40 dark:border-slate-700/40 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md text-center">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3">¿Problemas con el pedido?</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">Nuestro equipo te ayuda a resolverlo en minutos</p>
            <button className="px-8 py-3 rounded-xl font-black text-slate-900 bg-gradient-to-r from-brand-gold to-yellow-500 hover:shadow-lg hover:brightness-110 transition">
              Contactar soporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
