import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Target, Plus, Trash2, TrendingUp, AlertTriangle, PiggyBank, Calendar } from 'lucide-react'
import { useBudget } from '../hooks/useBudget'
import { useTransactions } from '../hooks/useTransactions'
import useStore from '../store/useStore'
import { formatCurrency } from '../utils/formatCurrency'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card3D from '../components/3d/Card3D'
import toast from 'react-hot-toast'

export default function Budget() {
  const { currency } = useStore()
  const { categories, fetchCategories } = useTransactions()
  const { 
    budgets, savingsGoals, fetchBudgets, createBudget, deleteBudget, 
    getBudgetUsage, fetchSavingsGoals, createSavingsGoal, updateSavingsGoal, deleteSavingsGoal 
  } = useBudget()

  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showAddSavings, setShowAddSavings] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [budgetForm, setBudgetForm] = useState({ category_id: '', amount: '' })
  const [goalForm, setGoalForm] = useState({ title: '', target_amount: '', deadline: '', icon: '🎯' })
  const [addAmount, setAddAmount] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchBudgets(selectedMonth, selectedYear)
    fetchSavingsGoals()
  }, [selectedMonth, selectedYear])

  const expenseCategories = categories.filter(c => c.type === 'expense')
  
  const totalBudget = budgets.reduce((s, b) => s + Number(b.amount), 0)
  const totalSpent = budgets.reduce((s, b) => s + getBudgetUsage(b).spent, 0)

  const handleCreateBudget = async (e) => {
    e.preventDefault()
    if (!budgetForm.category_id || !budgetForm.amount) return
    setLoading(true)
    try {
      await createBudget({
        category_id: budgetForm.category_id,
        amount: Number(budgetForm.amount),
        month: selectedMonth,
        year: selectedYear,
      })
      setShowBudgetModal(false)
      setBudgetForm({ category_id: '', amount: '' })
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleCreateGoal = async (e) => {
    e.preventDefault()
    if (!goalForm.title || !goalForm.target_amount) return
    setLoading(true)
    try {
      await createSavingsGoal({
        title: goalForm.title,
        target_amount: Number(goalForm.target_amount),
        deadline: goalForm.deadline || null,
        icon: goalForm.icon,
      })
      setShowGoalModal(false)
      setGoalForm({ title: '', target_amount: '', deadline: '', icon: '🎯' })
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleAddSavings = async () => {
    if (!showAddSavings || !addAmount) return
    setLoading(true)
    try {
      const goal = savingsGoals.find(g => g.id === showAddSavings)
      if (goal) {
        await updateSavingsGoal(showAddSavings, {
          current_amount: Number(goal.current_amount) + Number(addAmount),
        })
      }
      setShowAddSavings(null)
      setAddAmount('')
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">🎯 Budget & Target</h1>
          <p className="text-gray-400 text-sm mt-1">Kelola anggaran dan target tabunganmu</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="glass-input w-auto"
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1} className="bg-dark-800">{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="glass-input w-auto"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y} className="bg-dark-800">{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card3D>
          <p className="text-sm text-gray-400">Total Budget</p>
          <p className="text-2xl font-heading font-bold text-neon-green mt-2">
            {formatCurrency(totalBudget, currency)}
          </p>
        </Card3D>
        <Card3D glowColor="rgba(239, 68, 68, 0.15)">
          <p className="text-sm text-gray-400">Total Terpakai</p>
          <p className="text-2xl font-heading font-bold text-red-400 mt-2">
            {formatCurrency(totalSpent, currency)}
          </p>
        </Card3D>
        <Card3D glowColor="rgba(124, 58, 237, 0.15)">
          <p className="text-sm text-gray-400">Sisa Budget</p>
          <p className="text-2xl font-heading font-bold text-neon-purple mt-2">
            {formatCurrency(Math.max(0, totalBudget - totalSpent), currency)}
          </p>
        </Card3D>
      </div>

      {/* Budget List */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-heading font-semibold text-white">
            💰 Budget per Kategori
          </h3>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowBudgetModal(true)}>
            Tambah
          </Button>
        </div>

        {budgets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target size={40} className="mx-auto mb-3 opacity-50" />
            <p>Belum ada budget untuk bulan ini</p>
            <p className="text-sm mt-1">Klik tombol Tambah untuk memulai</p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const usage = getBudgetUsage(budget)
              const isWarning = usage.percentage >= 80
              const isOver = usage.percentage >= 100
              
              return (
                <div key={budget.id} className="p-4 rounded-xl bg-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{budget.categories?.icon || '📦'}</span>
                      <div>
                        <p className="font-medium text-white">{budget.categories?.name || 'Kategori'}</p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(usage.spent, currency)} / {formatCurrency(budget.amount, currency)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isWarning && (
                        <AlertTriangle size={16} className={isOver ? 'text-red-400' : 'text-yellow-400'} />
                      )}
                      <span className={`text-sm font-bold ${
                        isOver ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-neon-green'
                      }`}>
                        {Math.round(usage.percentage)}%
                      </span>
                      <button
                        onClick={() => deleteBudget(budget.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="progress-bar">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(usage.percentage, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="progress-bar-fill"
                      style={{
                        background: isOver
                          ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                          : isWarning
                          ? 'linear-gradient(90deg, #FBBF24, #F59E0B)'
                          : 'linear-gradient(90deg, #00FF88, #00CC6A)',
                      }}
                    />
                  </div>
                  
                  {usage.remaining > 0 && (
                    <p className="text-xs text-gray-500">
                      Sisa: {formatCurrency(usage.remaining, currency)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Savings Goals */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-heading font-semibold text-white">
            🐷 Target Tabungan
          </h3>
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => setShowGoalModal(true)}>
            Tambah
          </Button>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <PiggyBank size={40} className="mx-auto mb-3 opacity-50" />
            <p>Belum ada target tabungan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savingsGoals.map((goal) => {
              const progress = goal.target_amount > 0 
                ? (Number(goal.current_amount) / Number(goal.target_amount)) * 100 
                : 0
              
              return (
                <div key={goal.id} className="p-4 rounded-xl bg-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{goal.icon || '🎯'}</span>
                      <div>
                        <p className="font-medium text-white">{goal.title}</p>
                        {goal.deadline && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(goal.deadline).toLocaleDateString('id-ID')}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteSavingsGoal(goal.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {formatCurrency(goal.current_amount, currency)}
                    </span>
                    <span className="text-white font-medium">
                      {formatCurrency(goal.target_amount, currency)}
                    </span>
                  </div>
                  
                  <div className="progress-bar">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.8 }}
                      className="progress-bar-fill bg-gradient-to-r from-neon-purple to-neon-green"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{Math.round(progress)}% tercapai</span>
                    <button
                      onClick={() => setShowAddSavings(goal.id)}
                      className="text-xs bg-neon-green/10 text-neon-green px-3 py-1.5 rounded-lg hover:bg-neon-green/20 transition-all"
                    >
                      + Tambah Tabungan
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Budget Modal */}
      <Modal isOpen={showBudgetModal} onClose={() => setShowBudgetModal(false)} title="Tambah Budget" size="sm">
        <form onSubmit={handleCreateBudget} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">Kategori</label>
            <select
              value={budgetForm.category_id}
              onChange={(e) => setBudgetForm(prev => ({ ...prev, category_id: e.target.value }))}
              className="glass-input"
              required
            >
              <option value="" className="bg-dark-800">Pilih kategori</option>
              {expenseCategories.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-dark-800">
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Jumlah Budget"
            type="number"
            placeholder="1000000"
            value={budgetForm.amount}
            onChange={(e) => setBudgetForm(prev => ({ ...prev, amount: e.target.value }))}
            required
          />
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setShowBudgetModal(false)} className="flex-1">
              Batal
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Goal Modal */}
      <Modal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} title="Target Tabungan Baru" size="sm">
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <Input
            label="Nama Target"
            placeholder="Dana darurat, Liburan, dll..."
            value={goalForm.title}
            onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          <Input
            label="Target Jumlah"
            type="number"
            placeholder="10000000"
            value={goalForm.target_amount}
            onChange={(e) => setGoalForm(prev => ({ ...prev, target_amount: e.target.value }))}
            required
          />
          <Input
            label="Deadline (opsional)"
            type="date"
            value={goalForm.deadline}
            onChange={(e) => setGoalForm(prev => ({ ...prev, deadline: e.target.value }))}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {['🎯', '🏠', '🚗', '✈️', '💻', '📱', '💍', '🎓', '🏥', '💰'].map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setGoalForm(prev => ({ ...prev, icon }))}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center ${
                    goalForm.icon === icon ? 'bg-neon-green/20 border border-neon-green/50' : 'bg-white/5'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setShowGoalModal(false)} className="flex-1">
              Batal
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Savings Modal */}
      <Modal isOpen={!!showAddSavings} onClose={() => setShowAddSavings(null)} title="Tambah Tabungan" size="sm">
        <div className="space-y-4">
          <Input
            label="Jumlah"
            type="number"
            placeholder="100000"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
          />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowAddSavings(null)} className="flex-1">
              Batal
            </Button>
            <Button onClick={handleAddSavings} loading={loading} className="flex-1">
              Simpan
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}
