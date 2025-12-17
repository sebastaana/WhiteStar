import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ChevronLeft, Truck, Shield, RefreshCw, Check, Sparkles, Tag, Package, Clock, Zap } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { usePromotions } from '../hooks/usePromotions';
import { getImageUrl } from '../utils/image';
import PriceDisplay from '../components/PriceDisplay';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { calculateDiscount } = usePromotions();

  // Estados
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const [isFavorite, setIsFavorite] = useState(() => {
    const saved = localStorage.getItem('favorites');
    const favorites = saved ? JSON.parse(saved) : [];
    return favorites.includes(id);
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (err) {
        setError('Error al cargar el producto');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    addToast(
      `✓ ${quantity} ${quantity > 1 ? 'unidades' : 'unidad'} añadida al carrito`,
      'success',
      2000
    );

    setQuantity(1);
  };

  const handleToggleFavorite = () => {
    const saved = localStorage.getItem('favorites');
    const favorites = saved ? JSON.parse(saved) : [];

    if (isFavorite) {
      const updated = favorites.filter(fav => fav !== id);
      localStorage.setItem('favorites', JSON.stringify(updated));
      addToast('Removido de favoritos', 'info', 1500);
    } else {
      favorites.push(id);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      addToast('❤️ Añadido a favoritos', 'success', 1500);
    }

    setIsFavorite(!isFavorite);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-12 px-4 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {error && <ErrorMessage message={error} />}
          <p className="text-slate-600 dark:text-slate-400 mt-4">Producto no encontrado</p>
          <button
            onClick={() => navigate('/catalog')}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 rounded-2xl hover:shadow-2xl font-black transition"
          >
            <ChevronLeft size={18} />
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  const inStock = product.stock > 0;
  const priceInfo = calculateDiscount(product, quantity);
  const totalOriginal = priceInfo.originalPrice * quantity;
  const totalFinal = priceInfo.finalPrice;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/catalog')}
          className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-gold dark:hover:text-brand-gold mb-8 font-bold transition"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Volver al catálogo
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Image Gallery - Redesigned */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="aspect-square p-12 flex items-center justify-center">
                {priceInfo.hasDiscount && (
                  <div className="absolute top-6 right-6 z-10">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-2xl font-black text-xl shadow-2xl animate-pulse">
                      -{priceInfo.discountPercentage}% OFF
                    </div>
                  </div>
                )}
                {priceInfo.hasDiscount && priceInfo.promotion && (
                  <div className="absolute top-6 left-6 z-10">
                    <div className="bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 px-5 py-2.5 rounded-2xl font-black text-sm shadow-lg flex items-center gap-2">
                      <Sparkles size={16} />
                      {priceInfo.promotion.name}
                    </div>
                  </div>
                )}
                {!inStock && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
                    <span className="text-white font-black text-3xl">AGOTADO</span>
                  </div>
                )}
                <img
                  src={getImageUrl(product.image_url)}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {[0, 1, 2, 3].map(i => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === i
                      ? 'border-brand-gold shadow-lg scale-105'
                      : 'border-slate-200 dark:border-slate-800 hover:border-brand-gold/50'
                    }`}
                >
                  <img
                    src={getImageUrl(product.image_url)}
                    alt={`Vista ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info - Redesigned */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              {product.Category && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold font-black text-sm rounded-full mb-4">
                  <Tag size={14} />
                  {product.Category.name}
                </span>
              )}
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={22}
                      className={i < 4 ? 'fill-brand-gold text-brand-gold' : 'text-slate-300 dark:text-slate-600'}
                    />
                  ))}
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">4.5</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 dark:text-slate-400">234 reseñas</span>
              </div>
            </div>

            {/* Price Card - Redesigned */}
            <div className="bg-gradient-to-br from-brand-gold/10 to-yellow-500/10 border-2 border-brand-gold/30 p-8 rounded-3xl">
              <PriceDisplay
                originalPrice={totalOriginal}
                finalPrice={totalFinal}
                hasDiscount={priceInfo.hasDiscount}
                discountPercentage={priceInfo.discountPercentage}
                size="lg"
                showBadge={true}
              />
              {priceInfo.hasDiscount && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl">
                  <p className="text-green-700 dark:text-green-300 font-black flex items-center gap-2 text-lg">
                    <Check size={20} />
                    ¡Ahorras ${(totalOriginal - totalFinal).toFixed(2)}!
                  </p>
                </div>
              )}
              {quantity > 1 && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 flex items-center gap-2 font-medium">
                  <Package size={16} />
                  Precio por unidad: ${priceInfo.finalPrice.toFixed(2)}
                </p>
              )}
            </div>

            {/* Stock Info - Redesigned */}
            <div className={`p-6 rounded-2xl border-2 ${inStock
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'
              }`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`font-black text-xl ${inStock ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                  {inStock ? '✓ Disponible' : '✗ Agotado'}
                </span>
                {inStock && (
                  <span className="text-green-700 dark:text-green-300 font-black flex items-center gap-2">
                    <Clock size={18} />
                    {product.stock} unidades
                  </span>
                )}
              </div>
              {inStock && (
                <div className="w-full bg-green-200 dark:bg-green-900 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Quantity - Redesigned */}
            {inStock && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800">
                <label className="block font-black text-slate-900 dark:text-white mb-4 text-lg">
                  Cantidad
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 hover:from-brand-gold hover:to-yellow-500 hover:text-slate-900 dark:hover:from-brand-gold dark:hover:to-yellow-500 rounded-2xl font-black text-2xl transition-all hover:scale-110 shadow-lg"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        setQuantity(Math.max(1, Math.min(product.stock, val)));
                      }
                    }}
                    min="1"
                    max={product.stock}
                    className="w-28 h-16 text-center bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-black text-3xl focus:outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/20 transition"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 hover:from-brand-gold hover:to-yellow-500 hover:text-slate-900 dark:hover:from-brand-gold dark:hover:to-yellow-500 rounded-2xl font-black text-2xl transition-all hover:scale-110 shadow-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons - Redesigned */}
            {inStock ? (
              <div className="flex gap-4">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 py-6 rounded-2xl font-black text-xl hover:shadow-2xl hover:shadow-brand-gold/50 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  <ShoppingCart size={26} />
                  Comprar Ahora
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-white dark:bg-slate-900 border-2 border-brand-gold text-brand-gold py-6 rounded-2xl font-black text-xl hover:bg-brand-gold hover:text-slate-900 transition-all flex items-center justify-center gap-3"
                >
                  Añadir al Carrito
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className={`px-6 py-6 rounded-2xl font-bold transition-all transform hover:scale-110 border-2 ${isFavorite
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-red-300'
                    }`}
                >
                  <Heart size={26} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>
            ) : (
              <div className="bg-slate-100 dark:bg-slate-800 p-10 rounded-3xl text-center border-2 border-slate-200 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400 font-black text-2xl mb-3">
                  Producto Agotado
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Te notificaremos cuando vuelva a estar disponible
                </p>
              </div>
            )}

            {/* Benefits - Redesigned */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Truck, title: 'Envío Gratis', desc: 'Desde $100', gradient: 'from-blue-500 to-cyan-500' },
                { icon: Shield, title: 'Garantizado', desc: '100% Original', gradient: 'from-green-500 to-emerald-500' },
                { icon: RefreshCw, title: 'Devolución', desc: '30 días', gradient: 'from-purple-500 to-pink-500' }
              ].map((benefit, i) => (
                <div key={i} className="text-center p-5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all hover:scale-105">
                  <div className={`w-12 h-12 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs font-black text-slate-900 dark:text-white mb-1">{benefit.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description - Redesigned */}
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-10">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="p-4 bg-brand-gold/10 border border-brand-gold/30 rounded-2xl">
                📝
              </span>
              Descripción del Producto
            </h2>
            <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed">
              {product.description || 'No hay descripción disponible para este producto.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
