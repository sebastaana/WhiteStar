import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import ErrorMessage from '../components/ErrorMessage';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { addToast } = useToast();

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(loginData.email, loginData.password);
      addToast('✓ ¡Bienvenido de nuevo!', 'success', 2000);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!registerData.first_name || !registerData.last_name || !registerData.email || !registerData.password) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (registerData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await register(
        registerData.email,
        registerData.password,
        registerData.first_name,
        registerData.last_name
      );
      addToast('✓ ¡Cuenta creada exitosamente!', 'success', 2000);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setLoginData({
      email: 'admin@perfumestore.com',
      password: 'admin123'
    });
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gold rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <h1 className="text-4xl font-black mb-2">
                <span className="text-brand-gold">Perfume</span> Store
              </h1>
              <p className="text-slate-400">Tu tienda de fragancias premium</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-4 px-6 font-bold text-center transition ${
                isLogin
                  ? 'bg-brand-gold text-slate-900 border-b-2 border-brand-gold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              🔐 Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-4 px-6 font-bold text-center transition ${
                !isLogin
                  ? 'bg-brand-gold text-slate-900 border-b-2 border-brand-gold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              ✨ Registrarse
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {error && <ErrorMessage message={error} />}

            {isLogin ? (
              /* LOGIN */
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    📧 Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400 dark:text-slate-500 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="tu@email.com"
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    🔑 Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400 dark:text-slate-500 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-gold"
                    />
                    <span className="text-slate-600 dark:text-slate-400">
                      Recuérdame
                    </span>
                  </label>
                  <Link
                    to="/recover-password"
                    className="text-brand-gold hover:text-brand-gold-600 font-semibold"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 py-3 rounded-lg font-bold hover:shadow-lg disabled:opacity-50 transition transform hover:scale-105 mt-6 flex items-center justify-center gap-2 text-lg"
                >
                  {loading ? 'Iniciando...' : (
                    <>
                      Iniciar Sesión <ArrowRight size={20} />
                    </>
                  )}
                </button>

                {/* Demo */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-bold mb-2">
                    📱 Prueba con cuenta demo:
                  </p>
                  <button
                    type="button"
                    onClick={fillDemo}
                    className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-mono font-bold bg-blue-100 dark:bg-blue-900/30 p-2 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                  >
                    admin@perfumestore.com / admin123
                  </button>
                </div>
              </form>
            ) : (
              /* REGISTER */
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Nombre y Apellido */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Nombre
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-slate-400 dark:text-slate-500 w-5 h-5" />
                      <input
                        type="text"
                        name="first_name"
                        value={registerData.first_name}
                        onChange={handleRegisterChange}
                        placeholder="Juan"
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Apellido
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-slate-400 dark:text-slate-500 w-5 h-5" />
                      <input
                        type="text"
                        name="last_name"
                        value={registerData.last_name}
                        onChange={handleRegisterChange}
                        placeholder="Pérez"
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    📧 Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400 dark:text-slate-500 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      placeholder="tu@email.com"
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    🔑 Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400 dark:text-slate-500 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition"
                      minLength="6"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Mínimo 6 caracteres
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    ✓ Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400 dark:text-slate-500 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 py-3 rounded-lg font-bold hover:shadow-lg disabled:opacity-50 transition transform hover:scale-105 mt-6 flex items-center justify-center gap-2 text-lg"
                >
                  {loading ? 'Registrando...' : (
                    <>
                      Crear Cuenta <ArrowRight size={20} />
                    </>
                  )}
                </button>

                {/* Terms */}
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
                  Al registrarte aceptas nuestros{' '}
                  <Link to="#" className="text-brand-gold hover:text-brand-gold-600 font-bold">
                    Términos y Condiciones
                  </Link>
                </p>
              </form>
            )}

            {/* Bottom Link */}
            <div className="mt-6 text-center">
              <p className="text-slate-600 dark:text-slate-400">
                {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="text-brand-gold hover:text-brand-gold-600 font-bold transition"
                >
                  {isLogin ? 'Registrarse' : 'Iniciar Sesión'}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-400 text-sm">
          <p>🔒 Tu información está protegida con encriptación SSL</p>
        </div>
      </div>
    </div>
  );
}
