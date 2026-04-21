import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import toast from 'react-hot-toast'

export function useBudget() {
  const { user } = useStore()
  const { budgets, setBudgets, savingsGoals, setSavingsGoals, transactions } = useStore()

  const fetchBudgets = useCallback(async (month, year) => {
    if (!user) return
    
    const m = month || new Date().getMonth() + 1
    const y = year || new Date().getFullYear()
    
    const { data, error } = await supabase
      .from('budgets')
      .select(`*, categories(name, icon, color)`)
      .eq('user_id', user.id)
      .eq('month', m)
      .eq('year', y)
    
    if (data) setBudgets(data)
    return data || []
  }, [user])

  const createBudget = useCallback(async (budgetData) => {
    if (!user) return
    
    // Check if budget already exists for this category/month
    const { data: existing } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', user.id)
      .eq('category_id', budgetData.category_id)
      .eq('month', budgetData.month)
      .eq('year', budgetData.year)
      .single()
    
    if (existing) {
      // Update existing budget
      const { data, error } = await supabase
        .from('budgets')
        .update({ amount: budgetData.amount })
        .eq('id', existing.id)
        .select(`*, categories(name, icon, color)`)
        .single()
      
      if (error) throw error
      await fetchBudgets(budgetData.month, budgetData.year)
      toast.success('Budget berhasil diperbarui! 💰')
      return data
    }
    
    const { data, error } = await supabase
      .from('budgets')
      .insert({ ...budgetData, user_id: user.id })
      .select(`*, categories(name, icon, color)`)
      .single()
    
    if (error) {
      toast.error('Gagal membuat budget')
      throw error
    }
    
    await fetchBudgets(budgetData.month, budgetData.year)
    toast.success('Budget berhasil dibuat! 🎯')
    return data
  }, [user])

  const deleteBudget = useCallback(async (id) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id)
    if (error) throw error
    setBudgets(budgets.filter(b => b.id !== id))
    toast.success('Budget berhasil dihapus')
  }, [budgets])

  const getBudgetUsage = useCallback((budget) => {
    if (!budget) return { spent: 0, percentage: 0 }
    
    const now = new Date()
    const startOfMonth = new Date(budget.year, budget.month - 1, 1).toISOString().split('T')[0]
    const endOfMonth = new Date(budget.year, budget.month, 0).toISOString().split('T')[0]
    
    const spent = transactions
      .filter(tx => 
        tx.type === 'expense' && 
        tx.category_id === budget.category_id &&
        tx.date >= startOfMonth && 
        tx.date <= endOfMonth
      )
      .reduce((sum, tx) => sum + Number(tx.amount), 0)
    
    const percentage = budget.amount > 0 ? (spent / Number(budget.amount)) * 100 : 0
    
    return { spent, percentage: Math.min(percentage, 100), remaining: Math.max(0, Number(budget.amount) - spent) }
  }, [transactions])

  // Savings Goals
  const fetchSavingsGoals = useCallback(async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (data) setSavingsGoals(data)
    return data || []
  }, [user])

  const createSavingsGoal = useCallback(async (goalData) => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('savings_goals')
      .insert({ ...goalData, user_id: user.id })
      .select()
      .single()
    
    if (error) {
      toast.error('Gagal membuat target tabungan')
      throw error
    }
    
    setSavingsGoals([data, ...savingsGoals])
    toast.success('Target tabungan berhasil dibuat! 🎯')
    return data
  }, [user, savingsGoals])

  const updateSavingsGoal = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('savings_goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    setSavingsGoals(savingsGoals.map(g => g.id === id ? data : g))
    toast.success('Target tabungan diperbarui! 💪')
    return data
  }, [savingsGoals])

  const deleteSavingsGoal = useCallback(async (id) => {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id)
    if (error) throw error
    setSavingsGoals(savingsGoals.filter(g => g.id !== id))
    toast.success('Target tabungan dihapus')
  }, [savingsGoals])

  return {
    budgets,
    savingsGoals,
    fetchBudgets,
    createBudget,
    deleteBudget,
    getBudgetUsage,
    fetchSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
  }
}
