import { useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import toast from 'react-hot-toast'

export function useTransactions() {
  const { user } = useStore()
  const { 
    transactions, setTransactions, addTransaction, 
    updateTransaction, removeTransaction, categories, setCategories 
  } = useStore()

  const fetchCategories = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    
    if (data) setCategories(data)
  }, [user])

  const fetchTransactions = useCallback(async (filters = {}) => {
    if (!user) return
    
    let query = supabase
      .from('transactions')
      .select(`*, categories(name, icon, color)`)
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters.type) query = query.eq('type', filters.type)
    if (filters.category_id) query = query.eq('category_id', filters.category_id)
    if (filters.dateFrom) query = query.gte('date', filters.dateFrom)
    if (filters.dateTo) query = query.lte('date', filters.dateTo)
    if (filters.minAmount) query = query.gte('amount', filters.minAmount)
    if (filters.maxAmount) query = query.lte('amount', filters.maxAmount)
    if (filters.search) query = query.ilike('note', `%${filters.search}%`)
    if (filters.limit) query = query.limit(filters.limit)
    if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)

    const { data, error } = await query

    if (error) {
      toast.error('Gagal memuat transaksi')
      return []
    }

    if (!filters.offset) {
      setTransactions(data || [])
    }
    return data || []
  }, [user])

  const createTransaction = useCallback(async (txData) => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...txData,
        user_id: user.id,
      })
      .select(`*, categories(name, icon, color)`)
      .single()
    
    if (error) {
      toast.error('Gagal menambah transaksi')
      throw error
    }
    
    addTransaction(data)
    toast.success('Transaksi berhasil ditambahkan! 🎉')
    
    // Check budget warning
    if (txData.type === 'expense' && txData.category_id) {
      checkBudgetWarning(txData.category_id, txData.amount)
    }
    
    return data
  }, [user])

  const editTransaction = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select(`*, categories(name, icon, color)`)
      .single()
    
    if (error) {
      toast.error('Gagal mengubah transaksi')
      throw error
    }
    
    updateTransaction(id, data)
    toast.success('Transaksi berhasil diubah! ✏️')
    return data
  }, [])

  const deleteTransaction = useCallback(async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    
    if (error) {
      toast.error('Gagal menghapus transaksi')
      throw error
    }
    
    removeTransaction(id)
    toast.success('Transaksi berhasil dihapus 🗑️')
  }, [])

  const uploadReceipt = useCallback(async (file) => {
    if (!user) return null
    const ext = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${ext}`
    
    const { error } = await supabase.storage
      .from('receipts')
      .upload(fileName, file)
    
    if (error) {
      console.error("Upload receipt error details: ", error)
      toast.error(error.message || 'Gagal mengupload struk. Pastikan bucket "receipts" ada di Supabase')
      return null
    }
    
    const { data: urlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName)
    
    return urlData.publicUrl
  }, [user])

  const getStats = useCallback(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    
    const monthlyTx = transactions.filter(tx => tx.date >= startOfMonth)
    
    const totalIncome = monthlyTx
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + Number(tx.amount), 0)
    
    const totalExpense = monthlyTx
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + Number(tx.amount), 0)
    
    const balance = totalIncome - totalExpense
    const savings = Math.max(0, balance)
    
    return { totalIncome, totalExpense, balance, savings }
  }, [transactions])

  const getExpenseByCategory = useCallback(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    
    const monthlyExpenses = transactions.filter(
      tx => tx.type === 'expense' && tx.date >= startOfMonth
    )
    
    const byCategory = {}
    monthlyExpenses.forEach(tx => {
      const catName = tx.categories?.name || 'Lainnya'
      const catColor = tx.categories?.color || '#B8B8B8'
      const catIcon = tx.categories?.icon || '📦'
      
      if (!byCategory[catName]) {
        byCategory[catName] = { name: catName, color: catColor, icon: catIcon, amount: 0 }
      }
      byCategory[catName].amount += Number(tx.amount)
    })
    
    return Object.values(byCategory).sort((a, b) => b.amount - a.amount)
  }, [transactions])

  const getTrend = useCallback((days = 30) => {
    const result = []
    const now = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayTx = transactions.filter(tx => tx.date === dateStr)
      const income = dayTx.filter(tx => tx.type === 'income').reduce((s, tx) => s + Number(tx.amount), 0)
      const expense = dayTx.filter(tx => tx.type === 'expense').reduce((s, tx) => s + Number(tx.amount), 0)
      
      result.push({
        date: dateStr,
        label: `${date.getDate()}/${date.getMonth() + 1}`,
        income,
        expense,
        balance: income - expense,
      })
    }
    
    return result
  }, [transactions])

  const getWeeklyComparison = useCallback(() => {
    const result = []
    const now = new Date()
    
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - (w * 7) - weekStart.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      const startStr = weekStart.toISOString().split('T')[0]
      const endStr = weekEnd.toISOString().split('T')[0]
      
      const weekTx = transactions.filter(tx => tx.date >= startStr && tx.date <= endStr)
      
      result.push({
        week: `Minggu ${4 - w}`,
        income: weekTx.filter(tx => tx.type === 'income').reduce((s, tx) => s + Number(tx.amount), 0),
        expense: weekTx.filter(tx => tx.type === 'expense').reduce((s, tx) => s + Number(tx.amount), 0),
      })
    }
    
    return result
  }, [transactions])

  const checkBudgetWarning = async (categoryId, amount) => {
    const now = new Date()
    const { data: budget } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('category_id', categoryId)
      .eq('month', now.getMonth() + 1)
      .eq('year', now.getFullYear())
      .single()
    
    if (!budget) return
    
    // Calculate total expense for this category this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const { data: expenses } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('category_id', categoryId)
      .eq('type', 'expense')
      .gte('date', startOfMonth)
    
    const total = (expenses || []).reduce((s, e) => s + Number(e.amount), 0)
    const percentage = (total / Number(budget.amount)) * 100
    
    if (percentage >= 100) {
      toast.error(`⚠️ Budget kategori ini sudah melebihi batas!`, { duration: 5000 })
      useStore.getState().addNotification({
        type: 'warning',
        title: 'Budget Terlampaui',
        message: `Budget untuk kategori ini sudah 100% terpakai!`,
      })
    } else if (percentage >= 80) {
      toast('⚠️ Budget kategori ini sudah 80% terpakai!', { icon: '⚠️', duration: 4000 })
      useStore.getState().addNotification({
        type: 'warning',
        title: 'Budget Hampir Habis',
        message: `Budget sudah ${Math.round(percentage)}% terpakai.`,
      })
    }
  }

  return {
    transactions,
    categories,
    fetchTransactions,
    fetchCategories,
    createTransaction,
    editTransaction,
    deleteTransaction,
    uploadReceipt,
    getStats,
    getExpenseByCategory,
    getTrend,
    getWeeklyComparison,
  }
}
