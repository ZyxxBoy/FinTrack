import { create } from 'zustand'

const useStore = create((set, get) => ({
  // Auth
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  
  // Theme
  isDark: true,
  toggleTheme: () => {
    const newIsDark = !get().isDark
    set({ isDark: newIsDark })
    if (newIsDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
    localStorage.setItem('fintrack-theme', newIsDark ? 'dark' : 'light')
  },
  initTheme: () => {
    const saved = localStorage.getItem('fintrack-theme')
    const isDark = saved !== 'light'
    set({ isDark })
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  },
  
  // Currency
  currency: 'IDR',
  setCurrency: (currency) => {
    set({ currency })
    localStorage.setItem('fintrack-currency', currency)
  },
  initCurrency: () => {
    const saved = localStorage.getItem('fintrack-currency')
    if (saved) set({ currency: saved })
  },
  
  // Transactions
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),
  updateTransaction: (id, data) => set((state) => ({
    transactions: state.transactions.map(tx => tx.id === id ? { ...tx, ...data } : tx)
  })),
  removeTransaction: (id) => set((state) => ({
    transactions: state.transactions.filter(tx => tx.id !== id)
  })),
  
  // Categories
  categories: [],
  setCategories: (categories) => set({ categories }),
  
  // Budgets
  budgets: [],
  setBudgets: (budgets) => set({ budgets }),
  
  // Savings Goals
  savingsGoals: [],
  setSavingsGoals: (goals) => set({ savingsGoals: goals }),
  
  // UI State
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  // Transaction Modal
  showTransactionModal: false,
  editingTransaction: null,
  openTransactionModal: (tx = null) => set({ showTransactionModal: true, editingTransaction: tx }),
  closeTransactionModal: () => set({ showTransactionModal: false, editingTransaction: null }),
  
  // Quick shortcuts
  quickShortcuts: JSON.parse(localStorage.getItem('fintrack-shortcuts') || '[]'),
  setQuickShortcuts: (shortcuts) => {
    set({ quickShortcuts: shortcuts })
    localStorage.setItem('fintrack-shortcuts', JSON.stringify(shortcuts))
  },
  
  // Streak
  streak: 0,
  setStreak: (streak) => set({ streak }),
  
  // Notifications
  notifications: [],
  addNotification: (notif) => set((state) => ({ 
    notifications: [{ id: Date.now(), ...notif, read: false }, ...state.notifications] 
  })),
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  clearNotifications: () => set({ notifications: [] }),
  unreadCount: () => get().notifications.filter(n => !n.read).length,
}))

export default useStore
