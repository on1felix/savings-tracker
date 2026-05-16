import GradientText from './GradientText';
import { Wallet, LogOut, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export default function Header({ user, onLogout, onOpenSettings }) {
  return (
    <header className="relative z-20 py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 border border-primary/20 rounded-xl animate-pulse-glow">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <GradientText
              className="text-3xl md:text-4xl font-display font-bold"
              colors={['#6C63FF', '#00D9FF', '#FF6584']}
              animationSpeed={6}
            >
              Моя Копилка
            </GradientText>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 border border-primary/20 rounded-xl px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-300">{user.name}</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenSettings}
                className="p-2 border border-primary/20 rounded-xl hover:border-primary/40 transition-colors"
                title="Настройки"
              >
                <Settings className="w-5 h-5 text-gray-300" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="p-2 bg-dark-card/80 backdrop-blur-xl border border-red-500/20 rounded-xl hover:border-red-500/40 transition-colors"
                title="Выйти"
              >
                <LogOut className="w-5 h-5 text-red-400" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
