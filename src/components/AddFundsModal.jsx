import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus } from 'lucide-react';

const currencySymbols = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
  KGS: 'с',
};

export default function AddFundsModal({ isOpen, onClose, onAdd, currency = 'RUB' }) {
  const symbol = currencySymbols[currency] || '₽';
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!isNaN(value) && value > 0) {
      onAdd(value);
      setAmount('');
    }
  };

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-primary/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-display font-bold text-gradient mb-2">
                  Пополнить копилку
                </h2>
                <p className="text-gray-400">Введите сумму пополнения</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Сумма
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      step="0.01"
                      min="0"
                      autoFocus
                      className="w-full bg-dark/80 border-2 border-primary/30 rounded-xl px-6 py-4 text-3xl font-bold text-white focus:outline-none focus:border-primary transition-colors"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-400">
                      {symbol}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Быстрый выбор
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((quickAmount) => (
                      <motion.button
                        key={quickAmount}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setAmount(quickAmount.toString())}
                        className="bg-dark-light/80 border border-primary/20 hover:border-primary/50 rounded-lg py-3 text-sm font-semibold transition-colors"
                      >
                        {quickAmount}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full bg-dark-light border-2 border-primary/30 rounded-xl px-8 py-4 flex items-center justify-center gap-3 hover:border-primary hover:shadow-[0_0_20px_rgba(108,99,255,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                  onMouseMove={(e) => {
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
                  <Plus className="w-5 h-5 relative z-10" />
                  <span className="text-lg font-semibold relative z-10">Добавить</span>
                </motion.button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
