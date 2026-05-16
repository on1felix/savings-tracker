import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, User, LogIn, UserPlus } from 'lucide-react';
import { authService } from '../lib/api';

export default function AuthModal({ isOpen, onClose, onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Заполните все поля');
      setLoading(false);
      return;
    }

    // Таймаут на случай зависания
    const timeout = setTimeout(() => {
      setLoading(false);
      setError('Превышено время ожидания. Попробуйте еще раз.');
    }, 10000);

    try {
      if (isLogin) {
        const { user } = await authService.signIn(username, password);
        clearTimeout(timeout);
        onLogin(user);
      } else {
        const { user } = await authService.signUp(username, password);
        clearTimeout(timeout);
        onLogin(user);
      }
    } catch (err) {
      clearTimeout(timeout);
      console.error('Auth error:', err);
      if (err.message.includes('Invalid login credentials')) {
        setError('Неверный логин или пароль');
      } else if (err.message.includes('уже существует')) {
        setError('Пользователь с таким логином уже существует');
      } else {
        setError(err.message || 'Произошла ошибка');
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="backdrop-blur-sm border-2 border-primary/20 rounded-3xl p-8 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-8 text-center">
                <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-4">
                  {isLogin ? (
                    <LogIn className="w-8 h-8 text-primary" />
                  ) : (
                    <UserPlus className="w-8 h-8 text-primary" />
                  )}
                </div>
                <h2 className="text-3xl font-display font-bold text-gradient mb-2">
                  {isLogin ? 'Вход' : 'Регистрация'}
                </h2>
                <p className="text-gray-400">
                  {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Логин
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ваш логин"
                      disabled={loading}
                      autoComplete="username"
                      className="w-full bg-dark/80 border-2 border-primary/30 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Пароль
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      className="w-full bg-dark/80 border-2 border-primary/30 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full bg-dark-light border-2 border-primary/30 rounded-xl px-6 py-3 flex items-center justify-center gap-2 hover:border-primary hover:shadow-[0_0_20px_rgba(108,99,255,0.3)] transition-all duration-300 disabled:opacity-50 group relative overflow-hidden"
                  onMouseMove={(e) => {
                    if (loading) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                       style={{
                         background: 'radial-gradient(circle 100px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(108, 99, 255, 0.15), transparent)'
                       }}
                  />
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                  ) : (
                    <>
                      {isLogin ? <LogIn className="w-5 h-5 relative z-10" /> : <UserPlus className="w-5 h-5 relative z-10" />}
                      <span className="text-lg font-semibold relative z-10">
                        {isLogin ? 'Войти' : 'Зарегистрироваться'}
                      </span>
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  disabled={loading}
                  className="text-gray-400 hover:text-primary transition-colors disabled:opacity-50"
                >
                  {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
