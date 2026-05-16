import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, Euro, Coins, Banknote } from 'lucide-react';

const currencies = [
  { code: 'RUB', symbol: '₽', name: 'Российский рубль', icon: Coins },
  { code: 'USD', symbol: '$', name: 'Доллар США', icon: DollarSign },
  { code: 'EUR', symbol: '€', name: 'Евро', icon: Euro },
  { code: 'KGS', symbol: 'с', name: 'Кыргызский сом', icon: Banknote },
];

export default function SettingsModal({ isOpen, onClose, currency, onCurrencyChange }) {
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
                  Настройки
                </h2>
                <p className="text-gray-400">Выберите валюту для отображения</p>
              </div>

              <div className="space-y-3">
                {currencies.map((curr) => {
                  const Icon = curr.icon;
                  return (
                    <motion.button
                      key={curr.code}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onCurrencyChange(curr.code);
                        onClose();
                      }}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        currency === curr.code
                          ? 'bg-primary/10 border-primary/50'
                          : 'bg-dark/50 backdrop-blur-sm border-primary/20 hover:border-primary/40'
                      }`}
                    >
                      <div className={`p-3 rounded-lg ${
                        currency === curr.code ? 'bg-primary/20' : 'bg-dark-light'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          currency === curr.code ? 'text-primary' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-white">{curr.name}</div>
                        <div className="text-sm text-gray-400">{curr.code} ({curr.symbol})</div>
                      </div>
                      {currency === curr.code && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
