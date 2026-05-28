import { useState, useEffect } from 'react';
import AnimatedBackground from './components/AnimatedBackground';
import Header from './components/Header';
import SavingsCard from './components/SavingsCard';
import SavingsForecast from './components/SavingsForecast';
import SavingsStats from './components/SavingsStats';
import AddFundsModal from './components/AddFundsModal';
import TransactionHistory from './components/TransactionHistory';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import { authService, savingsService, transactionsService } from './lib/api';
import { supabase } from './lib/supabase';

export default function App() {
  const [user, setUser] = useState(null);
  const [currency, setCurrency] = useState('RUB');
  const [currentAmount, setCurrentAmount] = useState(0);
  const [targetAmount, setTargetAmount] = useState(10000);
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        loadUserData(userData.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthModalOpen(true);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const timeout = setTimeout(() => {
      setLoading(false);
      setIsAuthModalOpen(true);
    }, 3000);

    try {
      const userData = await authService.getCurrentUser();
      clearTimeout(timeout);

      if (userData) {
        setUser(userData);
        await loadUserData(userData.id);
        setIsAuthModalOpen(false);
      } else {
        setIsAuthModalOpen(true);
      }
    } catch (error) {
      clearTimeout(timeout);
      console.error('Error checking user:', error);
      setIsAuthModalOpen(true);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const loadUserData = async (userId) => {
    try {
      const [savingsData, transactionsData] = await Promise.all([
        savingsService.getSavings(userId),
        transactionsService.getTransactions(userId),
      ]);

      setCurrentAmount(parseFloat(savingsData.current_amount));
      setTargetAmount(parseFloat(savingsData.target_amount));
      setTransactions(transactionsData);

      const userData = await authService.getCurrentUser();
      setCurrency(userData.currency || 'RUB');
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogin = async (userData) => {
    setUser(userData);
    setIsAuthModalOpen(false);
    await loadUserData(userData.id);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setCurrentAmount(0);
      setTargetAmount(10000);
      setTransactions([]);
      setCurrency('RUB');
      setIsAuthModalOpen(true);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleAddFunds = async (amount) => {
    try {
      const newTransaction = await transactionsService.addTransaction(
        user.id,
        parseFloat(amount),
        currency
      );

      const newAmount = currentAmount + parseFloat(amount);
      await savingsService.updateSavings(user.id, newAmount, targetAmount);

      setTransactions(prev => [newTransaction, ...prev]);
      setCurrentAmount(newAmount);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding funds:', error);
      alert('Ошибка при добавлении средств');
    }
  };

  const handleDeleteTransaction = async (id) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    setTransactionToDelete(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;

    try {
      await transactionsService.deleteTransaction(transactionToDelete.id);

      const newAmount = currentAmount - parseFloat(transactionToDelete.amount);
      await savingsService.updateSavings(user.id, newAmount, targetAmount);

      setCurrentAmount(newAmount);
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Ошибка при удалении транзакции');
    }
  };

  const handleUpdateTarget = async (newTarget) => {
    try {
      await savingsService.updateSavings(user.id, currentAmount, parseFloat(newTarget));
      setTargetAmount(parseFloat(newTarget));
    } catch (error) {
      console.error('Error updating target:', error);
      alert('Ошибка при обновлении цели');
    }
  };

  const handleCurrencyChange = async (newCurrency) => {
    try {
      await authService.updateCurrency(user.id, newCurrency);
      setCurrency(newCurrency);
    } catch (error) {
      console.error('Error updating currency:', error);
      alert('Ошибка при смене валюты');
    }
  };

  const percentage = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;

  if (loading) {
    return (
      <div className="relative h-screen overflow-hidden bg-dark flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative h-screen overflow-hidden bg-dark">
        <AnimatedBackground />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {}}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  return (
    <div className="relative bg-dark min-h-screen lg:h-screen lg:overflow-hidden flex flex-col">
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col flex-1 min-h-0">
        <Header
          user={user}
          onLogout={handleLogout}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <main className="container mx-auto px-4 py-6 max-w-7xl w-full lg:flex-1 lg:min-h-0 lg:overflow-hidden lg:flex lg:flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-5 lg:flex-1 lg:min-h-0">
            <div className="order-2 lg:order-1 flex flex-col gap-5 lg:min-h-0">
              <TransactionHistory
                transactions={transactions}
                currency={currency}
                onDelete={handleDeleteTransaction}
              />

              <div className="lg:shrink-0">
                <SavingsStats
                  transactions={transactions}
                  currency={currency}
                />
              </div>
            </div>

            <div className="order-1 lg:order-2 flex flex-col gap-5 lg:min-h-0 lg:overflow-y-auto smooth-scroll lg:pr-1">
              <SavingsCard
                currentAmount={currentAmount}
                targetAmount={targetAmount}
                percentage={percentage}
                currency={currency}
                onAddFunds={() => setIsModalOpen(true)}
                onUpdateTarget={handleUpdateTarget}
              />

              <SavingsForecast
                transactions={transactions}
                currentAmount={currentAmount}
                targetAmount={targetAmount}
                currency={currency}
              />
            </div>
          </div>
        </main>
      </div>

      <AddFundsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddFunds}
        currency={currency}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTransactionToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        amount={transactionToDelete?.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        currency={transactionToDelete?.currency ?
          ({ RUB: '₽', USD: '$', EUR: '€', KGS: 'с' }[transactionToDelete.currency]) :
          ({ RUB: '₽', USD: '$', EUR: '€', KGS: 'с' }[currency])
        }
      />
    </div>
  );
}
