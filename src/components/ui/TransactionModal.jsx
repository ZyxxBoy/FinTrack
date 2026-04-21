import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Calendar, Tag, FileText, DollarSign, Image } from 'lucide-react'
import useStore from '../../store/useStore'
import { useTransactions } from '../../hooks/useTransactions'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { formatNumberInput, parseFormattedNumber } from '../../utils/formatCurrency'
import { suggestCategory } from '../../utils/helpers'

export default function TransactionModal() {
  const { showTransactionModal, closeTransactionModal, editingTransaction, categories } = useStore()
  const { createTransaction, editTransaction, uploadReceipt } = useTransactions()
  
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category_id: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
    receipt_url: '',
    is_recurring: false,
    recurring_interval: '',
  })
  const [receiptFile, setReceiptFile] = useState(null)
  const [suggestedCat, setSuggestedCat] = useState(null)

  useEffect(() => {
    if (editingTransaction) {
      setForm({
        type: editingTransaction.type,
        amount: String(editingTransaction.amount),
        category_id: editingTransaction.category_id || '',
        note: editingTransaction.note || '',
        date: editingTransaction.date,
        receipt_url: editingTransaction.receipt_url || '',
        is_recurring: editingTransaction.is_recurring || false,
        recurring_interval: editingTransaction.recurring_interval || '',
      })
    } else {
      setForm({
        type: 'expense',
        amount: '',
        category_id: '',
        note: '',
        date: new Date().toISOString().split('T')[0],
        receipt_url: '',
        is_recurring: false,
        recurring_interval: '',
      })
    }
    setReceiptFile(null)
    setSuggestedCat(null)
  }, [editingTransaction, showTransactionModal])

  const handleNoteChange = (e) => {
    const note = e.target.value
    setForm(prev => ({ ...prev, note }))
    
    const suggestion = suggestCategory(note)
    if (suggestion) {
      const matchCat = categories.find(c => c.name === suggestion && c.type === form.type)
      if (matchCat) {
        setSuggestedCat(matchCat)
      }
    } else {
      setSuggestedCat(null)
    }
  }

  const applySuggestion = () => {
    if (suggestedCat) {
      setForm(prev => ({ ...prev, category_id: suggestedCat.id }))
      setSuggestedCat(null)
    }
  }

  const filteredCategories = categories.filter(c => {
    if (form.type === 'income') return c.type === 'income'
    if (form.type === 'expense') return c.type === 'expense'
    return true
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || !form.date) return
    
    setLoading(true)
    try {
      let receipt_url = form.receipt_url
      if (receiptFile) {
        receipt_url = await uploadReceipt(receiptFile)
      }
      
      const txData = {
        type: form.type,
        amount: parseFormattedNumber(form.amount) || Number(form.amount),
        category_id: form.category_id || null,
        note: form.note,
        date: form.date,
        receipt_url,
        is_recurring: form.is_recurring,
        recurring_interval: form.is_recurring ? form.recurring_interval : null,
      }
      
      if (editingTransaction) {
        await editTransaction(editingTransaction.id, txData)
      } else {
        await createTransaction(txData)
      }
      
      closeTransactionModal()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Gagal menyimpan transaksi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {showTransactionModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeTransactionModal}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-full md:max-w-lg glass-card p-6 z-10 max-h-[90vh] overflow-y-auto rounded-t-3xl md:rounded-2xl"
          >
            {/* Handle bar (mobile) */}
            <div className="md:hidden w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4" />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-bold text-white">
                {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
              </h2>
              <button
                onClick={closeTransactionModal}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selector */}
              <div className="flex gap-2">
                {[
                  { value: 'expense', label: 'Pengeluaran', color: 'from-red-500 to-red-600' },
                  { value: 'income', label: 'Pemasukan', color: 'from-green-500 to-green-600' },
                  { value: 'transfer', label: 'Transfer', color: 'from-blue-500 to-blue-600' },
                ].map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, type: t.value, category_id: '' }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      form.type === t.value
                        ? `bg-gradient-to-r ${t.color} text-white shadow-lg`
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <Input
                label="Jumlah"
                icon={DollarSign}
                placeholder="0"
                value={form.amount}
                onChange={(e) => {
                  const formatted = formatNumberInput(e.target.value)
                  setForm(prev => ({ ...prev, amount: formatted }))
                }}
                required
              />

              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">Kategori</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                  {filteredCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, category_id: cat.id }))}
                      className={`flex flex-col items-center p-2.5 rounded-xl text-xs transition-all ${
                        form.category_id === cat.id
                          ? 'bg-neon-green/20 border border-neon-green/50 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <span className="text-lg mb-1">{cat.icon}</span>
                      <span className="truncate w-full text-center">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Smart Category Suggestion */}
              {suggestedCat && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-neon-purple/10 border border-neon-purple/30"
                >
                  <Tag size={16} className="text-neon-purple" />
                  <span className="text-sm text-gray-300">
                    Saran: <strong className="text-white">{suggestedCat.icon} {suggestedCat.name}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={applySuggestion}
                    className="ml-auto text-xs bg-neon-purple/20 text-neon-purple px-3 py-1 rounded-lg hover:bg-neon-purple/30"
                  >
                    Gunakan
                  </button>
                </motion.div>
              )}

              {/* Note */}
              <Input
                label="Catatan"
                icon={FileText}
                placeholder="Makan siang, bensin, dll..."
                value={form.note}
                onChange={handleNoteChange}
              />

              {/* Date */}
              <Input
                label="Tanggal"
                icon={Calendar}
                type="date"
                value={form.date}
                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                required
              />

              {/* Receipt Upload */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">Foto Struk (opsional)</label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/20 cursor-pointer hover:bg-white/5 transition-all">
                  <Image size={20} className="text-gray-500" />
                  <span className="text-sm text-gray-400">
                    {receiptFile ? receiptFile.name : 'Pilih gambar...'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              {/* Recurring */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_recurring}
                    onChange={(e) => setForm(prev => ({ ...prev, is_recurring: e.target.checked }))}
                    className="w-4 h-4 rounded bg-white/10 border-white/20 text-neon-green focus:ring-neon-green/50"
                  />
                  <span className="text-sm text-gray-300">Transaksi berulang</span>
                </label>
              </div>

              {form.is_recurring && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-300">Interval</label>
                    <select
                      value={form.recurring_interval}
                      onChange={(e) => setForm(prev => ({ ...prev, recurring_interval: e.target.value }))}
                      className="glass-input"
                    >
                      <option value="" className="bg-dark-800">Pilih interval</option>
                      <option value="daily" className="bg-dark-800">Harian</option>
                      <option value="weekly" className="bg-dark-800">Mingguan</option>
                      <option value="monthly" className="bg-dark-800">Bulanan</option>
                      <option value="yearly" className="bg-dark-800">Tahunan</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeTransactionModal}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="flex-1"
                >
                  {editingTransaction ? 'Simpan' : 'Tambah'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
