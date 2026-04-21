import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, ArrowLeftRight, PieChart, Target, 
  BarChart3, User, LogOut, X, Wallet
} from 'lucide-react'
import useStore from '../../store/useStore'
import { useAuth } from '../../hooks/useAuth'

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/transactions', icon: ArrowLeftRight, label: 'Transaksi' },
  { path: '/budget', icon: Target, label: 'Budget & Target' },
  { path: '/reports', icon: BarChart3, label: 'Laporan' },
  { path: '/profile', icon: User, label: 'Profil' },
]

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useStore()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/auth')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-neon-purple flex items-center justify-center">
          <Wallet size={22} className="text-dark-900" />
        </div>
        <div>
          <h1 className="text-xl font-heading font-bold text-gradient">FinTrack</h1>
          <p className="text-xs text-gray-500">Smart Finance</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 mt-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={20} />
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="sidebar-desktop hidden md:block fixed left-0 top-0 h-screen w-64 glass-card border-r border-white/5 z-40">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 h-screen w-64 glass-card z-50 md:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-gray-400"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
