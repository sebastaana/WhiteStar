import { X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function FilterSidebar({
  filters,
  onFilterChange,
  onClearFilters,
  activeFilters,
  onClose,
  isMobile
}) {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    category: true,
    rating: true
  });
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const priceRanges = [
    { label: 'Menos de $50', min: 0, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $200', min: 100, max: 200 },
    { label: '$200 - $500', min: 200, max: 500 },
    { label: 'Más de $500', min: 500, max: 999999 }
  ];

  const ratings = [5, 4, 3, 2, 1];

  return (
    <div
      className={`${isMobile ? 'fixed inset-0 z-40 bg-black bg-opacity-50' : ''}`}
      onClick={isMobile ? onClose : undefined}
    >
      <div
        className={`bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 ${isMobile
          ? 'fixed inset-y-0 left-0 w-72 overflow-y-auto animate-slide-in-right'
          : 'sticky top-24'
          }`}
        onClick={e => isMobile && e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Filtros
          </h3>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition text-slate-900 dark:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {activeFilters && (
          <button
            onClick={onClearFilters}
            className="w-full mb-6 px-4 py-2 text-sm font-semibold text-brand-gold hover:text-brand-gold-600 border border-brand-gold rounded-lg hover:bg-brand-gold/10 transition"
          >
            Limpiar Filtros
          </button>
        )}

        <div className="space-y-6">
          {/* Precio */}
          <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
            <button
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between font-semibold text-slate-900 dark:text-white mb-4 hover:text-brand-gold transition"
            >
              💰 Precio
              <ChevronDown
                size={18}
                className={`transition transform ${expandedSections.price ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedSections.price && (
              <div className="space-y-2">
                {priceRanges.map(range => (
                  <label
                    key={range.label}
                    className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded transition"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-gold"
                      onChange={() => {
                        onFilterChange('minPrice', range.min);
                        onFilterChange('maxPrice', range.max);
                      }}
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {range.label}
                    </span>
                  </label>
                ))}
                <div className="pt-2 space-y-2">
                  <input
                    type="number"
                    placeholder="Mín. personalizado"
                    value={filters.minPrice}
                    onChange={(e) => onFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold placeholder-slate-400 dark:placeholder-slate-500"
                  />
                  <input
                    type="number"
                    placeholder="Máx. personalizado"
                    value={filters.maxPrice}
                    onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Categoría */}
          <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
            <button
              onClick={() => toggleSection('category')}
              className="w-full flex items-center justify-between font-semibold text-slate-900 dark:text-white mb-4 hover:text-brand-gold transition"
            >
              📁 Categoría
              <ChevronDown
                size={18}
                className={`transition transform ${expandedSections.category ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedSections.category && (
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded transition">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={!filters.category}
                    onChange={() => onFilterChange('category', '')}
                    className="w-4 h-4 border-slate-300 dark:border-slate-600 text-brand-gold"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Todas las categorías
                  </span>
                </label>
                {loadingCategories ? (
                  <div className="text-sm text-slate-400 p-2">Cargando categorías...</div>
                ) : (
                  categories.map(cat => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded transition"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.name}
                        checked={filters.category === cat.name}
                        onChange={() => onFilterChange('category', cat.name)}
                        className="w-4 h-4 border-slate-300 dark:border-slate-600 text-brand-gold"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {cat.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Rating */}
          <div>
            <button
              onClick={() => toggleSection('rating')}
              className="w-full flex items-center justify-between font-semibold text-slate-900 dark:text-white mb-4 hover:text-brand-gold transition"
            >
              ⭐ Calificación
              <ChevronDown
                size={18}
                className={`transition transform ${expandedSections.rating ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedSections.rating && (
              <div className="space-y-2">
                {ratings.map(rating => (
                  <label
                    key={rating}
                    className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded transition"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-gold"
                    />
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < rating ? 'text-brand-gold' : 'text-slate-300 dark:text-slate-600'}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">
                        {rating}+
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
