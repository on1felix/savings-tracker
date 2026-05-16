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
            style={{ backdropFilter: 'blur(4px)' }}
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
                className="absolute top-6 right-6 p-2 hover:bg-primary/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-red-500/10 rounded-2xl">
                    <AlertTriangle className="w-7 h-7 text-red-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-display font-bold text-gradient mb-2 text-center">
                  Удалить транзакцию?
                </h2>
                <p className="text-sm text-gray-400 text-center mb-3">
                  Вы уверены, что хотите удалить эту транзакцию?
                </p>
                <p className="text-xl font-bold text-center text-gradient">
                  +{amount} {currency}
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 bg-dark-light border-2 border-primary/30 rounded-xl px-4 py-3 text-base font-semibold hover:border-primary hover:shadow-[0_0_20px_rgba(108,99,255,0.3)] transition-all duration-300 group relative overflow-hidden"
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
                  <span className="relative z-10">Отмена</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="flex-1 bg-dark-light border-2 border-red-500/30 rounded-xl px-4 py-3 text-base font-semibold text-red-400 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-300 group relative overflow-hidden"
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
                         background: 'radial-gradient(circle 100px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(239, 68, 68, 0.15), transparent)'
                       }}
                  />
                  <span className="relative z-10">Удалить</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
