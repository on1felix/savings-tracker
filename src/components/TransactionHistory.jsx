import { motion, AnimatePresence } from 'motion/react';
import { History, Trash2, TrendingUp } from 'lucide-react';

const currencySymbols = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
  KGS: 'с',
};

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
      year: 'numeric'
    });
  };

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="bg-dark-card border border-primary/20 rounded-3xl p-12 text-center"
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="backdrop-blur-sm border-2 border-primary/20 rounded-3xl p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <History className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-display font-bold">История пополнений</h2>
        <span className="ml-auto text-base text-gray-400 bg-dark-light px-3 py-1 rounded-full">
          {transactions.length} {transactions.length === 1 ? 'транзакция' : 'транзакций'}
        </span>
      </div>

      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 smooth-scroll">
        <AnimatePresence mode="popLayout">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              layout
              className="bg-dark-light/30 border border-primary/10 rounded-xl p-3 flex items-center gap-3 group hover:border-primary/30 transition-colors"
            >
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-white mb-1">
                  +{transaction.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {transaction.currency ? currencySymbols[transaction.currency] : symbol}
                </div>
                <div className="text-base text-gray-400">
                  {formatDate(transaction.created_at)}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(transaction.id)}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
