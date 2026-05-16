import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, amount, currency }) {
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
              className="backdrop-blur-sm border-2 border-primary/20 rounded-3xl p-6 max-w-sm w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-primary/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex p-4 bg-red-500/10 rounded-2xl mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">
                  Удалить транзакцию?
                </h2>
                <p className="text-gray-400 mb-2">
                  Вы уверены, что хотите удалить эту транзакцию?
                </p>
                <p className="text-lg font-semibold text-gradient">
                  +{amount} {currency}
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 bg-dark-light border-2 border-primary/30 rounded-xl px-4 py-3 font-semibold hover:border-primary/50 transition-all duration-300"
                >
                  Отмена
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="flex-1 bg-red-500/20 border-2 border-red-500/30 rounded-xl px-4 py-3 font-semibold text-red-400 hover:border-red-500/50 hover:bg-red-500/30 transition-all duration-300"
                >
                  Удалить
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
