import { motion, AnimatePresence } from 'motion/react';
import { History, Trash2, TrendingUp } from 'lucide-react';

const currencySymbols = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
  KGS: 'с',
};

// motion presets — вынесены, чтобы избежать двойных фигурных в JSX
const cardMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: 0.1 },
};

const itemMotion = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16, scale: 0.95 },
  transition: { duration: 0.3 },
};

const btnHover = { scale: 1.05 };
const btnTap = { scale: 0.95 };

export default function TransactionHistory({ transactions, currency = 'RUB', onDelete }) {
  const symbol = currencySymbols[currency] || '₽';
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays === 1) return 'вчера';

    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (transactions.length === 0) {
    return (
      <motion.div
        {...cardMotion}
        className="bg-dark-card border border-primary/20 rounded-3xl p-8 text-center lg:flex-1 lg:min-h-0 flex flex-col items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-5 bg-dark-light rounded-full">
            <History className="w-12 h-12 text-gray-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-400 mb-3">
              История пуста
            </h3>
            <p className="text-gray-500">
              Пополните копилку, чтобы увидеть историю транзакций
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      {...cardMotion}
      className="backdrop-blur-sm bg-dark-light/20 border-2 border-primary/20 rounded-3xl p-5 lg:flex-1 lg:min-h-0 flex flex-col"
    >
      <div className="flex items-center gap-3 mb-3 shrink-0">
        <History className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-display font-bold">История пополнений</h2>
        <span className="ml-auto text-base text-gray-400 bg-dark-light px-3 py-1 rounded-full">
          {transactions.length} {transactions.length === 1 ? 'транзакция' : 'транзакций'}
        </span>
      </div>

      <div className="space-y-2 lg:flex-1 lg:min-h-0 max-h-[40vh] lg:max-h-none overflow-y-auto pr-2 smooth-scroll">
        <AnimatePresence mode="popLayout">
          {transactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              {...itemMotion}
              layout
              className="bg-dark-light/30 border border-primary/10 rounded-xl p-3 flex items-center gap-3 group hover:border-primary/30 transition-colors"
            >
              <div className="p-2 bg-success/10 rounded-lg shrink-0">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-white mb-1">
                  +{transaction.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {transaction.currency ? currencySymbols[transaction.currency] : symbol}
                </div>
                <div className="text-sm text-gray-400">
                  {formatDate(transaction.created_at)}
                </div>
              </div>

              <motion.button
                whileHover={btnHover}
                whileTap={btnTap}
                onClick={() => onDelete(transaction.id)}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
