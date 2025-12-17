import { ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { usePromotions } from '../hooks/usePromotions';
import { getImageUrl } from '../utils/image';
import PriceDisplay from './PriceDisplay';

export default function ProductCard({ product, onAddToCart }) {
  const { addToast } = useToast();
  const { calculateDiscount } = usePromotions();
  const inStock = product.stock > 0;

  // Calcular descuento si hay promociones
  const priceInfo = calculateDiscount(product, 1);

  const handleAddToCart = () => {
    onAddToCart(product);
    addToast(`${product.name} añadido al carrito ✓`, 'success', 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-metal-soft rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
      <Link to={`/product/${product.id}`} className="relative overflow-hidden bg-slate-100 dark:bg-slate-700 h-48">
        <img
          src={getImageUrl(product.image_url)}
          alt={`${product.name} - ${product.Category?.name || 'Perfume'} - Fragancia premium`}
          width="300"
          height="192"
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {!inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold" role="status" aria-live="polite">Agotado</span>
          </div>
        )}
        {priceInfo.hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
            -{priceInfo.discountPercentage}% OFF
          </div>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {product.Category?.name || 'Sin categoría'}
          </span>
        </div>

        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 hover:text-brand-gold transition">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < 4 ? 'fill-brand-gold text-brand-gold' : 'text-slate-300 dark:text-slate-600'}
            />
          ))}
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">(4.5)</span>
        </div>

        <div className="mt-auto">
          <PriceDisplay
            originalPrice={priceInfo.originalPrice}
            finalPrice={priceInfo.finalPrice}
            hasDiscount={priceInfo.hasDiscount}
            discountPercentage={priceInfo.discountPercentage}
            size="md"
          />

          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="flex-1 bg-brand-gold text-slate-900 py-2 px-4 rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 font-bold hover:scale-105 transform shadow-md hover:shadow-lg"
              title={inStock ? 'Añadir al carrito' : 'Producto agotado'}
              aria-label={`Añadir ${product.name} al carrito`}
            >
              <ShoppingCart size={18} aria-hidden="true" />
              {inStock ? 'Agregar' : 'Agotado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
