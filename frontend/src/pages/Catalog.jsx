import { useState, useEffect } from 'react';
import { Search, Filter, X, Grid3x3, List, ChevronUp, Sparkles, TrendingUp } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorMessage from '../components/ErrorMessage';
import FilterSidebar from '../components/FilterSidebar';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { usePromotions } from '../hooks/usePromotions';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    category: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { calculateDiscount } = usePromotions();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page,
        limit: 12,
        ...(search && { q: search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice })
      });

      const response = await api.get(`/products?${params}`);
      setProducts(response.data.products || []);
      setPagination(response.data.pagination || {});
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, filters]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', category: '' });
    setSearch('');
    setPage(1);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    addToast(`✓ ${product.name} añadido al carrito`, 'success', 2000);
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-desc':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'newest':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const activeFilters = search || filters.category || filters.minPrice || filters.maxPrice;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section - Redesigned */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-20 w-64 h-64 bg-brand-gold rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-20 w-64 h-64 bg-yellow-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold/20 border border-brand-gold/30 rounded-full mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span className="text-brand-gold font-bold text-sm">Colección Premium</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black text-white mb-4">
              Catálogo de
              <span className="block bg-gradient-to-r from-brand-gold via-yellow-500 to-brand-gold bg-clip-text text-transparent">
                Perfumes
              </span>
            </h1>

            <p className="text-xl text-slate-300 mb-8">
              {pagination.total || 0} fragancias exclusivas esperándote
            </p>
          </div>

          {/* Search Bar - Redesigned */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
            }}
            className="relative max-w-3xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Buscar tu fragancia perfecta..."
                value={search}
                onChange={handleSearch}
                className="w-full pl-16 pr-6 py-5 rounded-2xl border-2 border-slate-700 bg-slate-800/50 backdrop-blur-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/20 transition-all text-lg"
              />
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filtros - Desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                activeFilters={activeFilters}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Toolbar - Redesigned */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  {/* Mobile Filters Button */}
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-brand-gold/10 border border-brand-gold/30 rounded-xl text-brand-gold font-bold hover:bg-brand-gold/20 transition"
                  >
                    <Filter size={18} />
                    Filtros
                  </button>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 md:flex-auto px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold transition"
                  >
                    <option value="newest">Más Recientes</option>
                    <option value="oldest">Más Antiguos</option>
                    <option value="price-asc">Precio: Menor a Mayor</option>
                    <option value="price-desc">Precio: Mayor a Menor</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-lg transition ${viewMode === 'grid'
                      ? 'bg-brand-gold text-slate-900 shadow-lg'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    title="Vista Grid"
                  >
                    <Grid3x3 size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-lg transition ${viewMode === 'list'
                      ? 'bg-brand-gold text-slate-900 shadow-lg'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    title="Vista Lista"
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>

              {/* Active Filters */}
              {activeFilters && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                      Filtros activos:
                    </span>
                    {search && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-gold/10 border border-brand-gold/30 rounded-full text-sm font-medium text-brand-gold">
                        🔍 {search}
                        <button onClick={() => setSearch('')} className="hover:opacity-70">
                          <X size={14} />
                        </button>
                      </span>
                    )}
                    {filters.category && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-sm font-medium text-blue-600 dark:text-blue-400">
                        📁 {filters.category}
                        <button onClick={() => handleFilterChange('category', '')} className="hover:opacity-70">
                          <X size={14} />
                        </button>
                      </span>
                    )}
                    {(filters.minPrice || filters.maxPrice) && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-sm font-medium text-green-600 dark:text-green-400">
                        💲 ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}
                        <button
                          onClick={() => {
                            handleFilterChange('minPrice', '');
                            handleFilterChange('maxPrice', '');
                          }}
                          className="hover:opacity-70"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    )}
                    <button
                      onClick={handleClearFilters}
                      className="text-sm font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
                    >
                      Limpiar Todo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(9)].map((_, i) => (
                  <SkeletonLoader key={i} />
                ))}
              </div>
            ) : (
              <>
                {sortedProducts.length > 0 ? (
                  <>
                    <div className={`grid gap-6 mb-12 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                      {sortedProducts.map((product, idx) => (
                        <div
                          key={product.id}
                          className="animate-fade-in-down"
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <ProductCard product={product} onAddToCart={handleAddToCart} />
                        </div>
                      ))}
                    </div>

                    {/* Pagination - Redesigned */}
                    {pagination.pages > 1 && (
                      <div className="flex flex-col items-center gap-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-brand-gold transition text-slate-900 dark:text-white font-bold"
                          >
                            ← Anterior
                          </button>

                          <div className="flex gap-2">
                            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                              const pageNum = page <= 3 ? i + 1 : page - 2 + i;
                              if (pageNum > pagination.pages) return null;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setPage(pageNum)}
                                  className={`w-12 h-12 rounded-xl font-black transition ${page === pageNum
                                    ? 'bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 shadow-lg'
                                    : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-brand-gold'
                                    }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                            disabled={page === pagination.pages}
                            className="px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-brand-gold transition text-slate-900 dark:text-white font-bold"
                          >
                            Siguiente →
                          </button>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                          Página {page} de {pagination.pages || 1} • {pagination.total || 0} productos
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  /* Empty State - Redesigned */
                  <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <div className="w-24 h-24 bg-gradient-to-br from-brand-gold/20 to-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Filter className="w-12 h-12 text-brand-gold" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
                      No encontramos perfumes
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                      Intenta ajustar los filtros o la búsqueda para encontrar lo que buscas
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="px-8 py-4 bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 rounded-2xl font-black hover:shadow-2xl transition transform hover:scale-105"
                    >
                      Limpiar Filtros
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      {showFilters && (
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          activeFilters={activeFilters}
          onClose={() => setShowFilters(false)}
          isMobile
        />
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 rounded-2xl shadow-2xl hover:shadow-brand-gold/50 transition transform hover:scale-110 z-30"
          title="Ir al inicio"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}
