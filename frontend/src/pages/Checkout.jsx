import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Lock, ShieldCheck, ArrowLeft, BadgeCheck, AlertTriangle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

export default function Checkout() {
  const { cart, clearCart, getTotal } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [holder, setHolder] = useState('');
  const [number, setNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null); // 'success' | 'fail' | null

  const subtotal = useMemo(() => getTotal(), [cart, getTotal]);
  const tax = +(subtotal * 0.19).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  useEffect(() => {
    if (result === 'success') return; // Evitar redirección si el pago fue exitoso

    if (!user) {
      addToast('Debes iniciar sesión para pagar', 'info', 2000);
      navigate('/login');
    } else if (cart.length === 0) {
      addToast('Tu carrito está vacío', 'info', 2000);
      navigate('/cart');
    }
  }, [user, cart, addToast, navigate, result]);

  const validForm = holder.trim().length > 3 && number.replace(/\s/g, '').length >= 16 && /^\d{2}\/\d{2}$/.test(exp) && cvc.trim().length >= 3;

  const simulatePayment = () => {
    // 50% éxito, 50% error “no tiene monto”
    const roll = Math.random(); // 0..1
    return roll < 0.5 ? 'success' : 'fail';
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!validForm) {
      addToast('Completa los datos de tarjeta', 'info', 2000);
      return;
    }
    setProcessing(true);
    setResult(null);

    // Animación de “procesando”
    await new Promise(r => setTimeout(r, 1200));

    const outcome = simulatePayment();

    if (outcome === 'fail') {
      setProcessing(false);
      setResult('fail');
      addToast('Pago rechazado: No tiene monto disponible', 'error', 3000);
      return;
    }

    // Éxito simulado: ahora sí crear la orden en tu backend
    try {
      const items = cart.map(i => ({ product_id: i.id, quantity: i.quantity }));
      const res = await api.post('/orders', { items, tax: tax.toFixed(2) });
      setResult('success');
      addToast('✓ Pago confirmado y orden creada', 'success', 3000);
      // Espera un poco para mostrar la pantalla de éxito
      setTimeout(() => {
        clearCart();
        navigate(`/order-confirmation/${res.data.order.id}`);
      }, 1400);
    } catch (err) {
      setProcessing(false);
      setResult('fail');
      const msg = err.response?.data?.message || 'Error al confirmar la orden';
      addToast(msg, 'error', 3000);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mesh gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-48 -left-48 w-[560px] h-[560px] bg-gradient-to-br from-yellow-500/20 via-brand-gold/10 to-amber-300/20 blur-3xl rounded-full" />
        <div className="absolute top-1/3 -right-40 w-[420px] h-[420px] bg-gradient-to-tr from-slate-700/20 via-slate-500/10 to-slate-300/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-[380px] h-[380px] bg-gradient-to-tr from-amber-300/20 via-yellow-400/10 to-brand-gold/20 blur-3xl rounded-full" />
      </div>

      <div className="bg-white/70 dark:bg-slate-950/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="mb-6 flex items-center justify-between">
            <Link to="/cart" className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-brand-gold">
              <ArrowLeft size={18} />
              Volver al carrito
            </Link>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="text-brand-gold" size={18} />
              Pago seguro simulado
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resumen */}
            <section className="rounded-2xl p-6 border border-white/40 dark:border-slate-700/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-[0_0_60px_-18px_rgba(212,175,55,0.35)]">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Resumen del pedido</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Impuestos (19%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/40 dark:border-slate-700/50 pt-3 flex justify-between items-center">
                  <span className="text-lg font-black text-slate-900 dark:text-white">Total</span>
                  <span className="text-3xl font-black text-brand-gold">${total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-6 text-sm text-slate-600 dark:text-slate-400">
                Al confirmar el pago simulado, se creará tu orden y podrás verla en tu perfil.
              </div>
            </section>

            {/* Form Tarjeta */}
            <section className="rounded-2xl p-6 border border-white/40 dark:border-slate-700/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-[0_0_60px_-18px_rgba(212,175,55,0.35)]">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="text-brand-gold" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Datos de pago</h2>
              </div>

              <form className="space-y-4" onSubmit={handlePay} autoComplete="off">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Titular</label>
                  <input
                    value={holder}
                    onChange={e => setHolder(e.target.value)}
                    placeholder="Nombre Apellido"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300/70 dark:border-slate-600/70 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white focus:ring-2 ring-brand-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Número de tarjeta</label>
                  <input
                    value={number}
                    onChange={e => setNumber(e.target.value.replace(/[^\d ]/g, ''))}
                    placeholder="4242 4242 4242 4242"
                    inputMode="numeric"
                    maxLength={19}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300/70 dark:border-slate-600/70 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white tracking-widest"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Expira</label>
                    <input
                      value={exp}
                      onChange={e => setExp(e.target.value)}
                      placeholder="MM/AA"
                      maxLength={5}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300/70 dark:border-slate-600/70 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">CVC</label>
                    <input
                      value={cvc}
                      onChange={e => setCvc(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300/70 dark:border-slate-600/70 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Estado */}
                {result === 'fail' && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50/80 dark:bg-red-900/20 border border-red-200/70 dark:border-red-800/70 text-red-700 dark:text-red-300">
                    <AlertTriangle size={18} />
                    Pago rechazado: No tiene monto disponible
                  </div>
                )}
                {result === 'success' && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/70 dark:border-emerald-800/70 text-emerald-700 dark:text-emerald-300">
                    <BadgeCheck size={18} />
                    Pago simulado exitoso. Confirmando orden...
                  </div>
                )}

                <button
                  type="submit"
                  disabled={processing || !validForm}
                  className="w-full py-4 rounded-xl font-black text-slate-900 bg-gradient-to-r from-brand-gold to-yellow-500 hover:shadow-lg hover:brightness-110 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  <Lock size={18} />
                  {processing ? 'Procesando...' : 'Pagar ahora'}
                </button>

                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                  Este pago es una simulación para fines de prototipo. No se realiza ningún cargo real.
                </p>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
