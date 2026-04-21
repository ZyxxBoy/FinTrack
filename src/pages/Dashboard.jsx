import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Flame, Lightbulb, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card3D from '../components/3d/Card3D'
import TrendLineChart from '../components/charts/LineChart'
import DonutChart from '../components/charts/DonutChart'
import WeeklyBarChart from '../components/charts/BarChart'
import { useTransactions } from '../hooks/useTransactions'
import useStore from '../store/useStore'
import { formatCurrency } from '../utils/formatCurrency'
import { getGreeting, getRandomTip, calculateHealthScore, getHealthLabel } from '../utils/helpers'

export default function Dashboard() {
  const { profile, currency, streak } = useStore()
  const { transactions, fetchTransactions, fetchCategories, getStats, getExpenseByCategory, getTrend, getWeeklyComparison } = useTransactions()
  const navigate = useNavigate()

  useEffect(() => {
    fetchTransactions()
    fetchCategories()
  }, [])

  const stats = useMemo(() => getStats(), [transactions])
  const expenseByCategory = useMemo(() => getExpenseByCategory(), [transactions])
  const trend = useMemo(() => getTrend(30), [transactions])
  const weekly = useMemo(() => getWeeklyComparison(), [transactions])
  const tip = useMemo(() => getRandomTip(), [])

  const savingsRate = stats.totalIncome > 0 ? (stats.savings / stats.totalIncome) * 100 : 0
  const healthScore = calculateHealthScore(stats.totalIncome, stats.totalExpense, savingsRate, streak)
  const healthLabel = getHealthLabel(healthScore)

  const statCards = [
    {
      title: 'Total Pemasukan',
      value: formatCurrency(stats.totalIncome, currency),
      icon: TrendingUp,
      color: '#00FF88',
      bgGlow: 'rgba(0, 255, 136, 0.15)',
    },
    {
      title: 'Total Pengeluaran',
      value: formatCurrency(stats.totalExpense, currency),
      icon: TrendingDown,
      color: '#EF4444',
      bgGlow: 'rgba(239, 68, 68, 0.15)',
    },
    {
      title: 'Saldo',
      value: formatCurrency(stats.balance, currency),
      icon: Wallet,
      color: '#7C3AED',
      bgGlow: 'rgba(124, 58, 237, 0.15)',
    },
    {
      title: 'Tabungan Bulan Ini',
      value: formatCurrency(stats.savings, currency),
      icon: PiggyBank,
      color: '#00D4FF',
      bgGlow: 'rgba(0, 212, 255, 0.15)',
    },
  ]

  const recentTransactions = transactions.slice(0, 5)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Greeting */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-white">
            {getGreeting()}, {profile?.name || 'User'}! 👋
          </h1>
          <p className="text-gray-400 mt-1">Ini ringkasan keuangan bulan ini</p>
        </div>
        
        {/* Health Score & Streak */}
        <div className="flex items-center gap-4">
          {streak > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30">
              <Flame size={18} className="text-orange-400" />
              <span className="text-sm text-orange-300 font-medium">{streak} hari streak!</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: `${healthLabel.color}15`, borderColor: `${healthLabel.color}30`, borderWidth: '1px' }}>
            <span className="text-lg">{healthLabel.emoji}</span>
            <div>
              <div className="text-xs text-gray-400">Skor Keuangan</div>
              <div className="text-sm font-bold" style={{ color: healthLabel.color }}>{healthScore}/100</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card3D key={i} glowColor={card.bgGlow}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400">{card.title}</p>
                <p className="text-xl md:text-2xl font-heading font-bold mt-2" style={{ color: card.color }}>
                  {card.value}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: card.bgGlow }}>
                <card.icon size={22} style={{ color: card.color }} />
              </div>
            </div>
          </Card3D>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold text-white mb-4">
            📈 Tren Keuangan 30 Hari
          </h3>
          <TrendLineChart data={trend} />
        </motion.div>

        {/* Donut Chart */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold text-white mb-4">
            🍩 Distribusi Pengeluaran
          </h3>
          <DonutChart data={expenseByCategory} />
        </motion.div>
      </div>

      {/* Bar Chart */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-lg font-heading font-semibold text-white mb-4">
          📊 Pemasukan vs Pengeluaran per Minggu
        </h3>
        <WeeklyBarChart data={weekly} />
      </motion.div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-heading font-semibold text-white">
              🕐 Transaksi Terbaru
            </h3>
            <button
              onClick={() => navigate('/transactions')}
              className="text-sm text-neon-green hover:underline flex items-center gap-1"
            >
              Lihat semua <ArrowRight size={14} />
            </button>
          </div>
          
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Belum ada transaksi</p>
              <p className="text-sm mt-1">Klik tombol + untuk menambah</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: `${tx.categories?.color || '#666'}20` }}>
                    {tx.categories?.icon || '💰'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {tx.note || tx.categories?.name || 'Transaksi'}
                    </p>
                    <p className="text-xs text-gray-500">{tx.date}</p>
                  </div>
                  <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Financial Tip */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold text-white mb-4">
            <Lightbulb size={20} className="inline mr-2 text-yellow-400" />
            Tip Keuangan Hari Ini
          </h3>
          <div className="p-4 rounded-xl bg-gradient-to-br from-neon-green/5 to-neon-purple/5 border border-white/5">
            <p className="text-gray-300 leading-relaxed text-lg">{tip}</p>
          </div>

          {/* Quick Add Shortcuts */}
          <h4 className="text-sm font-semibold text-gray-400 mt-6 mb-3">⚡ Quick Add</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '🍔 Makan', amount: 25000 },
              { label: '🚗 Transport', amount: 15000 },
              { label: '☕ Kopi', amount: 30000 },
              { label: '🛒 Belanja', amount: 50000 },
            ].map((shortcut, i) => (
              <button
                key={i}
                onClick={() => {
                  useStore.getState().openTransactionModal()
                }}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-all text-left"
              >
                <div>{shortcut.label}</div>
                <div className="text-xs text-gray-500 mt-1">{formatCurrency(shortcut.amount, currency)}</div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
