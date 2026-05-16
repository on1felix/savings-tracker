import { supabase } from './supabase';

export const authService = {
  async signUp(username, password) {
    try {
      // Проверяем, существует ли пользователь с таким логином
      const { data: existingUsers } = await supabase
        .from('users')
        .select('id')
        .eq('email', username);

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('Пользователь с таким логином уже существует');
      }

      // Создаем UUID для нового пользователя
      const userId = crypto.randomUUID();

      // Добавляем пользователя в таблицу users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            email: username,
            name: username,
            password_hash: password, // В продакшене нужно хешировать!
            currency: 'RUB',
          },
        ])
        .select()
        .single();

      if (userError) throw userError;

      // Создаем запись в savings
      const { error: savingsError } = await supabase
        .from('savings')
        .insert([
          {
            user_id: userId,
            current_amount: 0,
            target_amount: 10000,
          },
        ]);

      if (savingsError) throw savingsError;

      // Сохраняем сессию в localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));

      return { user: userData, session: null };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  async signIn(username, password) {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', username)
        .eq('password_hash', password)
        .maybeSingle();

      if (error) throw error;

      if (!userData) {
        throw new Error('Invalid login credentials');
      }

      // Сохраняем сессию в localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));

      return { user: userData, session: null };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  async signOut() {
    localStorage.removeItem('currentUser');
  },

  async getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  async updateCurrency(userId, currency) {
    const { data, error } = await supabase
      .from('users')
      .update({ currency })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Обновляем localStorage
    const currentUser = await this.getCurrentUser();
    if (currentUser) {
      currentUser.currency = currency;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    return data;
  },
};

export const savingsService = {
  async getSavings(userId) {
    const { data, error } = await supabase
      .from('savings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateSavings(userId, currentAmount, targetAmount) {
    const { data, error } = await supabase
      .from('savings')
      .update({
        current_amount: currentAmount,
        target_amount: targetAmount,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const transactionsService = {
  async getTransactions(userId) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addTransaction(userId, amount, currency) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          amount,
          currency,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTransaction(transactionId) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) throw error;
  },
};
