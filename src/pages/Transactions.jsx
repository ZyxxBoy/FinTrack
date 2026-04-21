import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, Filter, ArrowUpDown, FileDown, Trash2, 
  Edit3, ChevronDown, X, Download
} from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import useStore from '../store/useStore'
import { formatCurrency } from '../utils/formatCurrency'
import { exportCSV } from '../utils/exportPDF'
import { generateReportPDF } from '../utils/exportPDF'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'

export default function Transactions() {
  const { transactions, categories, fetchTransactions, fetchCategories, deleteTransaction } = useTransactions()
  const { currency, openTransactionModal } = useStore()
  
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [page, setPage] = useState(1)
  const perPage = 20

  useEffect(() => {
    fetchTransactions()
    fetchCategories()
  }, [])

  const filtered = useMemo(() => {
    let result = [...transactions]
    
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(tx => 
        (tx.note && tx.note.toLowerCase().includes(q)) ||
        (tx.categories?.name && tx.categories.name.toLowerCase().includes(q))
      )
    }
    if (filterType) result = result.filter(tx => tx.type === filterType)
    if (filterCategory) result = result.filter(tx => tx.category_id === filterCategory)
    if (filterDateFrom) result = result.filter(tx => tx.date >= filterDateFrom)
    if (filterDateTo) result = result.filter(tx => tx.date <= filterDateTo)
    
    switch (sortBy) {
      case 'newest': result.sort((a, b) => b.date.localeCompare(a.date)); break
      case 'oldest': result.sort((a, b) => a.date.localeCompare(b.date)); break
      case 'largest': result.sort((a, b) => Number(b.amount) - Number(a.amount)); break
      case 'smallest': result.sort((a, b) => Number(a.amount) - Number(b.amount)); break
    }
    
    return result
  }, [transactions, search, filterType, filterCategory, filterDateFrom, filterDateTo, sortBy])

  const paginated = filtered.slice(0, page * perPage)
  const hasMore = paginated.length < filtered.length

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await deleteTransaction(deleteConfirm)
      setDeleteConfirm(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleExportCSV = () => {
    const exportData = filtered.map(tx => ({
      date: tx.date,
      type: tx.type,
      category: tx.categories?.name || '-',
      note: tx.note || '-',
      amount: tx.amount,
    }))
    exportCSV(exportData, currency)
    toast.success('CSV berhasil diexport! 📥')
  }

  const handleExportPDF = () => {
    const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    
    generateReportPDF({
      totalIncome,
      totalExpense,
      transactionCount: filtered.length,
      transactions: filtered.map(tx => ({
        date: tx.date,
        type: tx.type,
        category: tx.categories?.name || '-',
        note: tx.note || '-',
        amount: tx.amount,
      })),
    }, new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }), currency)
    toast.success('PDF berhasil diexport! 📄')
  }

  const clearFilters = () => {
    setSearch('')
    setFilterType('')
    setFilterCategory('')
    setFilterDateFrom('')
    setFilterDateTo('')
    setSortBy('newest')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">📋 Riwayat Transaksi</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} transaksi ditemukan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={Download} onClick={handleExportCSV}>CSV</Button>
          <Button variant="outline" size="sm" icon={FileDown} onClick={handleExportPDF}>PDF</Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl border transition-all ${
              showFilters ? 'bg-neon-green/10 border-neon-green/50 text-neon-green' : 'border-white/10 text-gray-400 hover:bg-white/5'
            }`}
          >
            <Filter size={20} />
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="glass-input w-auto min-w-[140px]"
          >
            <option value="newest" className="bg-dark-800">Terbaru</option>
            <option value="oldest" className="bg-dark-800">Terlama</option>
            <option value="largest" className="bg-dark-800">Terbesar</option>
            <option value="smallest" className="bg-dark-800">Terkecil</option>
          </select>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-white/5"
          >
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="glass-input"
            >
              <option value="" className="bg-dark-800">Semua Jenis</option>
              <option value="income" className="bg-dark-800">Pemasukan</option>
              <option value="expense" className="bg-dark-800">Pengeluaran</option>
              <option value="transfer" className="bg-dark-800">Transfer</option>
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="glass-input"
            >
              <option value="" className="bg-dark-800">Semua Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-dark-800">
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              placeholder="Dari tanggal"
              className="glass-input"
            />
            
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              placeholder="Sampai tanggal"
              className="glass-input"
            />
            
            <button onClick={clearFilters} className="text-sm text-neon-green hover:underline">
              Reset filter
            </button>
          </motion.div>
        )}
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {paginated.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-500 text-lg">Tidak ada transaksi ditemukan</p>
            <p className="text-gray-600 text-sm mt-2">Coba ubah filter atau tambah transaksi baru</p>
          </div>
        ) : (
          paginated.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.5) }}
              className="glass-card p-4 flex items-center gap-4 hover:bg-white/5 transition-all group"
            >
              {/* Icon */}
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${tx.categories?.color || '#666'}20` }}
              >
                {tx.categories?.icon || '💰'}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white truncate">
                    {tx.note || tx.categories?.name || 'Transaksi'}
                  </p>
                  {tx.is_recurring && (
                    <span className="text-[10px] bg-neon-purple/20 text-neon-purple px-2 py-0.5 rounded-full">
                      Berulang
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{tx.date}</span>
                  <span className="text-xs text-gray-600">•</span>
                  <span className="text-xs" style={{ color: tx.categories?.color || '#888' }}>
                    {tx.categories?.name || 'Tanpa kategori'}
                  </span>
                </div>
              </div>
              
              {/* Amount */}
              <div className="text-right flex-shrink-0">
                <p className={`font-bold ${
                  tx.type === 'income' ? 'text-green-400' : 
                  tx.type === 'expense' ? 'text-red-400' : 'text-blue-400'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                </p>
                <span className="text-[10px] text-gray-600 uppercase">{tx.type}</span>
              </div>
              
              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => openTransactionModal(tx)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(tx.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}

        {/* Load More */}
        {hasMore && (
          <div className="text-center pt-4">
            <Button variant="ghost" onClick={() => setPage(p => p + 1)}>
              Muat lebih banyak ({filtered.length - paginated.length} lagi)
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Hapus Transaksi?"
        size="sm"
      >
        <p className="text-gray-400 mb-6">
          Apakah kamu yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="flex-1">
            Batal
          </Button>
          <Button variant="danger" onClick={handleDelete} className="flex-1">
            Hapus
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}
