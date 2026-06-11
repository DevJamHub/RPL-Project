import { create } from "zustand";

export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  description: string;
  date: string; // YYYY-MM-DD
  createdAt?: string;
}

export interface CategoryAlert {
  category: string;
  spent: number;
  limit: number;
  percentage: number;
}

export interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  budgetLimit: number | null;
}

interface FinTrackState {
  transactions: Transaction[];
  globalBudget: number;
  budgets: Record<string, number>; // { "Kategori": limit }
  isInitialized: boolean;

  // Initialization
  fetchInitialData: () => Promise<void>;

  // Actions (Async)
  addTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setBudget: (categoryName: string, amount: number) => Promise<void>;
  setGlobalBudget: (amount: number) => Promise<void>;

  // Getters
  getMonthIncome: (month: number, year: number) => number;
  getMonthExpense: (month: number, year: number) => number;
  getBalance: () => number;
  getExpenseByCategory: (month: number, year: number) => { name: string; amount: number; color: string; icon: string }[];
  getCategoryAlerts: () => CategoryAlert[];
  getAlertLevel: () => { level: "SAFE" | "WARNING" | "DANGER" | "CRITICAL"; percentage: number; message: string };
}

export const useFinTrackStore = create<FinTrackState>((set, get) => ({
  transactions: [],
  globalBudget: 0,
  budgets: {},
  isInitialized: false,

  fetchInitialData: async () => {
    try {
      // Fetch User (Global Budget)
      const userRes = await fetch('/api/user');
      const user = await userRes.json();
      if (!userRes.ok) throw new Error(user.error || 'Failed to fetch user');
      
      // Fetch Categories
      const catRes = await fetch('/api/categories');
      const categories: Category[] = await catRes.json();
      if (!catRes.ok) throw new Error('Failed to fetch categories');
      const budgetsRecord: Record<string, number> = {};
      categories.forEach(c => {
        if (c.budgetLimit) budgetsRecord[c.name] = c.budgetLimit;
      });

      // Fetch Transactions
      const txRes = await fetch('/api/transactions');
      const transactions = await txRes.json();
      if (!txRes.ok) throw new Error(transactions.error || 'Failed to fetch transactions');

      set({
        transactions,
        globalBudget: user.budgetLimit || 0,
        budgets: budgetsRecord,
        isInitialized: true,
      });
    } catch (err) {
      console.error("Failed to fetch initial data", err);
    }
  },

  addTransaction: async (tx) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: tx.type,
          amount: tx.amount,
          categoryName: tx.category,
          description: tx.description,
          date: tx.date,
        })
      });
      const newTx = await res.json();
      if (!res.ok) throw new Error(newTx.error || 'Failed to add transaction');
      set((state) => ({ transactions: [newTx, ...state.transactions] }));
    } catch (err) {
      console.error("Failed to add transaction", err);
    }
  },

  deleteTransaction: async (id) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete transaction');
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    } catch (err) {
      console.error("Failed to delete transaction", err);
    }
  },

  setBudget: async (categoryName, amount) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName, budgetLimit: amount })
      });
      if (!res.ok) throw new Error('Failed to set category budget');
      set((state) => ({
        budgets: { ...state.budgets, [categoryName]: amount },
      }));
    } catch (err) {
      console.error("Failed to set category budget", err);
    }
  },

  setGlobalBudget: async (amount) => {
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgetLimit: amount })
      });
      if (!res.ok) throw new Error('Failed to set global budget');
      set({ globalBudget: amount });
    } catch (err) {
      console.error("Failed to set global budget", err);
    }
  },

  getMonthIncome: (month, year) => {
    return get().transactions
      .filter((t) => {
        const d = new Date(t.date);
        return t.type === "INCOME" && d.getMonth() + 1 === month && d.getFullYear() === year;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getMonthExpense: (month, year) => {
    return get().transactions
      .filter((t) => {
        const d = new Date(t.date);
        return t.type === "EXPENSE" && d.getMonth() + 1 === month && d.getFullYear() === year;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getBalance: () => {
    return get().transactions.reduce(
      (sum, t) => (t.type === "INCOME" ? sum + t.amount : sum - t.amount),
      0
    );
  },

  getExpenseByCategory: (month, year) => {
    const expenses = get().transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === "EXPENSE" && d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const categoryMap: Record<string, { amount: number; color: string; icon: string }> = {};

    expenses.forEach((t) => {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = { amount: 0, color: t.categoryColor, icon: t.categoryIcon };
      }
      categoryMap[t.category].amount += t.amount;
    });

    return Object.entries(categoryMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount);
  },

  getCategoryAlerts: () => {
    const alerts: CategoryAlert[] = [];
    const now = new Date();
    const expenses = get().getExpenseByCategory(now.getMonth() + 1, now.getFullYear());
    const budgets = get().budgets;

    expenses.forEach((e) => {
      const limit = budgets[e.name];
      if (limit) {
        const percentage = (e.amount / limit) * 100;
        if (percentage >= 80) {
          alerts.push({ category: e.name, spent: e.amount, limit, percentage });
        }
      }
    });

    return alerts.sort((a, b) => b.percentage - a.percentage);
  },

  getAlertLevel: () => {
    const globalBudget = get().globalBudget;
    if (globalBudget <= 0) return { level: "SAFE", percentage: 0, message: "" };

    const now = new Date();
    const expense = get().getMonthExpense(now.getMonth() + 1, now.getFullYear());
    const percentage = (expense / globalBudget) * 100;

    if (percentage >= 100) return { level: "CRITICAL", percentage, message: "PENGELUARAN MELEBIHI BATAS BUDGET BULANAN!" };
    if (percentage >= 90) return { level: "DANGER", percentage, message: "AWAS! Pengeluaran sudah mencapai 90% dari budget bulanan." };
    if (percentage >= 75) return { level: "WARNING", percentage, message: "Perhatian: Pengeluaran sudah mencapai 75% dari budget bulanan." };
    
    return { level: "SAFE", percentage, message: "" };
  },
}));

// Export constants untuk form
export const EXPENSE_CATEGORIES = [
  { name: 'Makan', icon: 'utensils', color: '#EF4444' },
  { name: 'Transport', icon: 'car', color: '#F59E0B' },
  { name: 'Hiburan', icon: 'film', color: '#8B5CF6' },
  { name: 'Belanja Online', icon: 'shopping-cart', color: '#EC4899' },
  { name: 'Pendidikan', icon: 'book', color: '#3B82F6' },
  { name: 'Kesehatan', icon: 'activity', color: '#10B981' },
  { name: 'Tabungan', icon: 'piggy-bank', color: '#06B6D4' },
  { name: 'Lainnya (Keluar)', icon: 'more-horizontal', color: '#6B7280' },
];

export const INCOME_CATEGORIES = [
  { name: 'Uang Saku', icon: 'wallet', color: '#22C55E' },
  { name: 'Beasiswa', icon: 'award', color: '#6366F1' },
  { name: 'Kerja Part-time', icon: 'briefcase', color: '#14B8A6' },
  { name: 'Lainnya (Masuk)', icon: 'more-horizontal', color: '#6B7280' },
];
