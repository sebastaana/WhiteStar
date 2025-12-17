import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Award, Zap, Star, Droplet, ShoppingBag, TrendingUp, Shield, Truck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section - Redesigned */}
      <section className="relative min-h-[90vh] flex items-center px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -right-48 w-96 h-96 bg-brand-gold/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-brand-gold/10 to-yellow-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold/10 border border-brand-gold/30 rounded-full backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-brand-gold" />
                <span className="text-brand-gold font-bold text-sm">Fragancias de Lujo</span>
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-none">
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
                  Descubre
                </span>
                <br />
                <span className="bg-gradient-to-r from-brand-gold via-yellow-500 to-brand-gold bg-clip-text text-transparent">
                  Tu Esencia
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Explora una colección exclusiva de perfumes premium que cuentan tu historia
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/catalog"
                  className="group relative px-8 py-4 bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 rounded-2xl font-black text-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-brand-gold/50 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Explorar Colección
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-brand-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>

                {!user && (
                  <Link
                    to="/register"
                    className="px-8 py-4 border-2 border-brand-gold text-brand-gold rounded-2xl font-black text-lg hover:bg-brand-gold/10 transition-all"
                  >
                    Crear Cuenta
                  </Link>
                )}
              </div>


            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[600px]">
                {/* Decorative Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/20 to-yellow-500/20 rounded-[3rem] backdrop-blur-sm border border-brand-gold/30"></div>
                <div className="absolute top-8 right-8 w-32 h-32 bg-brand-gold/30 rounded-full blur-2xl"></div>
                <div className="absolute bottom-8 left-8 w-40 h-40 bg-yellow-500/30 rounded-full blur-2xl"></div>

                {/* Floating Cards */}
                <div className="absolute top-20 left-10 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-gold to-yellow-500 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-slate-900" fill="currentColor" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">4.9/5</p>
                      <p className="text-xs text-slate-500">Valoración</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-20 right-10 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">24-48h</p>
                      <p className="text-xs text-slate-500">Envío Rápido</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Redesigned */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-2 bg-brand-gold/10 border border-brand-gold/30 rounded-full text-brand-gold font-bold text-sm">
              ¿Por qué WhiteStar?
            </span>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white">
              Experiencia Premium
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'Exclusividad',
                desc: 'Colección curada de las mejores marcas del mundo',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: Shield,
                title: '100% Original',
                desc: 'Garantía de autenticidad en cada producto',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Truck,
                title: 'Envío Express',
                desc: 'Entrega en 24-48h. Gratis desde $100',
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                icon: Heart,
                title: 'Asesoría Expert',
                desc: 'Te ayudamos a encontrar tu aroma perfecto',
                gradient: 'from-red-500 to-pink-500'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-transparent transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity"></div>

                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories - Redesigned */}
      <section className="py-24 px-4 bg-slate-100 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-2 bg-brand-gold/10 border border-brand-gold/30 rounded-full text-brand-gold font-bold text-sm">
              Categorías
            </span>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white">
              Para Cada Estilo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                emoji: '👨',
                title: 'Masculinos',
                desc: 'Aromas intensos y sofisticados',
                gradient: 'from-blue-600 via-blue-500 to-cyan-500'
              },
              {
                emoji: '👩',
                title: 'Femeninos',
                desc: 'Fragancias elegantes y cautivadoras',
                gradient: 'from-pink-600 via-pink-500 to-rose-500'
              },
              {
                emoji: '✨',
                title: 'Unisex',
                desc: 'Aromas versátiles sin límites',
                gradient: 'from-purple-600 via-purple-500 to-indigo-500'
              }
            ].map((cat, i) => (
              <Link
                key={i}
                to="/catalog"
                className="group relative overflow-hidden rounded-3xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>

                <div className="relative p-12 text-white">
                  <div className="text-6xl mb-6 group-hover:scale-125 transition-transform duration-300">
                    {cat.emoji}
                  </div>

                  <h3 className="text-3xl font-black mb-3">
                    {cat.title}
                  </h3>

                  <p className="text-white/90 mb-4 text-lg">
                    {cat.desc}
                  </p>

                  <div className="flex items-center justify-end">
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>





      {/* Final CTA - Redesigned */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-gold/5 to-transparent"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
              Comienza Tu
            </span>
            <br />
            <span className="bg-gradient-to-r from-brand-gold via-yellow-500 to-brand-gold bg-clip-text text-transparent">
              Viaje Aromático
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
            Explora nuestra colección completa y encuentra el perfume que define tu esencia
          </p>

          <Link
            to="/catalog"
            className="group inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 rounded-2xl font-black text-xl hover:shadow-2xl hover:shadow-brand-gold/50 transition-all hover:scale-105"
          >
            Ver Catálogo Completo
            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
