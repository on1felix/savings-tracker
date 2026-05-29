import { useState } from 'react';
import { motion } from 'motion/react';
import { PiggyBank, Target, Plus, Edit2 } from 'lucide-react';
import CountUp from './CountUp';
import CircularProgress from './CircularProgress';

const currencySymbols = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
  KGS: 'с',
};

export default function SavingsCard({ currentAmount, targetAmount, percentage, currency = 'RUB', onAddFunds, onUpdateTarget }) {
  const symbol = currencySymbols[currency] || '₽';
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(targetAmount.toString());

  const handleSaveTarget = () => {
    const newTarget = parseFloat(targetInput);
    if (!isNaN(newTarget) && newTarget > 0) {
      onUpdateTarget(newTarget);
      setIsEditingTarget(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveTarget();
    } else if (e.key === 'Escape') {
      setIsEditingTarget(false);
      setTargetInput(targetAmount.toString());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="backdrop-blur-sm border-2 border-primary/20 rounded-3xl p-5 md:p-7 mb-5"
    >
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div className="flex flex-col items-center justify-center">
          <CircularProgress percentage={percentage} size={190} />
        </div>

        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-gray-400">
              <PiggyBank className="w-5 h-5" />
              <span className="text-base font-medium">Текущая сумма</span>
            </div>
            <div className="text-4xl md:text-5xl font-display font-bold text-gradient">
              <CountUp end={currentAmount} duration={1.5} suffix={` ${symbol}`} decimals={2} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-gray-400">
              <Target className="w-5 h-5" />
              <span className="text-base font-medium">Цель</span>
            </div>
            {isEditingTarget ? (
              <div className="flex items-center gap-2 overflow-hidden">
                <input
                  type="number"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={handleSaveTarget}
                  autoFocus
                  className="text-3xl md:text-4xl font-display font-bold bg-dark/80 border-2 border-primary/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors w-full max-w-[200px]"
                />
                <span className="text-3xl md:text-4xl font-display font-bold text-white flex-shrink-0">{symbol}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-4xl md:text-5xl font-display font-bold text-gradient">
                  <CountUp end={targetAmount} duration={1.5} suffix={` ${symbol}`} decimals={0} />
                </div>
                <button
                  onClick={() => setIsEditingTarget(true)}
                  className="p-2 hover:bg-primary/20 rounded-lg transition-colors flex-shrink-0"
                >
                  <Edit2 className="w-4 h-4 text-primary" />
                </button>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="pt-2"
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onAddFunds}
              className="w-full bg-dark-light border-2 border-primary/30 rounded-xl px-6 py-3 flex items-center justify-center gap-2 hover:border-primary hover:shadow-[0_0_20px_rgba(108,99,255,0.3)] transition-all duration-300 group relative overflow-hidden"
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
              <span className="text-lg font-semibold relative z-10">Пополнить</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
