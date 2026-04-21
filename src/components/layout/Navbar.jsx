import { Menu, Bell, Sun, Moon } from 'lucide-react'
import useStore from '../../store/useStore'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const { toggleSidebar, isDark, toggleTheme, profile, notifications } = useStore()
  const [showNotifs, setShowNotifs] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="sticky top-0 z-30 glass-card border-b border-white/5 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Mobile Menu */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 text-gray-400"
        >
          <Menu size={22} />
        </button>

        {/* Spacer for desktop */}
        <div className="hidden md:block" />

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 glass-card p-4 max-h-80 overflow-y-auto"
                >
                  <h3 className="text-sm font-semibold text-white mb-3">Notifikasi</h3>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Belum ada notifikasi</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.slice(0, 10).map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 rounded-lg text-sm ${
                            notif.read ? 'bg-white/5' : 'bg-neon-green/5 border border-neon-green/20'
                          }`}
                        >
                          <p className="font-medium text-white">{notif.title}</p>
                          <p className="text-gray-400 text-xs mt-1">{notif.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-green to-neon-purple flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-dark-900">
                {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
