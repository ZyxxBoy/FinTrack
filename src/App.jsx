import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useStore from './store/useStore'
import { useAuth } from './hooks/useAuth'

// Layouts
import Sidebar from './components/layout/Sidebar'
import Navbar from './components/layout/Navbar'
import FAB from './components/layout/FAB'
import TransactionModal from './components/ui/TransactionModal'

// Pages
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budget from './pages/Budget'
import Reports from './pages/Reports'
import Profile from './pages/Profile'

function ProtectedRoute({ children }) {
  const { user } = useStore()
  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return (
    <div className="min-h-screen bg-dark-bg transition-colors duration-300">
      <div className="gradient-mesh-bg" />
      <Sidebar />
      <div className="md:ml-64 flex flex-col min-h-screen relative z-10 transition-all duration-300">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-x-hidden">
          {children}
        </main>
      </div>
      <FAB />
      <TransactionModal />
    </div>
  )
}

function App() {
  const { loading } = useAuth()
  const { user, initTheme, initCurrency } = useStore()

  useEffect(() => {
    initTheme()
    initCurrency()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/budget" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster 
        position="top-center" 
        toastOptions={{
          className: 'glass-card text-white border border-white/10',
          style: {
            background: 'rgba(18, 18, 26, 0.9)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#00FF88',
              secondary: '#12121A',
            },
          },
        }} 
      />
    </>
  )
}

export default App
