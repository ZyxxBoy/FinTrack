import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileDown, TrendingUp, TrendingDown, Calendar, PieChart } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import useStore from '../store/useStore'
import { formatCurrency } from '../utils/formatCurrency'
import { generateReportPDF } from '../utils/exportPDF'
import Button from '../components/ui/Button'
import TrendLineChart from '../components/charts/LineChart'
import DonutChart from '../components/charts/DonutChart'
import WeeklyBarChart from '../components/charts/BarChart'
import toast from 'react-hot-toast'

export default function Reports() {
  const { currency } = useStore()
  const { transactions, fetchTransactions, getTrend, getWeeklyComparison } = useTransactions()
  
  const [period, setPeriod] = useState('monthly') // monthly | yearly
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchTransactions()
  }, [])

  const filteredTx = useMemo(() => {
    return transactions.filter(tx => {
      const date = new Date(tx.date)
      if (period === 'monthly') {
        return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear
      }
      return date.getFullYear() === selectedYear
    })
  }, [transactions, period, selectedMonth, selectedYear])

  const stats = useMemo(() => {
    const totalIncome = filteredTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const totalExpense = filteredTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    const balance = totalIncome - totalExpense
    
    // Rata-rata pengeluaran harian (kasar 30 hari)
    const daysInPeriod = period === 'monthly' ? new Date(selectedYear, selectedMonth, 0).getDate() : 365
    const avgExpense = totalExpense / daysInPeriod

    // Hari paling boros
    const byDate = {}
    filteredTx.filter(t => t.type === 'expense').forEach(tx => {
      byDate[tx.date] = (byDate[tx.date] || 0) + Number(tx.amount)
    })
    const maxDate = Object.keys(byDate).sort((a, b) => byDate[b] - byDate[a])[0]
    
    // Kategori terbesar
    const byCat = {}
    filteredTx.filter(t => t.type === 'expense').forEach(tx => {
      const cat = tx.categories?.name || 'Lainnya'
      byCat[cat] = (byCat[cat] || 0) + Number(tx.amount)
    })
    const maxCat = Object.keys(byCat).sort((a, b) => byCat[b] - byCat[a])[0]

    return { totalIncome, totalExpense, balance, avgExpense, maxDate, maxDateAmount: byDate[maxDate], maxCat, maxCatAmount: byCat[maxCat], count: filteredTx.length }
  }, [filteredTx])

  const expenseByCategory = useMemo(() => {
    const byCat = {}
    filteredTx.filter(t => t.type === 'expense').forEach(tx => {
      const name = tx.categories?.name || 'Lainnya'
      if (!byCat[name]) {
        byCat[name] = { 
          name, 
          color: tx.categories?.color || '#666', 
          icon: tx.categories?.icon || '📦',
          amount: 0 
        }
      }
      byCat[name].amount += Number(tx.amount)
    })
    return Object.values(byCat).sort((a, b) => b.amount - a.amount)
  }, [filteredTx])

  const trendData = useMemo(() => {
    if (period === 'monthly') {
      const days = new Date(selectedYear, selectedMonth, 0).getDate()
      const result = []
      for (let i = 1; i <= days; i++) {
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`
        const dayTx = filteredTx.filter(t => t.date === dateStr)
        result.push({
          label: i.toString(),
          income: dayTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
          expense: dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
        })
      }
      return result
    } else {
      const result = []
      for (let i = 1; i <= 12; i++) {
        const monthTx = filteredTx.filter(t => new Date(t.date).getMonth() + 1 === i)
        result.push({
          label: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'][i-1],
          income: monthTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
          expense: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
        })
      }
      return result
    }
  }, [filteredTx, period, selectedMonth, selectedYear])

  const handleExport = () => {
    const periodStr = period === 'monthly' 
      ? `${['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][selectedMonth-1]} ${selectedYear}`
      : `Tahun ${selectedYear}`
      
    generateReportPDF({
      totalIncome: stats.totalIncome,
      totalExpense: stats.totalExpense,
      transactionCount: stats.count,
      transactions: filteredTx.map(tx => ({
        date: tx.date,
        type: tx.type,
        category: tx.categories?.name || '-',
        note: tx.note || '-',
        amount: tx.amount,
      })),
    }, periodStr, currency)
    
    toast.success('Laporan PDF berhasil di-generate! 📄')
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
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">📊 Laporan & Analitik</h1>
          <p className="text-gray-400 text-sm mt-1">Ringkasan aktivitas keuanganmu</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${period === 'monthly' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setPeriod('yearly')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${period === 'yearly' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
            >
              Tahunan
            </button>
          </div>
          
          {period === 'monthly' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="glass-input w-auto text-sm py-2"
            >
              {months.map((m, i) => <option key={i} value={i + 1} className="bg-dark-800">{m}</option>)}
            </select>
          )}
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="glass-input w-auto text-sm py-2"
          >
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y} className="bg-dark-800">{y}</option>)}
          </select>

          <Button variant="outline" size="sm" icon={FileDown} onClick={handleExport}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-400"><TrendingUp size={20} /></div>
            <p className="text-sm text-gray-400">Total Pemasukan</p>
          </div>
          <p className="text-xl font-bold text-white">{formatCurrency(stats.totalIncome, currency)}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400"><TrendingDown size={20} /></div>
            <p className="text-sm text-gray-400">Total Pengeluaran</p>
          </div>
          <p className="text-xl font-bold text-white">{formatCurrency(stats.totalExpense, currency)}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><PieChart size={20} /></div>
            <p className="text-sm text-gray-400">Rata-rata/Hari</p>
          </div>
          <p className="text-xl font-bold text-white">{formatCurrency(stats.avgExpense, currency)}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Calendar size={20} /></div>
            <p className="text-sm text-gray-400">Total Transaksi</p>
          </div>
          <p className="text-xl font-bold text-white">{stats.count}</p>
        </div>
      </div>

      {/* Custom Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.maxCat && (
          <div className="glass-card p-4 border border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
            <p className="text-sm text-gray-400 mb-1">Kategori Pengeluaran Terbesar</p>
            <p className="text-lg font-bold text-red-400">{stats.maxCat}</p>
            <p className="text-sm text-gray-500">{formatCurrency(stats.maxCatAmount, currency)}</p>
          </div>
        )}
        {stats.maxDate && (
          <div className="glass-card p-4 border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
            <p className="text-sm text-gray-400 mb-1">Hari Paling Boros</p>
            <p className="text-lg font-bold text-orange-400">{new Date(stats.maxDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
            <p className="text-sm text-gray-500">{formatCurrency(stats.maxDateAmount, currency)}</p>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold text-white mb-4">
            📈 Tren {period === 'monthly' ? 'Harian' : 'Bulanan'}
          </h3>
          <TrendLineChart data={trendData} />
        </div>

        {/* Donut Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold text-white mb-4">
            🍩 Distribusi Berdasarkan Kategori
          </h3>
          {expenseByCategory.length > 0 ? (
             <DonutChart data={expenseByCategory} />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
              Tidak ada data pengeluaran
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
