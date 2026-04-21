import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import useStore from '../../store/useStore'

export default function FAB() {
  const { openTransactionModal } = useStore()

  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => openTransactionModal()}
      className="fab-button"
      title="Tambah Transaksi"
    >
      <Plus size={28} className="text-dark-900" />
    </motion.button>
  )
}
